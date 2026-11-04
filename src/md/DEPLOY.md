# Deploying Whisper Shop

Whisper Shop has two parts, and only one of them can run on Vercel.

| Part | What it does | Where it runs |
|---|---|---|
| **Web app** (landing page, console, `/api`) | UI and the order API | Vercel |
| **Worker** (`scripts/worker.mts`) | Polls the shop wallet, decrypts memos, buys, replies | A host that stays on: Railway, Fly.io or a VPS |

The worker needs the `zcash-devtool` binary and a wallet directory on disk. Vercel functions are serverless, short-lived and have a read-only filesystem, so the live wallet cannot run there.

## What a Vercel deployment does

It runs the **simulated** demo: the parser, policy engine and state machine are the real code, and the Zcash wallet and Bitrefill shop are simulated. The console labels this clearly. The "Testnet proof" panel shows the real transactions from our round trip.

## Vercel settings

Set **nothing secret**. Import the repo and deploy with the defaults (Framework: Next.js).

Optional, under Project Settings, Environment Variables:

| Name | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_EXPLORER_URL` | `https://testnet.zcashexplorer.app/transactions` | Explorer base URL for the proof links (this is the default) |
| `MAX_ORDER_USD` | `20` | Per-order cap |
| `DAILY_CAP_USD` | `50` | Daily cap |

**Do not set `BITREFILL_API_KEY` on Vercel.** The app only uses the real shop when a live wallet is also configured, so the key would be ignored there. Keeping it off Vercel means anonymous visitors can never spend your store credit.

## Worker settings (Railway, Fly.io or a VPS)

Install Rust and `zcash-devtool`, create the wallets (see [SETUP.md](./SETUP.md)), then set:

| Name | Value |
|---|---|
| `BITREFILL_API_KEY` | Your Bitrefill key (secret) |
| `WHISPER_WALLET_DIR` | Absolute path to the shop wallet directory |
| `WHISPER_IDENTITY` | Absolute path to the shop wallet identity file (secret, back it up) |
| `ZCASH_SERVER` | `zecrocks` (default) or your lightwalletd URL |
| `MAX_ORDER_USD`, `DAILY_CAP_USD` | Spending caps |

Start it with `npx tsx --env-file=.env.local scripts/worker.mts 20`.

## Config summary

All settings are environment variables listed in `.env.example`. Nothing is hardcoded in code except the proof transaction IDs, which live in one data file: `src/data/proof.json`. Wallet addresses are never in code: scripts read them from the wallet directories.
