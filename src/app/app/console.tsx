"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  state: string;
  memo: string;
  product?: string;
  priceUsd?: number;
  note?: string;
  createdAt: string;
  events: { ts: string; state: string; detail: string }[];
}
interface Payload {
  mode: string;
  orders: Order[];
  replies: { to: string; memo: string }[];
}

const SAMPLE = `WS1\nbuy: esim thailand 5gb 7d\nmax: 12 USD\nreply: utest1abcdefghijklmnop`;
const GOOD = new Set(["replied", "fulfilled", "paid"]);
const BAD = new Set(["rejected", "refunded", "needs_review"]);

export function Console() {
  const [memo, setMemo] = useState(SAMPLE);
  const [zec, setZec] = useState(0.05);
  const [data, setData] = useState<Payload>({ mode: "simulated", orders: [], replies: [] });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const r = await fetch("/api/orders", { cache: "no-store" });
        if (live) setData(await r.json());
      } catch {
        /* retry on the next tick */
      }
    };
    load();
    const t = setInterval(load, 1500);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, []);

  async function send() {
    setBusy(true);
    await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo, zec }),
    });
    setBusy(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4">
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-3 text-xs text-muted-foreground">
          <b className="text-accent">Simulated mode.</b> Wallet, Bitrefill and swap are mocks. The parser, policy
          engine and state machine are the real code.
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Incoming shielded note</p>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={6}
            maxLength={512}
            className="mt-3 w-full resize-none rounded-lg border bg-muted p-3 font-mono text-[13px] outline-none focus:border-accent/60"
          />
          <label className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            ZEC sent
            <input
              type="number"
              step="0.01"
              min="0"
              value={zec}
              onChange={(e) => setZec(Number(e.target.value))}
              className="w-24 rounded-lg border bg-muted px-2 py-1 text-right font-mono text-foreground outline-none focus:border-accent/60"
            />
          </label>
          <button
            onClick={send}
            disabled={busy}
            className="mt-4 w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Send memo
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Try max: 50 USD (over the cap) or 0.001 ZEC (underpaid) to see refunds.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {data.orders.length === 0 && (
          <p className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            No orders yet. Send a memo.
          </p>
        )}
        {data.orders.map((o) => (
          <article key={o.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 22)}</p>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
                  GOOD.has(o.state) && "border-emerald-400/40 text-emerald-300",
                  BAD.has(o.state) && "border-red-400/40 text-red-300",
                  !GOOD.has(o.state) && !BAD.has(o.state) && "text-accent",
                )}
              >
                {o.state}
              </span>
            </div>
            <p className="mt-2 text-sm">
              {o.product ? `${o.product} · $${o.priceUsd?.toFixed(2)}` : (o.note ?? "processing")}
            </p>
            <ol className="mt-4 space-y-1.5 border-l pl-4">
              {o.events.map((e, i) => (
                <li key={i} className="relative text-xs text-muted-foreground">
                  <span className="absolute -left-[21px] top-1.5 size-1.5 rounded-full bg-accent" />
                  <span className="font-mono text-foreground">{e.state}</span> · {e.detail}
                </li>
              ))}
            </ol>
          </article>
        ))}
        {data.replies.length > 0 && (
          <div className="rounded-xl border bg-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Shielded replies sent
            </p>
            {data.replies
              .slice()
              .reverse()
              .map((r, i) => (
                <pre key={i} className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[12px] leading-relaxed">
                  {r.memo}
                </pre>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
