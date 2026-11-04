import type { OrderRow as Order } from "@/server/store";
import seed from "@/data/orders.seed.json";
import proof from "@/data/proof.json";

/** Real testnet orders we completed, shown on deployments (e.g. Vercel) where the live store starts empty. */
const SEED = seed as unknown as Order[];

export function withSeed(live: Order[]): Order[] {
  const ids = new Set(live.map((o) => o.id));
  return [...live, ...SEED.filter((o) => !ids.has(o.id))];
}

export function seedOrder(id: string): Order | undefined {
  return SEED.find((o) => o.id === id);
}

/** Recorded shielded replies (the eSIM link itself is only ever in the memo, so it is not stored here). */
export function seedReplies(): { to: string; memo: string }[] {
  const tx = (label: string) => proof.txs.find((t) => t.label === label)?.txid ?? "";
  return SEED.filter((o) => o.state === "replied" && o.replyTo).map((o) => ({
    to: o.replyTo as string,
    memo: `Whisper Shop: your order is ready.\n${o.product ?? "eSIM"}\nThe redemption link was delivered inside this shielded memo.\nreply txid: ${tx(o.id.startsWith("c158") ? "Reply (unassisted run)" : "Reply (first run)")}`,
  }));
}
