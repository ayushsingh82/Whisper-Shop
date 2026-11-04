<div align="center">

<img src="public/logo.svg" alt="Whisper Shop logo" width="96" />

# Whisper Shop

**The memo is the order.**

Buy real products with shielded Zcash by sending a normal payment with a text note.
No website. No account. No email.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Network](https://img.shields.io/badge/Zcash-testnet-orange) ![License](https://img.shields.io/badge/license-MIT-green)

</div>

Built for the Zcash FREE SOCIETY Hackathon (Mumbai, 4–5 Nov 2026), targeting the **Zcash Privacy** and **Agentic Commerce (Bitrefill)** tracks.

> **Status:** working prototype on Zcash testnet. Components that depend on external credentials fall back to clearly labelled simulated adapters. See [Real vs simulated](#real-vs-simulated).

## Overview

Whisper Shop is an agent that watches a shielded Zcash wallet. A buyer sends ZEC with a memo such as `esim thailand 5gb`. The agent reads the memo, buys the product from [Bitrefill](https://www.bitrefill.com), and replies with the redemption code in a shielded memo. Any Zcash wallet that can attach a memo can shop.

## How it works

```
Buyer wallet ──shielded ZEC + memo──▶ Shop wallet (viewing key)
                                          │
                                  1. decrypt memo
                                  2. parse order (LLM proposes)
                                  3. policy engine validates (plain code)
                                  4. Bitrefill search + invoice
                                  5. swap ZEC → invoice asset (NEAR Intents)
                                  6. pay + verify fulfilment
                                          │
Buyer wallet ◀──shielded reply memo (code / eSIM) or refund with reason
```

Order states: `received → parsed → validated → quoted → invoiced → swapped → paid → fulfilled → replied`, with failure states `rejected`, `needs_review`, `refunded`.

### Memo format

```
WS1
buy: esim thailand 5gb 7d
max: 12 USD
reply: <unified address>
```

Free text is also accepted and normalised by the LLM. Ambiguous orders get a clarifying memo or a refund.

## Key design decisions

- **Memo as the interface.** Existing Zcash agent projects wrap x402 or MCP. Whisper Shop uses wallet memos for both order and delivery.
- **The LLM never holds spending authority.** It only proposes. Deterministic code enforces caps, allowed categories and the amount paid.
- **Idempotent money steps.** Keyed on txid and output index. Payment steps are never retried automatically.
- **Reusable output.** An open memo-order spec and a TypeScript memo reader and writer.

## Privacy and trust

| Party | Can see |
|---|---|
| Public chain observers | Nothing about order, amount or memo (shielded) |
| Shop operator | Every order and its contents |
| Bitrefill | The invoice and payment |
| Swap provider | The swap from ZEC to the invoice asset |

Limits, stated plainly:

- Bitrefill does not document ZEC as a payment method. The swap leg leaves the shielded pool.
- Privacy is against outsiders, not against the operator.
- Memos hold about 512 bytes: enough for codes and activation strings, not QR images.

## Real vs simulated

| Component | Needs | Without it |
|---|---|---|
| Zcash wallet (memo read/send) | `zcash-devtool`, funded testnet wallet | Simulated wallet |
| Bitrefill search and invoice | `BITREFILL_API_KEY` | Simulated shop |
| ZEC → asset swap | Mainnet NEAR Intents (no testnet) | Not implemented yet |
| Order parsing | Built-in `WS1` parser | LLM optional |

The console at `/app` shows which adapters are live.

## Quick start

Requires Node.js 20+ and, for live mode, Rust (`cargo`).

```bash
npm install
cp .env.example .env.local
npm run dev                        # http://localhost:3000
```

Simulated mode works immediately. For live testnet mode follow [md/SETUP.md](./md/SETUP.md).

### Configuration

| Variable | Purpose |
|---|---|
| `BITREFILL_API_KEY` | Bitrefill product search and purchase |
| `WHISPER_WALLET_DIR` | Shop wallet directory (keep outside the repo) |
| `WHISPER_IDENTITY` | Shop wallet identity file (keep outside the repo) |
| `ZCASH_DEVTOOL_BIN` | Path to `zcash-devtool` |
| `ZCASH_SERVER` | lightwalletd server alias, default `zecrocks` |

### Commands

```bash
npm run dev                                                # UI and API
npx tsx --env-file=.env.local scripts/worker.mts 20        # poll shop wallet every 20s
npx tsx scripts/send-order.mts "esim thailand 5gb 7d" 12   # place a testnet order
npx tsx --test src/server/*.test.ts                        # unit tests
```

## Project structure

```
src/app/        Next.js routes: landing, /app console, /orders/[id], /api
src/server/     parser, policy engine, orchestrator, Bitrefill + wallet adapters
scripts/        worker, order sender, connectivity checks
md/             all project documentation
```

## Documentation

All docs live in [`md/`](./md):

| File | Contents |
|---|---|
| [SETUP.md](./md/SETUP.md) | Local setup, wallets, running the worker |
| [REQUIREMENTS.md](./md/REQUIREMENTS.md) | Accounts, keys, funds and decisions needed |
| [DESIGN.md](./md/DESIGN.md) | Architecture, schema, milestones, risks |
| [DEMO_PLAN.md](./md/DEMO_PLAN.md) | Demo script and recording checklist |

## Roadmap

- [x] Memo parser, policy engine, state machine
- [x] Console, receipt page, orders API
- [x] zcash-devtool wallet adapter
- [ ] Verified Bitrefill search, invoice and fulfilment (needs API key)
- [ ] Swap and pay, refund path
- [ ] Whisper Standing Orders (recurring orders)
- [ ] Publish the memo-order spec and library

## License

MIT
