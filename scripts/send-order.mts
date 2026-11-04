// Places a REAL testnet order: the buyer wallet sends shielded ZEC with a WS1 memo to the shop wallet.
// Usage: npx tsx scripts/send-order.mts "esim thailand 5gb 7d" 12 [zec=0.05]
// Needs ~/.whisper-shop/{buyer,shop} wallets (see src/md/SETUP.md) and testnet funds in the buyer wallet.
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { ZcashCliWallet } from "../src/server/zcash-cli";

const base = process.env.WHISPER_HOME ?? `${homedir()}/.whisper-shop`;
const bin = process.env.ZCASH_DEVTOOL_BIN ?? "zcash-devtool";
const [item, maxUsd = "12", zec = "0.05"] = process.argv.slice(2);
if (!item) { console.error('Usage: send-order.mts "<item>" <maxUsd> [zec]'); process.exit(1); }

const defaultAddress = (wallet: string): string => {
  const out = execFileSync(bin, ["wallet", "-w", `${base}/${wallet}`, "list-addresses"], { encoding: "utf8" });
  const a = /Default Address:\s*(\S+)/.exec(out)?.[1];
  if (!a) throw new Error(`no address found for ${wallet}`);
  return a;
};

const shopAddr = defaultAddress("shop");
const buyerAddr = defaultAddress("buyer");
const memo = `WS1\nbuy: ${item}\nmax: ${maxUsd} USD\nreply: ${buyerAddr}`;
const bytes = Buffer.byteLength(memo);
if (bytes > 512) { console.error(`memo is ${bytes} bytes, limit is 512`); process.exit(1); }

const zats = BigInt(Math.round(Number(zec) * 1e8));
console.log(`order: ${item}, max ${maxUsd} USD, paying ${zec} ZEC, memo ${bytes}/512 bytes`);

const buyer = new ZcashCliWallet({ bin, walletDir: `${base}/buyer`, identity: `${base}/buyer.key`, server: process.env.ZCASH_SERVER ?? "zecrocks" });
await buyer.sync();
const txid = await buyer.sendMemo(shopAddr, memo, zats);
console.log(`sent. testnet txid: ${txid}`);
