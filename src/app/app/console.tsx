"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight, CheckCircle2, CircleDollarSign, Copy, Wallet, LayoutDashboard,
  ListChecks, Menu, MessageSquareLock, PackageCheck, Plug, Receipt, SendHorizontal, ShieldAlert, ShoppingBag, Undo2, X,
} from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/brand";
import { PROOF, explorerUrl } from "@/lib/proof";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  state: string;
  memo: string;
  product?: string;
  priceUsd?: number;
  invoiceId?: string;
  note?: string;
  createdAt: string;
  events: { ts: string; state: string; detail: string }[];
}
interface Payload {
  adapters: { wallet: string; shop: string; swap: string };
  orders: Order[];
  replies: { to: string; memo: string }[];
}

interface WalletInfo { address: string; totalZec: number; spendableZec: number }
interface Status { height: number | null; shop: WalletInfo | null; buyer: WalletInfo | null; bitrefillUsd: number | null }

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { void navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <Copy className="size-3" /> {done ? "Copied" : "Copy"}
    </button>
  );
}

function WalletCard({ title, role, w }: { title: string; role: string; w: WalletInfo }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
        <p className="font-mono text-sm">{w.spendableZec.toFixed(4)} <span className="text-muted-foreground">TAZ</span></p>
      </div>
      <p className="mt-3 break-all rounded bg-background/60 p-2 font-mono text-[10px] leading-relaxed text-muted-foreground">{w.address}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-foreground">total {w.totalZec.toFixed(4)} TAZ · unified, shielded</span>
        <CopyButton text={w.address} />
      </div>
    </div>
  );
}

type View = "overview" | "orders" | "new" | "replies" | "integrations";

const NAV_GROUPS: { title: string; items: { id: View; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    title: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "orders", label: "Orders", icon: ListChecks },
      { id: "new", label: "New order", icon: SendHorizontal },
    ],
  },
  {
    title: "Agent",
    items: [
      { id: "replies", label: "Shielded replies", icon: MessageSquareLock },
      { id: "integrations", label: "Integrations", icon: Plug },
    ],
  },
];
const NAV = NAV_GROUPS.flatMap((g) => g.items);

const STEPS = ["received", "parsed", "validated", "quoted", "invoiced", "paid", "fulfilled", "replied"] as const;

const SAMPLE = `WS1\nbuy: esim thailand 5gb 7d\nmax: 12 USD\nreply: utest1abcdefghijklmnop`;
const PRESETS: { label: string; memo: string; zec: number }[] = [
  { label: "Valid order", memo: SAMPLE, zec: 0.05 },
  { label: "Over the cap", memo: SAMPLE.replace("max: 12 USD", "max: 50 USD"), zec: 0.05 },
  { label: "Underpaid", memo: SAMPLE, zec: 0.001 },
];

const isSim = (o: { id: string }) => o.id.startsWith("sim");
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
    <section className={cn("min-w-0 rounded-xl border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="text-sm font-medium">{title}</h2>
          {action}
        </header>
      )}
      <div className="min-w-0 p-5">{children}</div>
    </section>
  );
}

