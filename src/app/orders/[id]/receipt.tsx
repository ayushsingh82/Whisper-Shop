"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  state: string;
  memo: string;
  amountZatoshi: string;
  product?: string;
  priceUsd?: number;
  invoiceId?: string;
  swapRef?: string;
  note?: string;
  createdAt: string;
  events: { ts: string; state: string; detail: string }[];
}

const DISCLOSURE: [string, string][] = [
  ["Chain observers", "Nothing. Payment, memo and reply are shielded."],
  ["Shop operator", "The full order and the reply."],
  ["Bitrefill", "The invoice and its payment. Not your Zcash address."],
  ["Swap provider", "The swap from ZEC to the invoice asset."],
];

export function Receipt({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const r = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
      if (!live) return;
      if (r.status === 404) return setMissing(true);
      setOrder(((await r.json()) as { order: Order }).order);
    };
    load();
    const t = setInterval(load, 2000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [id]);

  if (missing) return <p className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">Order not found.</p>;
  if (!order) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Receipt</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{order.product ?? "Order"}</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{order.id}</p>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border text-sm">
        {[
          ["State", order.state],
          ["Paid", `${(Number(order.amountZatoshi) / 1e8).toFixed(4)} ZEC`],
          ["Price", order.priceUsd != null ? `$${order.priceUsd.toFixed(2)}` : "n/a"],
          ["Bitrefill invoice", order.invoiceId ?? "n/a"],
          ["Swap reference", order.swapRef ?? "n/a"],
          ["Created", new Date(order.createdAt).toLocaleString()],
        ].map(([k, v]) => (
          <div key={k} className="bg-card p-4">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
            <dd className="mt-1 break-all">{v}</dd>
          </div>
        ))}
      </dl>
      {order.note && <p className="rounded-lg border border-red-400/30 p-3 text-sm text-muted-foreground">{order.note}</p>}

      <section>
        <h2 className="font-display text-xl font-semibold">Who saw what</h2>
        <div className="mt-3 overflow-hidden rounded-xl border bg-card">
          {DISCLOSURE.map(([who, what], i) => (
            <div key={who} className={`flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:justify-between ${i ? "border-t" : ""}`}>
              <span className="font-medium">{who}</span>
              <span className="text-muted-foreground">{what}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Timeline</h2>
        <ol className="mt-3 space-y-1.5 border-l pl-4">
          {order.events.map((e, i) => (
            <li key={i} className="relative text-xs text-muted-foreground">
              <span className="absolute -left-[21px] top-1.5 size-1.5 rounded-full bg-accent" />
              <span className="font-mono text-foreground">{e.state}</span> · {e.detail}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
