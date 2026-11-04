# Whisper Shop: the memo is the order

**Event:** Zcash FREE SOCIETY Hackathon, 4–5 Nov 2026, Mumbai. Hard deadline 5 Nov 00:00 IST. Early judging ~20:00.
**Tracks:** Zcash Privacy + Agentic Commerce (Bitrefill)
**Status:** built during the hackathon. See [SETUP.md](./SETUP.md) for current state.

## One-line pitch
Send shielded ZEC to a shop address with a memo like `esim thailand 5gb`. An agent buys it from Bitrefill and replies with the redemption code or eSIM details in a shielded memo. No website, no account, no email.

## Why it is different
- Existing Zcash agent projects (zcash-402, x402-zec, cipherpay-x402, zshield-mcp, zpay, ShieldZCash) wrap x402/MCP. None found that use wallet memos as the order and delivery channel.
- Any Zashi/Zcash wallet user can shop. No new app.
- "Shop from chat" and "works while you sleep" for the Bitrefill track.
- Covers the Privacy track themes: encrypted memos, unified addresses, first five minutes, viewing-key receipts.
- Reusable output: an open memo-order spec plus a TypeScript memo reader/writer library.

## Honest limits (must go in the README privacy note)
- Bitrefill does NOT accept ZEC (as far as documented). The agent swaps ZEC to a supported asset (e.g. USDC/LTC/BTC) via NEAR Intents, then pays the invoice. The swap leg leaves the shielded pool and is visible to the swap provider and on the destination chain.
- The agent operator can read every order. Privacy is against outsiders, not the operator.
- Bitrefill sees the invoice and payment. The swap solver sees the swap.
- Memo size is ~512 bytes: fits codes and activation strings, not QR images.
- A signed or plain message is not confidential. Only the shielded memo gives confidentiality.

## Flow
1. User sends shielded ZEC to the shop unified address, memo = order, with a return address.
2. Agent wallet (viewing key) detects the incoming note and decrypts the memo.
3. LLM parses memo into a structured order (JSON). It only proposes.
4. Deterministic policy code validates: amount paid vs price, per-order cap, allowed categories, country, replay/idempotency.
5. Agent searches Bitrefill, picks a product within the paid amount.
6. Agent creates the invoice, reads payment address and amount.
7. Agent swaps ZEC to the invoice asset via NEAR Intents and pays.
8. Agent polls invoice status, fetches fulfillment (code / eSIM details).
9. Agent sends a shielded memo reply with the result to the return address.
10. On any failure: shielded refund memo with the reason.

## Memo order format (draft v0)
```
WS1
buy: esim thailand 5gb 7d
max: 12 USD
reply: <unified address>
```
Free text is allowed, but the LLM normalizes it. If ambiguous, the agent sends a clarifying memo or refunds.

## State machine
`received -> parsed -> validated -> quoted -> invoiced -> swapped -> paid -> fulfilled -> replied`
Failure states: `rejected`, `needs_review`, `refunded`. Idempotency key = txid + output index at every money step. Never auto-retry a payment step.

## APIs and tools to verify (first hour)
| Need | Candidate | To verify |
|---|---|---|
| Zcash wallet, send/receive shielded, read memos | zcash light-wallet stack (librustzcash / zcash-devtool / lightwalletd + zingolib or Zashi SDK) | Testnet + NU7 works, can decrypt memos, faucet available |
| Testnet ZEC | Zcash testnet faucet / mentors | Where to get funds |
| Product search and checkout | Bitrefill MCP `https://api.bitrefill.com/mcp` (`search-products`, `get-product-details`, `buy-products`, `get-invoice-by-id`, `list-invoices`) | OAuth works headless; otherwise x402 endpoints |
| Alt: no-account checkout | Bitrefill x402 (`/x402/esims/search`, `/x402/invoice/create`, `/x402/invoice/pay`, `/x402/invoice/status`, `/x402/my/esims`) | Chain/pricing, USDC requirement |
| ZEC to payment asset swap | NEAR Intents (1Click API / SDK) | Supports testnet ZEC? If not, mainnet tiny amount or split flow |
| Order parsing | Claude API (claude-sonnet-5-5 or haiku-5-5) with JSON schema | Structured output |
| Backend | Next.js + TypeScript worker | none |
| Persistence | Supabase/Postgres | none |
| Optional | Noir Wallet SDK (wallet connect), Nym (network privacy) | Only if time; bonus points |

