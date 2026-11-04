/* eslint-disable @typescript-eslint/no-explicit-any -- Bitrefill MCP responses are not schema-published; parsed defensively. */
import type { Candidate, Fulfillment, InvoiceInfo, ParsedOrder, Shop } from "./types";

const MCP_URL = "https://api.bitrefill.com/mcp";

export class BitrefillError extends Error {
  constructor(message: string, public code?: string) { super(message); }
}

/**
 * Bitrefill eCommerce MCP over Streamable HTTP (JSON-RPC 2.0), authenticated with an API key
 * from bitrefill.com/account/developers sent as a Bearer header (never in the URL).
 * Response shapes for search and payment_info are only partly documented, so every parser here
 * is defensive and `scripts/bitrefill-check.mts` dumps the raw output to confirm them.
 */
export class BitrefillShop implements Shop {
  private id = 0;
  constructor(private apiKey: string, private fetchFn: typeof fetch = fetch) {}

  async callTool(name: string, args: Record<string, unknown>): Promise<string> {
    const res = await this.fetchFn(MCP_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++this.id, method: "tools/call", params: { name, arguments: args } }),
    });
    if (res.status === 429) throw new BitrefillError("rate limited (30 req/min)", "RATE_LIMIT");
    if (!res.ok) throw new BitrefillError(`HTTP ${res.status}`);
    const raw = await res.text();
    // The server may answer as plain JSON or as an SSE stream with a `data:` line.
    const jsonText = raw.trimStart().startsWith("{") ? raw : raw.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).pop() ?? "";
    const msg = JSON.parse(jsonText) as { result?: { isError?: boolean; content?: { text?: string }[] }; error?: { message: string } };
    if (msg.error) throw new BitrefillError(msg.error.message);
    const text = msg.result?.content?.map((c) => c.text ?? "").join("\n") ?? "";
    if (msg.result?.isError) {
      const e = safeJson(text) as { error?: string; code?: string } | undefined;
      throw new BitrefillError(e?.error ?? text, e?.code);
    }
    return text;
  }

  async search(order: ParsedOrder): Promise<Candidate[]> {
    const text = await this.callTool("search-products", {
      query: order.query,
      intent: `buy ${order.query} for at most ${order.maxUsd} USD`,
      country: order.country ?? "US",
      ...(order.kind === "esim" ? { product_type: "esim" } : {}),
      per_page: 8,
    });
    const slugs = extractSlugs(text);
    const out: Candidate[] = [];
    for (const slug of slugs.slice(0, 5)) {
      const d = await this.callTool("get-product-details", { product_id: slug, currency: "USD" });
      out.push(...extractPackages(slug, d, order.maxUsd));
    }
    return out;
  }

  async createInvoice(c: Candidate, payMethod: string): Promise<InvoiceInfo> {
    const text = await this.callTool("buy-products", {
      cart_items: [{ product_id: c.productId, package_value: c.packageValue }],
      payment_method: payMethod,
      // Guest checkout needs an email; with an API key the account email is used.
    });
    const j = safeJson(text) as Record<string, any> | undefined;
    const r = (j?.response ?? j) as Record<string, any> | undefined;
    const pi = r?.payment_info ?? {};
    const address = pi.address ?? pi.payment_address;
    const amount = pi.amount ?? pi.payment_amount ?? pi.price;
    if (!r?.invoice_id || !address || amount == null) {
      throw new BitrefillError(`unexpected buy-products shape; run bitrefill-check to inspect: ${text.slice(0, 300)}`);
    }
    return {
      invoiceId: r.invoice_id, accessToken: r.invoice_access_token, payMethod,
      payAddress: String(address), payAmount: String(amount), priceUsd: c.priceUsd, expiresMinutes: r.expiration_minutes,
    };
  }

  async getFulfillment(inv: InvoiceInfo): Promise<Fulfillment> {
    const text = await this.callTool("get-invoice-by-id", { invoice_id: inv.invoiceId, ...(inv.accessToken ? { invoice_access_token: inv.accessToken } : {}) });
    const j = safeJson(text) as Record<string, any> | undefined;
    const r = (j?.response ?? j) as Record<string, any> | undefined;
    const status = String(r?.invoice_status ?? r?.status ?? "");
    if (["blocked", "denied", "payment_error"].includes(status)) return { status: "failed" };
    const order = r?.orders?.[0];
    const info = order?.redemption_info;
    const code = order?.esim_install_link ?? info?.code ?? info?.link ?? info?.pin;
    if (status === "complete" && code) return { status: "complete", code: String(code), instructions: info?.instructions };
    if (order?.status === "failed" || order?.status === "refunded") return { status: "failed" };
    return { status: "pending" };
  }
}

function safeJson(t: string): unknown { try { return JSON.parse(t); } catch { return undefined; } }

/** Search output is TOON text (undocumented). Pull slug-like ids: lowercase words joined by _ or -. */
export function extractSlugs(text: string): string[] {
  const j = safeJson(text) as any;
  const fromJson: string[] | undefined = (j?.products ?? j?.results ?? (Array.isArray(j) ? j : undefined))?.map((p: any) => p.id ?? p.slug ?? p.product_id).filter(Boolean);
  if (fromJson?.length) return [...new Set(fromJson)];
  return [...new Set(text.match(/\b[a-z0-9]+(?:[_-][a-z0-9]+)*-[a-z]{2,}[a-z0-9-]*\b/g) ?? [])];
}

/** Turn product details into priced candidates. Prices are only trusted if clearly in USD. */
export function extractPackages(slug: string, text: string, maxUsd: number): Candidate[] {
  const j = safeJson(text) as any;
  const pkgs: any[] = j?.packages ?? j?.product?.packages ?? [];
  return pkgs
    .map((p) => ({ productId: slug, name: `${j?.name ?? slug} ${p.package_value ?? p.value ?? ""}`.trim(), packageValue: String(p.package_value ?? p.value), priceUsd: Number(p.price ?? p.package_price ?? p.usd_price ?? NaN) }))
    .filter((c) => Number.isFinite(c.priceUsd) && c.priceUsd <= maxUsd);
}
