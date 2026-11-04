import { MockShop, MockSwapper, MockWallet } from "./mocks";
import { handleMemo, type Deps } from "./orchestrator";
import { Store } from "./store";

/** Process-wide runtime. SIMULATED adapters until the real wallet, Bitrefill key and swap are wired. */
const g = globalThis as unknown as { __ws?: { deps: Deps; wallet: MockWallet; n: number } };

export function runtime() {
  if (!g.__ws) {
    const wallet = new MockWallet();
    g.__ws = {
      wallet,
      n: 0,
      deps: {
        wallet,
        shop: new MockShop(),
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
  await handleMemo(rt.deps, { txid: `sim${Date.now()}${rt.n}`, outputIndex: 0, amountZatoshi: zatoshi, memo });
}