## Decision tree for the risky parts
- Memo read/write fails on testnet -> ask mentors immediately; fallback to mainnet tiny amounts. If still blocked, project cannot proceed as designed.
- NEAR Intents lacks testnet ZEC -> (a) mainnet for swap leg only and say so, or (b) split flow: testnet shielded order/receipt proves Privacy track, Bitrefill paid from a separate funded wallet for Commerce track. State this plainly in the demo.
- Bitrefill OAuth headless fails -> use x402.
- Invoice expires before swap settles -> get quote first, create invoice only after funds are ready; otherwise `needs_review`.

## Schema (Postgres)
- `orders(id, txid, output_idx, sender_return_addr, memo_raw, parsed_json, state, price_usd, paid_zec, created_at)` unique(txid, output_idx)
- `invoices(id, order_id, bitrefill_invoice_id, pay_asset, pay_address, amount, expires_at, status)`
- `swaps(id, order_id, provider, quote_json, deposit_addr, status, tx_ref)`
- `fulfillments(id, order_id, kind, payload_encrypted, delivered_txid)`
- `events(id, order_id, type, detail, ts)`  (audit log)
- `policy(id, max_order_usd, allowed_categories, allowed_countries, daily_cap_usd)`

## Milestones (hack day, IST)
| Time | Goal |
|---|---|
| 11:00–12:00 | Create fresh public repo. Verify gates: testnet wallet + memo decrypt, NEAR Intents testnet, Bitrefill MCP purchase. Ask mentors. |
| 12:00–14:00 | Memo listener + memo reply (the novel core). Round trip with a canned reply. |
| 14:00–16:30 | Bitrefill search, invoice, status, fulfillment from CLI. Policy engine. LLM parser. |
| 16:30–18:30 | Swap and pay step. Refund path. State machine + retries. |
| 18:30–19:45 | Dashboard (dark, orange accents): live order timeline, real-vs-simulated panel, privacy note. README. |
| 19:45–20:00 | Submit finalized version for early judging. |
| 20:00–23:00 | Fix issues from feedback, one clean real purchase run, record 3-min demo. |
| 23:00–23:45 | Final submission: txid, repo URL, testnet URL, privacy and trust note, 30-day plan. Deadline 00:00. |

## Testing plan
- Unit: memo parser, policy engine, idempotency.
- Integration: memo in -> fake Bitrefill -> memo out; then with real Bitrefill.
- Failure cases: bad memo, underpayment, over cap, duplicate tx, expired invoice, swap slippage, fulfillment delay.
- One real end-to-end run recorded for the demo.

## Demo script (3 min)
0:00 problem: shopping needs accounts, emails, cards. 0:20 send a normal shielded payment from Zashi with a memo. 0:50 dashboard shows decrypt, parse, policy decision. 1:20 Bitrefill invoice, swap, pay. 2:00 reply memo arrives in the wallet with the eSIM details. 2:25 failure case: over-cap order is refunded with a reason. 2:40 privacy note: what is hidden, what is revealed, to whom. 2:55 30-day plan.

## Submission checklist
- [ ] Fresh public GitHub repo created on 4 Nov after 11:00, many real commits
- [ ] Testnet shielded txid in submission
- [ ] README: tech, design decisions, privacy and trust note, real vs simulated
- [ ] Public testnet app URL
- [ ] 30-day continuation plan (publish memo-order spec, library, ZecHub lounge talk, Noir/Nym integration, Whisper Standing Orders)
- [ ] Demo video under 3 minutes
- [ ] Teammates added with registered Luma emails

## Extensions if time allows
- Whisper Standing Orders: `every 28 days: Airtel 299 recharge` with a prepaid balance and scheduler.
- Receipt Locker: purchase receipts as memos readable with a viewing key.
- Noir Wallet connect, Nym for network privacy (bonus point).

## Backup plan
If the Zcash side is blocked: RelayOps-style Commerce-only agent (Telegram trigger, policy engine, Bitrefill purchase, verification) and enter only the Bitrefill track.
