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
  // real zcash-devtool output prefixes the enum name
  assert.equal(parseMemoField('Memo::Text("WS1\\nbuy: esim")'), "WS1\nbuy: esim");
  assert.equal(parseMemoField("Memo::Empty"), undefined);
  assert.equal(parseMemoField("Arbitrary([0, 1])"), undefined);
});

test("parseListTx returns only received text memos", () => {
  const got = parseListTx(SAMPLE);
  assert.equal(got.length, 1);
  assert.equal(got[0].txid, TXID);
  assert.equal(got[0].amountZatoshi, 5_000_000n);
  assert.match(got[0].memo, /^WS1\nbuy: esim/);
});

test("parseListTx reads a text memo that spans several lines", () => {
  const out = [
    "3d9fc0248a35bf2fc88da224139a333256a886f37bd1f75ae31362fa2a1d74d3",
    "  Output 0 (Ironwood)",
    "    Value:   0.02000000 TAZ",
    "    Received by account: abc (whisper-shop)",
    '    Memo: Memo::Text("WS1',
    "buy: esim thailand 1gb 7d",
    "max: 4 USD",
    'reply: utest1abc")',
  ].join("\n");
  const r = parseListTx(out);
  assert.equal(r.length, 1);
  assert.equal(r[0].memo, "WS1\nbuy: esim thailand 1gb 7d\nmax: 4 USD\nreply: utest1abc");
  assert.equal(r[0].amountZatoshi, 2_000_000n);
});
