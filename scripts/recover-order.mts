// Completes an order that was paid but timed out waiting for delivery (state needs_review).
// Never buys again: it only reads the existing invoice, sends the reply memo and records the result.
// Usage: npx tsx --env-file=.env.local scripts/recover-order.mts <orderId> <invoiceId>
import { runtime } from "../src/server/runtime";

const [orderId, invoiceId] = process.argv.slice(2);
if (!orderId || !invoiceId) throw new Error("usage: recover-order.mts <orderId> <invoiceId>");
const rt = runtime();
const { store, shop, wallet } = rt.deps;
const o = store.get(orderId);
if (!o || !o.replyTo) throw new Error("order or reply address not found");
const f = await shop.getFulfillment({ invoiceId, payMethod: "balance", payAddress: "", payAmount: "", priceUsd: o.priceUsd ?? 0 });
if (f.status !== "complete" || !f.code) throw new Error(`invoice not complete: ${f.status}`);
store.transition(orderId, "fulfilled", "code received (recovered)");
const body = `WS1 OK\nitem: ${o.product}\nspent: ${(o.priceUsd ?? 0).toFixed(2)} USD\ncode: ${f.code}${f.instructions ? `\n${f.instructions}` : ""}`.slice(0, 500);
const txid = await wallet.sendMemo(o.replyTo, body);
store.transition(orderId, "replied", `whisper sent: ${txid}`);
console.log(`reply txid: ${txid}`);
