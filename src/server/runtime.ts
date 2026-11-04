import { BitrefillShop } from "./bitrefill";
import { BalanceSwapper, MockShop, MockSwapper, MockWallet } from "./mocks";
import { handleMemo, type Deps } from "./orchestrator";
import { Store } from "./store";
import type { Wallet } from "./types";
import { ZcashCliWallet } from "./zcash-cli";

/** Process-wide runtime. SIMULATED adapters until the real wallet, Bitrefill key and swap are wired. */
export interface AdapterStatus {
  wallet: "simulated" | "live";
  shop: "simulated" | "live";
  swap: "simulated" | "live" | "balance";
}

const g = globalThis as unknown as { __ws?: { deps: Deps; wallet: Wallet; n: number; adapters: AdapterStatus } };

export function runtime() {
  if (!g.__ws) {
    const dir = process.env.WHISPER_WALLET_DIR;
    const identity = process.env.WHISPER_IDENTITY;
    const wallet: Wallet =
      dir && identity
        ? new ZcashCliWallet({ bin: process.env.ZCASH_DEVTOOL_BIN ?? "zcash-devtool", walletDir: dir, identity, server: process.env.ZCASH_SERVER ?? "zecrocks" })
        : new MockWallet();
    const key = process.env.BITREFILL_API_KEY;
    // Only the adapters that are really wired report "live". Swap is skipped: with a key Bitrefill is paid from account balance.
    const adapters: AdapterStatus = {
      wallet: wallet instanceof ZcashCliWallet ? "live" : "simulated",
      shop: key ? "live" : "simulated",
      swap: key ? "balance" : "simulated", // with a key, Bitrefill is paid from account balance (no swap leg)
    };
    g.__ws = {
      wallet,
      n: 0,
      adapters,
      deps: {
        wallet,
        shop: key ? new BitrefillShop(key) : new MockShop(),
        swapper: key ? new BalanceSwapper() : new MockSwapper(),
        store: new Store(".data/orders.json"),
        policy: { maxOrderUsd: 20, dailyCapUsd: 50, allowedKinds: ["esim", "topup", "giftcard"], zecUsd: 400 },
        payMethod: key ? "balance" : "litecoin",
        fulfilmentPolls: key ? 30 : 3, // real shops take seconds to deliver; the mock is instant
        sleep: (ms) => new Promise((r) => setTimeout(r, key ? ms : Math.min(ms, 700))),
      },
    };
  }
  return g.__ws;
}

export async function simulate(memo: string, zatoshi: bigint) {
  const rt = runtime();
  rt.n += 1;
  const txid = `sim${Date.now()}${rt.n}`;
  const run = handleMemo(rt.deps, { txid, outputIndex: 0, amountZatoshi: zatoshi, memo });
  return { id: `${txid}:0`, run };
}
