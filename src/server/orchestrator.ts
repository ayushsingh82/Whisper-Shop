import { checkCandidate, checkOrder, pickCheapest, zatoshiToUsd } from "./policy";
import { isError, parseMemo } from "./parser";
import type { Store } from "./store";
import type { IncomingMemo, Policy, Shop, Swapper, Wallet } from "./types";

export interface Deps { wallet: Wallet; shop: Shop; swapper: Swapper; store: Store; policy: Policy; payMethod: string; fulfilmentPolls?: number; sleep?: (ms: number) => Promise<void> }

const WS = "WS1";

/** Handles one incoming memo end to end. Never throws: every failure ends in a refund/review state. */
export async function handleMemo(d: Deps, m: IncomingMemo): Promise<void> {
  const id = `${m.txid}:${m.outputIndex}`;
  if (d.store.has(id)) return; // idempotent: same note is never processed twice
  d.store.create({ id, memo: m.memo, amountZatoshi: m.amountZatoshi.toString() });
  const fail = async (state: "rejected" | "needs_review" | "refunded", reason: string, replyTo?: string) => {
    d.store.transition(id, state, reason, { note: reason });
    if (replyTo) {
      // Refund memo carries the reason. The actual ZEC return is a separate, explicit step.
      await d.wallet.sendMemo(replyTo, `${WS} REFUND\nreason: ${reason}`).catch(() => undefined);
    }
  };
  try {
    const parsed = parseMemo(m.memo);
    if (isError(parsed)) return void (await fail("rejected", parsed.error));
    d.store.transition(id, "parsed", `${parsed.kind} ${parsed.country ?? ""} max ${parsed.maxUsd} USD`, { replyTo: parsed.replyTo });

    const gate = checkOrder(d.policy, parsed, d.store.spentTodayUsd());
    if (!gate.ok) return void (await fail("refunded", gate.reason, parsed.replyTo));
    d.store.transition(id, "validated", "policy ok");

    const paidUsd = zatoshiToUsd(m.amountZatoshi, d.policy.zecUsd);
    const pick = pickCheapest(await d.shop.search(parsed), Math.min(parsed.maxUsd, paidUsd));
    if (!pick) return void (await fail("refunded", "no product found within your max and payment", parsed.replyTo));
    const cand = checkCandidate(d.policy, parsed, pick, paidUsd);
    if (!cand.ok) return void (await fail("refunded", cand.reason, parsed.replyTo));
    d.store.transition(id, "quoted", `${pick.name} ${pick.priceUsd} USD`, { product: pick.name, priceUsd: pick.priceUsd });

    const inv = await d.shop.createInvoice(pick, d.payMethod);
    d.store.transition(id, "invoiced", inv.invoiceId, { invoiceId: inv.invoiceId });

    // Payment steps are never auto-retried: a throw here means needs_review, not another attempt.
    const swap = await d.swapper.swapAndPay(inv, m.amountZatoshi);
    d.store.transition(id, "swapped", swap.ref, { swapRef: swap.ref });
    d.store.transition(id, "paid", "invoice funded");

    const sleep = d.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    for (let i = 0; i < (d.fulfilmentPolls ?? 30); i++) {
      const f = await d.shop.getFulfillment(inv);
      if (f.status === "failed") return void (await fail("needs_review", "invoice paid but fulfilment failed; do not re-buy", parsed.replyTo));
      if (f.status === "complete" && f.code) {
        d.store.transition(id, "fulfilled", "code received");
        const body = `${WS} OK\nitem: ${pick.name}\nspent: ${pick.priceUsd.toFixed(2)} USD\ncode: ${f.code}${f.instructions ? `\n${f.instructions}` : ""}`;
        await d.wallet.sendMemo(parsed.replyTo, body.slice(0, 500));
        d.store.transition(id, "replied", "whisper sent");
        return;
      }
      await sleep(15_000);
    }
    await fail("needs_review", "fulfilment timed out after payment", parsed.replyTo);
  } catch (e) {
    await fail("needs_review", `error: ${(e as Error).message}`, d.store.get(id)?.replyTo);
  }
}

export async function tick(d: Deps): Promise<number> {
  const incoming = await d.wallet.poll();
  for (const m of incoming) await handleMemo(d, m);
  return incoming.length;
}