/** Horizontal progress of one order through the state machine. Failures turn the furthest step red. */
function Pipeline({ order }: { order: Order }) {
  const seen = new Set(["received", ...order.events.map((e) => e.state === "swapped" ? "invoiced" : e.state)]);
  const reached = STEPS.reduce((n, st, i) => (seen.has(st) ? i : n), 0);
  const failed = BAD.has(order.state);
  return (
    <ol className="flex items-start" aria-label="Order progress">
      {STEPS.map((st, i) => {
        const done = i <= reached;
        const bad = failed && i === reached;
        return (
          <li key={st} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {i > 0 && <span className={cn("absolute right-1/2 top-[9px] h-px w-full", i <= reached ? (failed && i === reached ? "bg-red-400/60" : "bg-accent/70") : "bg-border")} />}
            <span className={cn("relative z-10 grid size-[19px] place-items-center rounded-full border text-[9px]", bad ? "border-red-400 bg-red-400/20 text-red-300" : done ? "border-accent bg-accent text-accent-foreground" : "bg-card text-muted-foreground")}>
              {bad ? "!" : done ? "✓" : ""}
            </span>
            <span className={cn("mt-1.5 hidden font-mono text-[9px] sm:block", done ? "text-foreground" : "text-muted-foreground")}>{st}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Timeline({ order }: { order: Order }) {
  return (
    <ol className="space-y-2 border-l pl-4">
      {order.events.map((e, i) => (
        <li key={i} className="relative break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
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
              <td className="py-3">
                {o.product ?? <span className="text-muted-foreground">{o.note ?? "processing"}</span>}
                {isSim(o) && <span className="ml-2 rounded border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">simulated</span>}
              </td>
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
      <div className="mt-5"><Pipeline order={order} /></div>
      {(order.invoiceId || !isSim(order)) && (
        <dl className="mt-5 space-y-2 text-xs">
          {!isSim(order) && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Order transaction</dt>
              <dd><a href={explorerUrl(order.id.split(":")[0])} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-accent hover:underline">{order.id.slice(0, 10)}… <ArrowUpRight className="size-3" /></a></dd>
            </div>
          )}
          {order.invoiceId && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Bitrefill invoice</dt>
              <dd className="break-all font-mono text-[10px]">{order.invoiceId}</dd>
            </div>
          )}
        </dl>
      )}
      <pre className="mt-5 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[12px] leading-relaxed">{order.memo}</pre>
      <div className="mt-5"><Timeline order={order} /></div>
    </Panel>
  );
}

export function Console() {
  const [view, setView] = useState<View>("overview");
  const [open, setOpen] = useState(false);
  const collapsed = false;
  const [memo, setMemo] = useState(SAMPLE);
  const [zec, setZec] = useState(0.05);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string>();
  const [status, setStatus] = useState<Status | null>(null);
  const [data, setData] = useState<Payload>({
    adapters: { wallet: "simulated", shop: "simulated", swap: "simulated" },
    orders: [],
    replies: [],
  });

  useEffect(() => {
    // Deep link to a view, e.g. /app#orders
    const h = window.location.hash.slice(1) as View;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL hash is only possible after mount
    if (NAV.some((n) => n.id === h)) setView(h);
  }, []);

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

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const r = await fetch("/api/status", { cache: "no-store" });
        if (live) setStatus(await r.json());
      } catch {
        /* optional data */
      }
    };
    load();
    const t = setInterval(load, 30_000);
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

  const orders = data.orders; // the API already returns newest first
  const stats = useMemo(() => {
    const real = data.orders.filter((o) => !isSim(o)); // simulated test runs are excluded from the totals
    const done = real.filter((o) => GOOD.has(o.state)).length;
    const failed = real.filter((o) => BAD.has(o.state)).length;
    const spent = real.filter((o) => GOOD.has(o.state)).reduce((n, o) => n + (o.priceUsd ?? 0), 0);
    return { total: real.length, done, failed, spent };
  }, [data.orders]);
  const active = orders.find((o) => o.id === selected) ?? orders[0];
  const current = NAV.find((n) => n.id === view)!;

  const go = (v: View) => {
    setView(v);
    setOpen(false);
  };

  const modes: [string, string][] = [
    ["Wallet", data.adapters.wallet],
    ["Shop", data.adapters.shop],
    ["Payment", data.adapters.swap],
  ];
  const sidebar = (compact: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b", compact ? "justify-center" : "px-5")}>
        {compact ? <BrandMark /> : <BrandLogo />}
      </div>
      {!compact && (
        <div className="mx-3 mt-4 rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Network</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-300">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> live
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium">Zcash testnet</p>
          <p className="font-mono text-[11px] text-muted-foreground">NU7 · shielded memos</p>
        </div>
      )}
      <nav aria-label="Console" className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="mb-5">
            {!compact && <p className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{g.title}</p>}
            <div className="space-y-0.5">
              {g.items.map(({ id, label, icon: Icon }) => {
                const on = view === id;
                return (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    title={compact ? label : undefined}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-lg py-2 text-sm transition-colors",
                      compact ? "justify-center px-0" : "px-3",
                      on ? "bg-accent/10 font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {on && <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />}
                    <Icon className={cn("size-[18px] shrink-0", on ? "text-accent" : "group-hover:text-foreground")} />
                    {!compact && label}
                    {!compact && id === "orders" && stats.total > 0 && (
                      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">{stats.total}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-3 border-t p-3">
        {!compact && (
          <ul className="space-y-1.5 rounded-xl border bg-muted/40 p-3">
            {modes.map(([label, mode]) => (
              <li key={label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                  <span className={cn("size-1.5 rounded-full", mode === "simulated" ? "bg-accent" : "bg-emerald-400")} />
                  {mode}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 border-r bg-card/40 transition-[width] duration-200 lg:block", collapsed ? "w-[72px]" : "w-64")}>{sidebar(collapsed)}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 border-r bg-background">{sidebar(false)}</aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-8">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-lg border lg:hidden">
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <div className="min-w-0">
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">Console</p>
            <h1 className="font-display text-lg font-semibold leading-tight tracking-tight">{current.label}</h1>
          </div>
          <span className="ml-auto hidden items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] text-muted-foreground sm:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live · Zcash testnet
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
                {(
                  [
                    ["Real orders", String(stats.total), ShoppingBag, "text-foreground"],
                    ["Fulfilled", String(stats.done), PackageCheck, "text-emerald-300"],
                    ["Refunded / rejected", String(stats.failed), Undo2, "text-red-300"],
                    ["Spent from balance", `$${stats.spent.toFixed(2)}`, CircleDollarSign, "text-accent"],
                  ] as const
                ).map(([label, value, Icon, tone]) => (
                  <div key={label} className="rounded-xl border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <span className="grid size-8 place-items-center rounded-lg bg-muted"><Icon className={cn("size-4", tone)} /></span>
                    </div>
                    <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
              {orders[0] && (
                <Panel title="Latest order" action={<StateBadge state={orders[0].state} />}>
                  <p className="mb-5 text-sm">{orders[0].product ?? orders[0].note ?? "processing"}</p>
                  <Pipeline order={orders[0]} />
                </Panel>
              )}
              {status && (status.shop || status.bitrefillUsd != null) && (
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                  {(
                    [
                      ["Shop wallet", status.shop ? `${status.shop.spendableZec.toFixed(4)} TAZ` : "–", "receives orders, sends replies"],
                      ["Buyer wallet", status.buyer ? `${status.buyer.spendableZec.toFixed(4)} TAZ` : "–", "sends orders (demo)"],
                      ["Bitrefill balance", status.bitrefillUsd != null ? `$${status.bitrefillUsd.toFixed(2)}` : "–", "pays for purchases"],
                      ["Testnet block", status.height ? status.height.toLocaleString() : "–", "last block the wallet scanned"],
                    ] as const
                  ).map(([label, value, hint]) => (
                    <div key={label} className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1.5 font-mono text-lg">{value}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
                    </div>
                  ))}
                </div>
              )}
              <Panel title="Testnet proof" action={<span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">real round trip</span>}>
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <ul className="space-y-3">
                    {PROOF.txs.map((t) => (
                      <li key={t.txid} className="flex items-start justify-between gap-4 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium">{t.label}</p>
                          <p className="text-xs text-muted-foreground">{t.note}</p>
                        </div>
                        <a href={t.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-accent hover:underline">
                          {t.txid.slice(0, 8)}…{t.txid.slice(-6)} <ArrowUpRight className="size-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg bg-muted/60 p-4 text-sm">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Bitrefill purchase</p>
                    <p className="mt-2">{PROOF.purchase.item}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">${PROOF.purchase.priceUsd.toFixed(2)} · paid with {PROOF.purchase.paidWith.toLowerCase()}</p>
                    <p className="mt-3 break-all font-mono text-[10px] text-muted-foreground">invoice {PROOF.purchase.invoiceId}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  The order and the reply are shielded: explorers show only “Shielded”, with no amounts or memo. Bitrefill was paid from account balance, not ZEC.
                </p>
              </Panel>
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
            <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
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
                <label className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
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
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <p className="min-w-0 break-words text-sm">{orders[0].product ?? orders[0].note ?? "processing"}</p>
                      <StateBadge state={orders[0].state} />
                    </div>
                    <div className="mb-6 overflow-x-auto pb-1"><div className="min-w-[320px]"><Pipeline order={orders[0]} /></div></div>
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
                  ["Bitrefill payment", data.adapters.swap, "Pays the Bitrefill invoice from the account balance. Bitrefill debits it automatically, so there is no swap leg.", "Set BITREFILL_API_KEY to pay from balance."],
                ] as const
              ).map(([name, mode, what, how]) => (
                <Panel key={name}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{name}</h3>
                    <ModeBadge mode={mode} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{what}</p>
                  <p className="mt-3 flex gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                    {mode !== "simulated" ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-300" /> : <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-accent" />}
                    {mode !== "simulated" ? "Connected." : how}
                  </p>
                </Panel>
              ))}
              {status && (status.shop || status.buyer) && (
                <Panel title="Wallets (Zcash testnet)" className="lg:col-span-3">
                  <div className="grid gap-4 lg:grid-cols-2">
                    {status.shop && <WalletCard title="Shop wallet" role="Receives shielded orders, sends shielded replies" w={status.shop} />}
                    {status.buyer && <WalletCard title="Buyer wallet" role="Sends orders in the demo" w={status.buyer} />}
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Wallet className="size-3.5" /> Read live from the wallets. Anyone can send testnet ZEC to these addresses, and the amounts stay hidden on-chain.
                  </p>
                </Panel>
              )}
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
        mode !== "simulated" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-accent/40 bg-accent/10 text-accent",
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
          ["Bitrefill payment", adapters.swap],
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
