// Sends plain testnet ZEC from the buyer wallet to the shop wallet so the shop can pay reply-memo fees.
// Usage: npx tsx scripts/fund-shop.mts [zec=0.1]
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { ZcashCliWallet } from "../src/server/zcash-cli";

const base = `${homedir()}/.whisper-shop`;
const bin = process.env.ZCASH_DEVTOOL_BIN ?? "zcash-devtool";
const out = execFileSync(bin, ["wallet", "-w", `${base}/shop`, "list-addresses"], { encoding: "utf8" });
const shopAddr = /Default Address:\s*(\S+)/.exec(out)?.[1];
if (!shopAddr) throw new Error("no shop address");
const zats = BigInt(Math.round(Number(process.argv[2] ?? "0.1") * 1e8));
const buyer = new ZcashCliWallet({ bin, walletDir: `${base}/buyer`, identity: `${base}/buyer.key`, server: process.env.ZCASH_SERVER ?? "zecrocks" });
await buyer.sync();
console.log(`funding txid: ${await buyer.sendMemo(shopAddr, "WS1 fund", zats)}`);
