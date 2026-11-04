import type { Candidate, ParsedOrder, Policy } from "./types";

export type Decision = { ok: true } | { ok: false; reason: string };

/** Deterministic gate. The LLM never calls this with authority; it only supplies the order. */
export function checkOrder(p: Policy, o: ParsedOrder, spentTodayUsd: number): Decision {
  if (!p.allowedKinds.includes(o.kind)) return { ok: false, reason: `category '${o.kind}' not allowed` };
  if (o.maxUsd > p.maxOrderUsd) return { ok: false, reason: `max ${o.maxUsd} USD exceeds per-order cap ${p.maxOrderUsd} USD` };
  if (spentTodayUsd + o.maxUsd > p.dailyCapUsd) return { ok: false, reason: "daily cap would be exceeded" };
  return { ok: true };
}

export function checkCandidate(p: Policy, o: ParsedOrder, c: Candidate, paidUsd: number): Decision {
  if (c.priceUsd > o.maxUsd) return { ok: false, reason: `price ${c.priceUsd} USD exceeds your max ${o.maxUsd} USD` };
  if (c.priceUsd > p.maxOrderUsd) return { ok: false, reason: "price exceeds per-order cap" };
  if (c.priceUsd > paidUsd) return { ok: false, reason: `payment worth ${paidUsd.toFixed(2)} USD does not cover ${c.priceUsd} USD` };
  return { ok: true };
}

export const zatoshiToUsd = (z: bigint, zecUsd: number) => (Number(z) / 1e8) * zecUsd;

export function pickCheapest(cs: Candidate[], maxUsd: number): Candidate | undefined {
  return cs.filter((c) => c.priceUsd <= maxUsd).sort((a, b) => a.priceUsd - b.priceUsd)[0];
}
