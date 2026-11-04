"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft, ArrowUpRight, CheckCircle2, LayoutDashboard, ListChecks, Menu, MessageSquareLock,
  Plug, Receipt, SendHorizontal, ShieldAlert, X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand";
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
  adapters: { wallet: string; shop: string; swap: string };
  orders: Order[];
  replies: { to: string; memo: string }[];
}

type View = "overview" | "orders" | "new" | "replies" | "integrations";

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ListChecks },
  { id: "new", label: "New order", icon: SendHorizontal },
  { id: "replies", label: "Shielded replies", icon: MessageSquareLock },
  { id: "integrations", label: "Integrations", icon: Plug },
];

const SAMPLE = `WS1\nbuy: esim thailand 5gb 7d\nmax: 12 USD\nreply: utest1abcdefghijklmnop`;
const PRESETS: { label: string; memo: string; zec: number }[] = [
  { label: "Valid order", memo: SAMPLE, zec: 0.05 },
  { label: "Over the cap", memo: SAMPLE.replace("max: 12 USD", "max: 50 USD"), zec: 0.05 },
  { label: "Underpaid", memo: SAMPLE, zec: 0.001 },
];

const GOOD = new Set(["replied", "fulfilled", "paid"]);
const BAD = new Set(["rejected", "refunded", "needs_review"]);

function StateBadge({ state }: { state: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
        GOOD.has(state) && "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
        BAD.has(state) && "border-red-400/40 bg-red-400/10 text-red-300",
        !GOOD.has(state) && !BAD.has(state) && "border-accent/40 bg-accent/10 text-accent",
      )}
    >
      {state}
    </span>
  );
}

function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="text-sm font-medium">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

function Timeline({ order }: { order: Order }) {
  return (
    <ol className="space-y-2 border-l pl-4">
      {order.events.map((e, i) => (
        <li key={i} className="relative text-xs text-muted-foreground">
          <span className="absolute -left-[21px] top-1.5 size-1.5 rounded-full bg-accent" />
          <span className="font-mono text-foreground">{e.state}</span> · {e.detail}
        </li>
      ))}
    </ol>
  );
}

function OrdersTable({ orders, onSelect, selected }: { orders: Order[]; onSelect?: (id: string) => void; selected?: string }) {
  if (orders.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No orders yet. Place one from “New order”.</p>;
  }
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr className="border-b">
            <th className="px-5 pb-2 font-normal">Order</th>
            <th className="pb-2 font-normal">Item</th>
            <th className="pb-2 font-normal">Price</th>
            <th className="pb-2 font-normal">Status</th>
            <th className="px-5 pb-2 text-right font-normal">Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              onClick={() => onSelect?.(o.id)}
              className={cn("cursor-pointer border-b last:border-0 hover:bg-muted/50", selected === o.id && "bg-muted/60")}
            >
              <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{o.id.slice(0, 12)}…</td>
              <td className="py-3">{o.product ?? <span className="text-muted-foreground">{o.note ?? "processing"}</span>}</td>
              <td className="py-3 font-mono text-xs">{o.priceUsd != null ? `$${o.priceUsd.toFixed(2)}` : "–"}</td>
              <td className="py-3"><StateBadge state={o.state} /></td>
              <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  return (
    <Panel
      title="Order detail"
      action={
        <Link href={`/orders/${encodeURIComponent(order.id)}`} className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
          Receipt <ArrowUpRight className="size-3" />
        </Link>
      }
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
        <StateBadge state={order.state} />
      </div>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[12px] leading-relaxed">{order.memo}</pre>
      <div className="mt-5"><Timeline order={order} /></div>
    </Panel>
  );
}

