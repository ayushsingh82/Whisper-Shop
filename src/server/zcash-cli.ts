import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { IncomingMemo, Wallet } from "./types";

const run = promisify(execFile);

export interface ZcashCliConfig {
  /** Path to the zcash-devtool binary. */
  bin: string;
  /** Wallet data directory (created with `wallet -w <dir> init`). */
  walletDir: string;
  /** Server alias or URI passed to `-s` (the devtool docs use the alias `zecrocks`). */
  server: string;
  /** age identity file that decrypts the mnemonic; required to spend. */
  identity: string;
}

/**
 * Wallet backed by zcash-devtool.
 *
 * Flags come from the tool's source: `wallet -w <dir> sync -s <server>`, `wallet -w <dir> list-tx`,
 * and `wallet -w <dir> send -i <identity> --address <a> --value <zats> --memo <text> -s <server>`.
 * The devtool warns it "can and will change at any time", and it is not for significant funds.
 * Memo text formatting in `list-tx` output is verified by `scripts/wallet-check.mts` against the real binary.
 */
export class ZcashCliWallet implements Wallet {
  private seen = new Set<string>();
  constructor(private cfg: ZcashCliConfig) {}

  private async exec(args: string[]): Promise<string> {
    const { stdout } = await run(this.cfg.bin, args, { maxBuffer: 10 * 1024 * 1024, timeout: 180_000 });
    return stdout;
  }

  async sync(): Promise<void> {
    await this.exec(["wallet", "-w", this.cfg.walletDir, "sync", "-s", this.cfg.server]);
    // Compact blocks carry no memos: `enhance` fetches the full transactions so memos can be decrypted.
    await this.exec(["wallet", "-w", this.cfg.walletDir, "enhance", "-s", this.cfg.server]);
  }

  async listTxText(): Promise<string> {
    return this.exec(["wallet", "-w", this.cfg.walletDir, "list-tx"]);
  }

  async poll(): Promise<IncomingMemo[]> {
    await this.sync();
    const fresh = parseListTx(await this.listTxText()).filter((m) => !this.seen.has(`${m.txid}:${m.outputIndex}`));
    for (const m of fresh) this.seen.add(`${m.txid}:${m.outputIndex}`);
    return fresh;
  }

  async sendMemo(to: string, memo: string, amountZatoshi: bigint = 10_000n): Promise<string> {
    if (Buffer.byteLength(memo) > 512) throw new Error("memo exceeds 512 bytes");
    const out = await this.exec([
      "wallet", "-w", this.cfg.walletDir, "send",
      "-i", this.cfg.identity,
      "--address", to,
      "--value", amountZatoshi.toString(),
      "--memo", memo,
      "-s", this.cfg.server,
    ]);
    // The tool prints "Creating transaction...", "Sending transaction...", then the txid.
    const txid = [...out.matchAll(/\b[0-9a-f]{64}\b/gi)].pop()?.[0];
    if (!txid) throw new Error(`could not read txid from send output: ${out.slice(0, 200)}`);
    return txid;
  }
}

/** "0.05000000" -> 5000000n without floating point. */
export function zecToZatoshi(zec: string): bigint {
  const m = /^(\d+)(?:\.(\d{0,8}))?/.exec(zec.trim());
  if (!m) return 0n;
  return BigInt(m[1]) * 100_000_000n + BigInt((m[2] ?? "").padEnd(8, "0"));
}

/** Undo Rust `{:?}` string escaping for a text memo: Text("a\nb") -> a<newline>b. */
export function parseMemoField(raw: string): string | undefined {
  const t = raw.trim();
  const m = /^(?:Memo::)?(?:Text\()?"((?:[^"\\]|\\.)*)"\)?$/.exec(t);
  if (!m) return undefined; // Empty, Future(..), Arbitrary(..) and anything unrecognised are ignored
  return m[1].replace(/\\(n|r|t|"|\\|0)/g, (_s, c: string) => ({ n: "\n", r: "\r", t: "\t", '"': '"', "\\": "\\", "0": "\0" })[c] ?? c);
}

/**
 * Parses `wallet list-tx` text output into incoming memos.
 * Format (from list_tx.rs): a txid line, then per output `Output N (pool)`, `Value: <zec>`,
 * `Received by account: ...` (present when we received it), `To: <addr>`, `Memo: <debug string>`.
 * Only outputs received by the wallet with a readable text memo are returned.
 */
export function parseListTx(out: string): IncomingMemo[] {
  const res: IncomingMemo[] = [];
  let txid: string | undefined;
  let outIdx = -1;
  let value = 0n;
  let received = false;
  const lines = out.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^[0-9a-f]{64}$/i.test(t)) { txid = t; outIdx = -1; continue; }
    const o = /^Output (\d+)\b/.exec(t);
    if (o) { outIdx = Number(o[1]); value = 0n; received = false; continue; }
    if (outIdx < 0 || !txid) continue;
    const v = /^Value:\s*([\d.]+)/.exec(t);
    if (v) { value = zecToZatoshi(v[1]); continue; }
    if (t.startsWith("Received by account")) { received = true; continue; }
    const mm = /^Memo:\s*(.*)$/.exec(t);
    if (mm && received) {
      // Text memos print with real newlines, so one memo can span several lines until the closing `")`.
      let raw = mm[1];
      while (/^(?:Memo::)?Text\("/.test(raw) && !/"\)\s*$/.test(raw) && i + 1 < lines.length) raw += "\n" + lines[++i];
      const memo = parseMemoField(raw);
      if (memo) res.push({ txid, outputIndex: outIdx, amountZatoshi: value, memo });
    }
  }
  return res;
}
