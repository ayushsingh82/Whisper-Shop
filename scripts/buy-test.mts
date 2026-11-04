// Real small purchase from Bitrefill account balance, run through the same BitrefillShop the agent uses.
// Spends real store credit. Usage: npx tsx --env-file=.env.local scripts/buy-test.mts "esim thailand" TH 4
import { BitrefillShop } from "../src/server/bitrefill";
import { pickCheapest } from "../src/server/policy";

const key = process.env.BITREFILL_API_KEY;
if (!key) throw new Error("Set BITREFILL_API_KEY");
const [query = "esim thailand", country = "TH", max = "4"] = process.argv.slice(2);
const shop = new BitrefillShop(key);
const order = { query, kind: "esim" as const, country, maxUsd: Number(max), replyTo: "n/a" };

const found = await shop.search(order);
console.log("candidates:", found.map((c) => `${c.name} $${c.priceUsd}`));
const pick = pickCheapest(found, order.maxUsd);
if (!pick) throw new Error("nothing within max");
console.log("buying:", pick.name, `$${pick.priceUsd}`, "from account balance");
const inv = await shop.createInvoice(pick, "balance");
console.log("invoice:", inv.invoiceId);
for (let i = 0; i < 20; i++) {
  const f = await shop.getFulfillment(inv);
  console.log("fulfilment:", f.status);
  if (f.status !== "pending") { console.log(f.status === "complete" ? "code received (redacted):" : "failed", f.code ? f.code.slice(0, 12) + "…" : ""); break; }
  await new Promise((r) => setTimeout(r, 5000));
}
