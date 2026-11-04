// Read-only probe: lists tools, searches, and dumps RAW responses so parsers can be fitted to real shapes.
// Usage: BITREFILL_API_KEY=... npx tsx scripts/bitrefill-check.mts "esim thailand" TH
import { BitrefillShop } from "../src/server/bitrefill";

const key = process.env.BITREFILL_API_KEY;
if (!key) { console.error("Set BITREFILL_API_KEY (bitrefill.com/account/developers)"); process.exit(1); }
const shop = new BitrefillShop(key);
const [query = "esim thailand", country = "TH"] = process.argv.slice(2);

const search = await shop.callTool("search-products", { query, intent: `buy ${query}`, country, per_page: 5 });
console.log("--- search-products RAW ---\n" + search.slice(0, 3000));
const slug = process.argv[4] ?? (await import("../src/server/bitrefill")).extractSlugs(search)[0];
if (slug) {
  console.log(`\n--- get-product-details(${slug}) RAW ---`);
  console.log((await shop.callTool("get-product-details", { product_id: slug, currency: "USD" })).slice(0, 3000));
}
console.log("\nNo purchase was made.");
