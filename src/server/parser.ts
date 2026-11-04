import type { ParsedOrder } from "./types";

const COUNTRIES: Record<string, string> = {
  thailand: "TH", india: "IN", japan: "JP", usa: "US", us: "US", uk: "GB", singapore: "SG", indonesia: "ID", vietnam: "VN", uae: "AE",
};

/**
 * Deterministic memo parser for the WS1 format. Free text without WS1 is rejected here;
 * an LLM may normalize it upstream, but its output must pass through this same validator.
 */
export function parseMemo(memo: string): ParsedOrder | { error: string } {
  const lines = memo.replace(/\0+$/g, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines[0]?.toUpperCase() !== "WS1") return { error: "memo must start with WS1" };
  const f: Record<string, string> = {};
  for (const l of lines.slice(1)) {
    const i = l.indexOf(":");
    if (i > 0) f[l.slice(0, i).toLowerCase()] = l.slice(i + 1).trim();
  }
  const query = f.buy;
  if (!query) return { error: "missing 'buy:' line" };
  const maxMatch = /^(\d+(?:\.\d+)?)\s*usd$/i.exec(f.max ?? "");
  if (!maxMatch) return { error: "missing or invalid 'max:' (example: max: 12 USD)" };
  const replyTo = f.reply;
  if (!replyTo || !/^u(test)?1[a-z0-9]{10,}$/i.test(replyTo)) return { error: "missing or invalid 'reply:' unified address" };

  const q = query.toLowerCase();
  const kind: ParsedOrder["kind"] = /esim/.test(q) ? "esim" : /top-?up|recharge/.test(q) ? "topup" : /gift|card/.test(q) ? "giftcard" : "unknown";
  const country = Object.entries(COUNTRIES).find(([name]) => new RegExp(`\\b${name}\\b`).test(q))?.[1];
  return { query, kind, country, maxUsd: Number(maxMatch[1]), replyTo };
}

export const isError = (x: ParsedOrder | { error: string }): x is { error: string } => "error" in x;
