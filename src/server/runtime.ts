import { BitrefillShop } from "./bitrefill";
import { MockShop, MockSwapper, MockWallet } from "./mocks";
import { handleMemo, type Deps } from "./orchestrator";
import { Store } from "./store";

/** Process-wide runtime. SIMULATED adapters until the real wallet, Bitrefill key and swap are wired. */
export interface AdapterStatus {
  wallet: "simulated" | "live";
  shop: "simulated" | "live";
  swap: "simulated" | "live";
}

const g = globalThis as unknown as { __ws?: { deps: Deps; wallet: MockWallet; n: number; adapters: AdapterStatus } };

export function runtime() {
  if (!g.__ws) {
    const wallet = new MockWallet();
    const key = process.env.BITREFILL_API_KEY;
    // Only the adapters that are really wired report "live". Wallet and swap stay simulated until implemented.
    const adapters: AdapterStatus = { wallet: "simulated", shop: key ? "live" : "simulated", swap: "simulated" };
    g.__ws = {
      wallet,
      n: 0,
      adapters,
      deps: {
        wallet,
        shop: key ? new BitrefillShop(key) : new MockShop(),
        swapper: new MockSwapper(),
        store: new Store(".data/orders.json"),
        policy: { maxOrderUsd: 20, dailyCapUsd: 50, allowedKinds: ["esim", "topup", "giftcard"], zecUsd: 400 },
        payMethod: "litecoin",
        fulfilmentPolls: 3,
        sleep: (ms) => new Promise((r) => setTimeout(r, Math.min(ms, 700))),
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
