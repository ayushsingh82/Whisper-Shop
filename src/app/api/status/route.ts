import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { connection } from "next/server";
import { BitrefillShop } from "@/server/bitrefill";
import { runtime } from "@/server/runtime";
import { ZcashCliWallet } from "@/server/zcash-cli";
import proof from "@/data/proof.json";

interface WalletInfo { address: string; totalZec: number; spendableZec: number }
interface Status {
  height: number | null;
  shop: WalletInfo | null;
  buyer: WalletInfo | null;
  bitrefillUsd: number | null;
}

// Wallet addresses and balances are read from the real wallets at request time (nothing is hardcoded),
// and cached briefly so the console's polling never hammers the wallet CLI or Bitrefill's rate limit.
let cache: { at: number; value: Status } | undefined;

async function describe(w: ZcashCliWallet): Promise<WalletInfo & { height: number }> {
  const [address, b] = await Promise.all([w.defaultAddress(), w.balance()]);
  return { address: address ?? "", totalZec: b.totalZec, spendableZec: b.spendableZec, height: b.height };
}

export async function GET() {
  await connection();
  if (cache && Date.now() - cache.at < 20_000) return Response.json(cache.value);
  const rt = runtime();
  const value: Status = { height: null, shop: null, buyer: null, bitrefillUsd: null };
  try {
    // Duck-typed: in dev, hot reloads can leave the cached wallet as an instance of an older copy of the class.
    if (typeof (rt.wallet as Partial<ZcashCliWallet>).defaultAddress === "function") {
      const shop = await describe(rt.wallet as ZcashCliWallet);
      value.shop = { address: shop.address, totalZec: shop.totalZec, spendableZec: shop.spendableZec };
      value.height = shop.height;
      // The buyer wallet exists only on the machine that runs the demo.
      const home = process.env.WHISPER_HOME ?? `${homedir()}/.whisper-shop`;
      if (existsSync(`${home}/buyer`)) {
        const buyer = await describe(new ZcashCliWallet({ bin: process.env.ZCASH_DEVTOOL_BIN ?? "zcash-devtool", walletDir: `${home}/buyer`, identity: `${home}/buyer.key`, server: process.env.ZCASH_SERVER ?? "zecrocks" }));
        value.buyer = { address: buyer.address, totalZec: buyer.totalZec, spendableZec: buyer.spendableZec };
      }
    }
    if (typeof (rt.deps.shop as Partial<BitrefillShop>).callTool === "function") {
      const t = await (rt.deps.shop as BitrefillShop).callTool("get-balances", { currency: "USD" });
      const m = /amount:\s*"([\d.]+)"/.exec(t);
      if (m) value.bitrefillUsd = Number(m[1]);
    }
  } catch (e) {
    console.error("status: partial data:", (e as Error).message.slice(0, 200)); // partial data is fine: the console shows what it has
  }
  // Deployed demo (no wallet binary): show the last recorded snapshot of the real testnet wallets.
  if (!value.shop) {
    const w = proof.wallets;
    value.shop = w.shop;
    value.buyer = w.buyer;
    value.height = w.height;
  }
  cache = { at: Date.now(), value };
  return Response.json(value);
}
