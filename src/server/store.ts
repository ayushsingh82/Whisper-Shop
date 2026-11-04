import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type { OrderState } from "./types";

export interface OrderRow {
  id: string;            // `${txid}:${outputIndex}` (idempotency key)
  state: OrderState;
  memo: string;
  amountZatoshi: string;
  priceUsd?: number;
  product?: string;
  invoiceId?: string;
  swapRef?: string;
  replyTo?: string;
  note?: string;
  events: { ts: string; state: OrderState; detail: string }[];
  createdAt: string;
}

/** Tiny JSON-file store. Swap for Postgres/Supabase later; the interface is what matters. */
export class Store {
  private rows = new Map<string, OrderRow>();
  constructor(private path?: string) {
    try {
      if (path && existsSync(path)) for (const r of JSON.parse(readFileSync(path, "utf8")) as OrderRow[]) this.rows.set(r.id, r);
    } catch {
      /* unreadable file: start empty */
    }
  }
  has(id: string) { return this.rows.has(id); }
  get(id: string) { return this.rows.get(id); }
  all() { return [...this.rows.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  create(row: Omit<OrderRow, "events" | "createdAt" | "state">) {
    const r: OrderRow = { ...row, state: "received", events: [], createdAt: new Date().toISOString() };
    this.rows.set(r.id, r); this.flush(); return r;
  }
  transition(id: string, state: OrderState, detail: string, patch: Partial<OrderRow> = {}) {
    const r = this.rows.get(id)!;
    Object.assign(r, patch, { state });
    r.events.push({ ts: new Date().toISOString(), state, detail });
    this.flush(); return r;
  }
  spentTodayUsd() {
    const day = new Date().toISOString().slice(0, 10);
    return this.all().filter((r) => r.createdAt.startsWith(day) && ["paid", "fulfilled", "replied"].includes(r.state)).reduce((s, r) => s + (r.priceUsd ?? 0), 0);
  }
  private flush() {
    if (!this.path) return;
    try {
      mkdirSync(dirname(this.path), { recursive: true });
      writeFileSync(this.path, JSON.stringify(this.all(), null, 2));
    } catch {
      /* read-only filesystem (serverless): keep orders in memory only */
    }
  }
}
