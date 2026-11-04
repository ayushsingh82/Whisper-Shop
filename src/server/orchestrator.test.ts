import { test } from "node:test";
import assert from "node:assert/strict";
import { handleMemo } from "./orchestrator";
import { MockShop, MockSwapper, MockWallet } from "./mocks";
import { Store } from "./store";
import type { Policy } from "./types";

const policy: Policy = { maxOrderUsd: 20, dailyCapUsd: 50, allowedKinds: ["esim", "topup", "giftcard"], zecUsd: 400 };
const ADDR = "utest1abcdefghijklmnop";
const memo = (max = 12) => `WS1\nbuy: esim thailand 5gb 7d\nmax: ${max} USD\nreply: ${ADDR}`;
const setup = () => {
  const wallet = new MockWallet();
  const d = { wallet, shop: new MockShop(), swapper: new MockSwapper(), store: new Store(), policy, payMethod: "litecoin", sleep: async () => {} };
  return { wallet, d };
};
const m = (memoText: string, tx = "tx1", z = 5_000_000n) => ({ txid: tx, outputIndex: 0, amountZatoshi: z, memo: memoText });

test("happy path: memo in, whisper out with code", async () => {
  const { wallet, d } = setup();
  await handleMemo(d, m(memo()));
  assert.equal(d.store.get("tx1:0")?.state, "replied");
  assert.match(wallet.sent[0].memo, /^WS1 OK[\s\S]*LPA:1\$/);
});

test("over per-order cap is refunded with reason", async () => {
  const { wallet, d } = setup();
  await handleMemo(d, m(memo(50)));
  assert.equal(d.store.get("tx1:0")?.state, "refunded");
  assert.match(wallet.sent[0].memo, /REFUND[\s\S]*per-order cap/);
});

test("underpayment is refunded", async () => {
  const { d } = setup();
  await handleMemo(d, m(memo(), "tx2", 100_000n)); // 0.001 ZEC ~ 0.40 USD
  assert.equal(d.store.get("tx2:0")?.state, "refunded");
});

test("same note is never processed twice", async () => {
  const { wallet, d } = setup();
  await handleMemo(d, m(memo()));
  await handleMemo(d, m(memo()));
  assert.equal(wallet.sent.length, 1);
});

test("garbage memo is rejected, no reply address so no whisper", async () => {
  const { wallet, d } = setup();
  await handleMemo(d, m("hello"));
  assert.equal(d.store.get("tx1:0")?.state, "rejected");
  assert.equal(wallet.sent.length, 0);
});
