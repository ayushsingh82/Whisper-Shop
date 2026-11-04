# What I need from you to finish Whisper Shop

Everything I cannot create myself: accounts, keys, funds, installs, and decisions. Items marked **verify** are things I could not confirm from docs, so check the current instructions first (mentors, Zcash Discord, the official docs).

## 1. Blocking (nothing real works without these)

| # | Item | Why | How |
|---|---|---|---|
| 1 | **Zcash wallet tooling installed** | Read memos from the shop wallet and send memos back. This is the core of the project. | Run yourself: `cargo install --git https://github.com/zcash/zcash-devtool --locked` (my attempt was blocked by the permission check). Or tell me an alternative you prefer (zingo-cli, Zashi SDK). |
| 2 | **Testnet ZEC from a faucet** | Needed for the real shielded testnet transaction required by the Privacy track. | **Verify** the current testnet faucet URL with the mentors or the Zcash Discord. I have not confirmed one. Ask for NU7-compatible testnet funds. |
| 3 | **A lightwalletd testnet endpoint** | The wallet syncs through it. | **Verify** the current public testnet endpoint (mentors/Discord), or run your own. |
| 4 | **Bitrefill API key** | Search and buy products. | Create at bitrefill.com/account/developers (verified email, secret shown once, max 10 keys). Put it in `.env.local` as `BITREFILL_API_KEY`. Never paste it in chat. |
| 5 | **Output of the probe script** | I fit the search and price parsers to real responses. | Run `BITREFILL_API_KEY=... npx tsx scripts/bitrefill-check.mts "esim thailand" TH` and paste the output (no key in it). It makes no purchase. |

## 2. Money (small, but real)

| Item | Amount | Why |
|---|---|---|
| Bitrefill purchase | about 5 to 10 USD | One real eSIM or top-up for the demo. |
| Mainnet ZEC for the swap leg | about 15 to 25 USD worth, **only if you approve** | NEAR Intents has no testnet (per its docs), so a real ZEC to payment-asset swap uses mainnet. Keep it small and state it in the privacy note. |
| Gas or fees | a few USD of the payment asset | The destination chain may charge fees. |

**Easier fallback for the Commerce track:** top up your Bitrefill account balance and pay with `payment_method: balance`. It needs no swap and is less risky, but then ZEC does not pay Bitrefill. We would say that plainly and keep the testnet shielded transaction for the Privacy track.

## 3. Wallets to set up

- **Shop wallet (agent):** a fresh testnet wallet. I generate it; you fund it from the faucet. Its viewing key reads orders, its spend key sends replies.
- **Buyer wallet:** a second testnet wallet (Zashi testnet build, or devtool) that you use in the demo to send an order memo. **Verify** that your wallet can attach a text memo.
- **Mainnet swap wallet:** only if you approve the mainnet swap. Never reuse a wallet that holds real savings.

## 4. API keys and accounts

| Item | Required? | Notes |
|---|---|---|
| Anthropic API key | Optional | Only for the LLM to normalize free-text memos. The deterministic `WS1` parser works without it. |
| NEAR Intents access | **Verify** | Check whether the 1Click API needs an API key or JWT for production use. Docs say no testnet. |
| Supabase or Postgres | Optional | The JSON store works for the hackathon. Use a database only if you want to persist across deploys. |
| Hosting for a long-running worker | Yes, for a public URL | The memo listener must stay alive. Serverless hosting (Vercel functions) is not suitable. Use Railway, Fly.io or a small VPS for the worker. The Next.js UI can sit on Vercel. |
| Domain | Optional | Looks better in the submission. |

## 5. Hackathon admin (only you can do these)

- [ ] Be a registered, checked-in Luma attendee (only they can submit).
- [ ] Join the mentors Telegram and ask the three questions above (faucet, lightwalletd, NU7 tooling).
- [ ] Add teammates with their registered Luma emails (max 4).
- [ ] Decide who is the point person for the prize.
- [ ] Submit by **00:00 on 5 Nov**. Early judging is around 20:00. Draft submissions are not judged.
- [ ] Record the **3-minute demo video** (the first 3 minutes are what judges watch).
- [ ] Collect the **testnet shielded txid** for the submission.

## 6. Decisions I need from you

1. **Swap path:** mainnet ZEC swap via NEAR Intents, or Bitrefill account balance (simpler, ZEC does not pay Bitrefill)?
2. **Push policy:** may I push each finished milestone to `main`, or do you want to approve each push? (I have pushed nothing since the first three commits.)
3. **Product scope for the demo:** eSIM only, or also mobile top-ups (India)?
4. **Optional bonus:** Noir Wallet connect or Nym integration, if time allows.

## 7. What I will deliver once the blockers are cleared

1. Real wallet adapter (read memos, send memos) on testnet.
2. Bitrefill parsers fitted to real responses, then one real purchase.
3. The swap step (or balance fallback) wired into the pipeline.
4. Console switched from simulated to live mode, with a "real vs simulated" panel.
5. README privacy and trust note, 30-day plan, demo script.

## Suggested order for you (about 30 minutes)

1. Message the mentors: faucet URL, lightwalletd testnet endpoint, which wallet tool they recommend.
2. Create the Bitrefill API key and run the probe script.
3. Run the `cargo install` command (it takes a while, so start it first).
4. Tell me your answers to section 6.