export function Console() {
  const [view, setView] = useState<View>("overview");
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState(SAMPLE);
  const [zec, setZec] = useState(0.05);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string>();
  const [data, setData] = useState<Payload>({
    adapters: { wallet: "simulated", shop: "simulated", swap: "simulated" },
    orders: [],
    replies: [],
  });

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

  const orders = useMemo(() => data.orders.slice().reverse(), [data.orders]);
  const stats = useMemo(() => {
    const done = data.orders.filter((o) => GOOD.has(o.state)).length;
    const failed = data.orders.filter((o) => BAD.has(o.state)).length;
    const spent = data.orders.filter((o) => GOOD.has(o.state)).reduce((n, o) => n + (o.priceUsd ?? 0), 0);
    return { total: data.orders.length, done, failed, spent };
  }, [data.orders]);
  const active = orders.find((o) => o.id === selected) ?? orders[0];
  const liveCount = Object.values(data.adapters).filter((m) => m === "live").length;
  const current = NAV.find((n) => n.id === view)!;

  const go = (v: View) => {
    setView(v);
    setOpen(false);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-5"><BrandLogo /></div>
      <nav aria-label="Console" className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => go(id)}
            aria-current={view === id ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              view === id ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
            {id === "orders" && stats.total > 0 && (
              <span className="ml-auto rounded-full bg-muted px-2 font-mono text-[10px] text-foreground">{stats.total}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="space-y-3 border-t p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("size-2 rounded-full", liveCount > 0 ? "bg-emerald-400" : "bg-accent")} />
          {liveCount > 0 ? `${liveCount} of 3 adapters live` : "Simulated mode"}
        </div>
        <Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-card/40 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 border-r bg-background">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-8">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-lg border lg:hidden">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <h1 className="font-display text-lg font-semibold tracking-tight">{current.label}</h1>
          <span className="ml-auto hidden rounded-full border px-3 py-1 font-mono text-[11px] text-muted-foreground sm:inline">
            Zcash testnet
          </span>
          <button
            onClick={() => go("new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            <SendHorizontal className="size-3.5" /> New order
          </button>
        </header>

        <main className="space-y-6 px-4 py-8 sm:px-8">
          {view === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[
                  ["Total orders", String(stats.total)],
                  ["Fulfilled", String(stats.done)],
                  ["Refunded / rejected", String(stats.failed)],
                  ["Spent", `$${stats.spent.toFixed(2)}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border bg-card p-5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <Panel title="Recent orders" action={<button onClick={() => go("orders")} className="text-xs text-accent hover:underline">View all</button>}>
                  <OrdersTable orders={orders.slice(0, 6)} />
                </Panel>
                <Panel title="Real vs simulated">
                  <AdapterList adapters={data.adapters} />
                  <p className="mt-4 text-xs text-muted-foreground">The parser, policy engine and state machine are always the real code.</p>
                </Panel>
              </div>
            </>
          )}

          {view === "orders" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
              <Panel title={`All orders (${orders.length})`}>
                <OrdersTable orders={orders} onSelect={setSelected} selected={active?.id} />
              </Panel>
              {active ? <OrderDetail order={active} /> : <Panel title="Order detail"><p className="text-sm text-muted-foreground">Select an order.</p></Panel>}
            </div>
          )}

          {view === "new" && (
            <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
              <Panel title="Incoming shielded note">
                <div className="mb-3 flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => { setMemo(p.memo); setZec(p.zec); }}
                      className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={7}
                  maxLength={512}
                  className="w-full resize-none rounded-lg border bg-muted p-3 font-mono text-[13px] outline-none focus:border-accent/60"
                />
                <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{memo.length}/512</p>
                <label className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  ZEC sent
                  <input
                    type="number" step="0.01" min="0" value={zec}
                    onChange={(e) => setZec(Number(e.target.value))}
                    className="w-28 rounded-lg border bg-muted px-2 py-1 text-right font-mono text-foreground outline-none focus:border-accent/60"
                  />
                </label>
                <button
                  onClick={send}
                  disabled={busy}
                  className="mt-5 w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send memo"}
                </button>
              </Panel>
              <Panel title="Live timeline">
                {orders[0] ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm">{orders[0].product ?? orders[0].note ?? "processing"}</p>
                      <StateBadge state={orders[0].state} />
                    </div>
                    <Timeline order={orders[0]} />
                  </>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">Send a memo to watch the pipeline run.</p>
                )}
              </Panel>
            </div>
          )}

          {view === "replies" && (
            <Panel title="Shielded replies sent">
              {data.replies.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {data.adapters.wallet === "live"
                    ? "Replies go straight to the buyer's wallet and are not stored here."
                    : "No replies yet."}
                </p>
              ) : (
                <div className="space-y-3">
                  {data.replies.slice().reverse().map((r, i) => (
                    <div key={i}>
                      <p className="mb-1 font-mono text-[10px] text-muted-foreground">to {r.to.slice(0, 24)}…</p>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[12px] leading-relaxed">{r.memo}</pre>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}

          {view === "integrations" && (
            <div className="grid gap-6 lg:grid-cols-3">
              {(
                [
                  ["Zcash wallet", data.adapters.wallet, "Reads order memos and sends replies via zcash-devtool.", "Set WHISPER_WALLET_DIR and WHISPER_IDENTITY, fund the buyer wallet with testnet ZEC."],
                  ["Bitrefill shop", data.adapters.shop, "Searches products and creates invoices.", "Set BITREFILL_API_KEY in .env.local."],
                  ["ZEC swap", data.adapters.swap, "Swaps ZEC to the invoice asset through NEAR Intents.", "Not implemented yet. Fallback: pay from Bitrefill balance."],
                ] as const
              ).map(([name, mode, what, how]) => (
                <Panel key={name}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{name}</h3>
                    <ModeBadge mode={mode} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{what}</p>
                  <p className="mt-3 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    {mode === "live" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-300" /> : <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-accent" />}
                    {mode === "live" ? "Connected." : how}
                  </p>
                </Panel>
              ))}
              <p className="flex items-center gap-2 text-xs text-muted-foreground lg:col-span-3">
                <Receipt className="size-3.5" /> Every order has a receipt page showing who saw what.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[11px]",
        mode === "live" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-accent/40 bg-accent/10 text-accent",
      )}
    >
      {mode}
    </span>
  );
}

function AdapterList({ adapters }: { adapters: Payload["adapters"] }) {
  return (
    <ul className="space-y-3 text-sm">
      {(
        [
          ["Zcash wallet (memos)", adapters.wallet],
          ["Bitrefill shop", adapters.shop],
          ["ZEC swap", adapters.swap],
        ] as const
      ).map(([label, mode]) => (
        <li key={label} className="flex items-center justify-between">
          <span className="text-muted-foreground">{label}</span>
          <ModeBadge mode={mode} />
        </li>
      ))}
    </ul>
  );
}
