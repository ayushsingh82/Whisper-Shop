import { test } from "node:test";
import assert from "node:assert/strict";
import { parseListTx, parseMemoField, zecToZatoshi } from "./zcash-cli";

// FIXTURE CONSTRUCTED FROM zcash-devtool list_tx.rs, not captured from a real run.
// Replace with real output once the binary has produced some.
const TXID = "a".repeat(64);
const SAMPLE = `Transactions:
${TXID}
     Mined: 3000123 (2026-11-04 06:30:00 UTC)
    Amount: 0.05000000
  Fee paid: 0.00010000
  Sent 0 notes, received 1 notes, 1 memos
  Output 0 (Orchard)
    Value: 0.05000000
    Received by account: 11111111-1111-1111-1111-111111111111
    To: utest1abc
    Memo: Text("WS1\\nbuy: esim thailand 5gb 7d\\nmax: 12 USD\\nreply: utest1abcdefghijklmnop")
${"b".repeat(64)}
  Output 0 (Orchard)
    Value: 0.00010000
    Sent from account: 11111111-1111-1111-1111-111111111111
    To: utest1xyz
    Memo: Text("sent by us, ignore")
`;

test("zecToZatoshi is exact", () => {
  assert.equal(zecToZatoshi("0.05000000"), 5_000_000n);
  assert.equal(zecToZatoshi("1.5"), 150_000_000n);
  assert.equal(zecToZatoshi("0.00000001"), 1n);
});

test("memo field unescapes Rust debug strings and skips non-text", () => {
  assert.equal(parseMemoField('Text("a\\nb")'), "a\nb");
  assert.equal(parseMemoField("Empty"), undefined);
  assert.equal(parseMemoField("Arbitrary([0, 1])"), undefined);
});

test("parseListTx returns only received text memos", () => {
  const got = parseListTx(SAMPLE);
  assert.equal(got.length, 1);
  assert.equal(got[0].txid, TXID);
  assert.equal(got[0].amountZatoshi, 5_000_000n);
  assert.match(got[0].memo, /^WS1\nbuy: esim/);
});
