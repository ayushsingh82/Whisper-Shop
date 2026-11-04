# How we will show the demo

The demo is real, not a scripted web page. Judges watch the first 3 minutes of the video, so the video must show a real shielded payment becoming a real purchase and a real shielded reply. Anything simulated is labelled as such on screen.

## Principle

One unbroken take, two windows side by side:

- **Left:** the buyer's wallet (a Zcash testnet wallet that can send a memo, and shows the incoming reply).
- **Right:** the Whisper Shop console at `/app`, showing the live order timeline and the Real vs simulated panel.

No cuts between the payment and the reply. If a step takes long (testnet confirmations), say so out loud and use a pre-sent order for the confirmed result, shown as a second take.

## 3-minute script

| Time | On screen | What I say |
|---|---|---|
| 0:00–0:20 | Landing page hero | "Buying with Zcash today means accounts and emails. Whisper Shop makes the memo the order." |
| 0:20–0:50 | Buyer wallet: compose a shielded payment, type the `WS1` memo, send | "A normal shielded payment. The memo says what I want, how much I'll pay at most, and where to reply." |
| 0:50–1:30 | Console: order timeline fills in live (parsed, validated, quoted, invoiced, swapped, paid) | "The agent decrypts the memo. An LLM can propose the order, but plain code checks it against caps and what I paid." |
| 1:30–2:00 | Bitrefill invoice and swap shown in the receipt page `/orders/[id]` | "It buys on Bitrefill. Bitrefill doesn't take ZEC, so the agent swaps through NEAR Intents. This leg leaves the shielded pool and I say so." |
| 2:00–2:25 | Wallet: reply memo arrives with the eSIM details | "The code comes back as a shielded memo. No email, no website, no account." |
| 2:25–2:45 | Console: send an over-cap order, refund memo arrives with the reason | "If something is wrong it refunds with a reason instead of guessing." |
| 2:45–3:00 | Receipt page "Who saw what" table, then the 30-day plan | "Here is exactly who saw what. Next: publish the memo spec and library, then standing orders." |

## What must be real in the video

| Item | Real or simulated | Evidence shown |
|---|---|---|
| Shielded testnet payment with memo | Real | Testnet txid on screen and in the submission |
| Memo decrypted by the shop wallet | Real | Console timeline |
| Policy decision | Real code | Console timeline, refund memo |
| Bitrefill product search and invoice | Real if the API key is set | Real vs simulated panel says `live`, invoice id on the receipt |
| ZEC to invoice-asset swap | Real mainnet small amount, or skipped (balance fallback). **Decide before recording.** | Swap reference on the receipt, stated in the voice-over |
| Reply memo | Real | Visible in the buyer wallet |

If any row ends up simulated, the panel shows `simulated` and the voice-over says so. We never present a mock as real.

## Pre-recording checklist

- [ ] Shop wallet funded on testnet and synced
- [ ] Buyer wallet funded on testnet; it can send a text memo
- [ ] `BITREFILL_API_KEY` set; one real order tested end to end before filming
- [ ] Swap path decided and tested with a tiny amount
- [ ] Console open at `/app` with the panel visible
- [ ] One order pre-sent and confirmed as a backup take
- [ ] Over-cap order ready to paste for the refund beat
- [ ] Screen recording at 1080p, wallet and console both readable
- [ ] Video under 3 minutes; the payment-to-reply beat happens inside the first 2:30

## Fallbacks if something fails on the day

1. **Testnet is slow:** show the pre-sent confirmed order and narrate it as such.
2. **Swap not possible:** pay Bitrefill from account balance, state it plainly, and keep the shielded order and reply real.
3. **Bitrefill API issue:** keep the shielded memo round trip real and show the panel with `shop: simulated`. Submit for the Privacy track only.
4. **Wallet tooling blocked:** this is the one we cannot fake. Without it the project has no real memo round trip, so resolve it first.

## Submission evidence to collect while recording

- Testnet shielded txid (order) and the reply txid
- Bitrefill invoice id and fulfilment status
- Swap reference, if used
- Screenshots of the receipt page and the Real vs simulated panel
- Public repo link with commit history
