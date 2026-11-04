# Demo video plan

Goal: show the real thing, once, with nothing faked. Target length **2:45**. Privacy judges watch only the first 2 minutes and Bitrefill allows 3 minutes, so the payment, the purchase and the reply must all land **before 2:00**.

## What judges must see (in this order)

1. A real shielded order sent with a memo.
2. The agent decrypting it and applying the spending rules.
3. A real Bitrefill purchase.
4. The code arriving as a shielded memo.
5. What is and is not private, stated honestly.

## Setup: two windows side by side

- **Left, terminal (the buyer):** large font, dark theme. Runs the order and later shows the decrypted reply.
- **Right, console at `http://localhost:3000/app`:** the live pipeline, with the stat cards and Testnet proof panel visible.
- Third tab ready: the Bitrefill account page (balance and invoice) and the testnet explorer page for the order txid.

## Script (2:45)

| Time | Show | Say |
|---|---|---|
| 0:00 to 0:15 | Landing page hero | "Paying with shielded Zcash usually means accounts and emails. Whisper Shop makes the memo the order." |
| 0:15 to 0:45 | Terminal: run `send-order.mts "esim thailand 1gb 7d" 4 0.02`, show the memo and the txid | "This is a normal shielded payment. The memo says what I want, my cap, and where to reply." |
| 0:45 to 1:20 | Console timeline: parsed, validated, quoted, invoiced, paid | "The agent decrypts the memo with a viewing key. Plain code checks the price, my cap and what I paid. The model never holds spending authority." |
| 1:20 to 1:40 | Bitrefill account: new invoice, balance dropped by $2.89 | "It buys a real eSIM on Bitrefill. Bitrefill does not take ZEC, so I paid from account balance, and I want to be clear about that." |
| 1:40 to 2:00 | Terminal: `list-tx` on the buyer wallet shows `WS1 OK ... code: https://...` | "The code comes back as a shielded memo. No website, no account, no email." |
| 2:00 to 2:20 | Over-cap order, refund memo with the reason | "If something is wrong it refunds with a reason instead of guessing." |
| 2:20 to 2:40 | Explorer page: `Shielded`, no amounts, no memo. Then the who-sees-what table | "On-chain observers see nothing. The operator can read orders, Bitrefill sees the invoice, the light-wallet server sees the IP." |
| 2:40 to 2:45 | Testnet proof panel | "Next: publish the memo spec and library, then standing orders." |

## Make it excellent

- **Rehearse twice.** Run the exact commands once off camera. Confirmations take a minute or two (25 s blocks), so decide how to cover the wait.
- **Cover the wait honestly.** Say "this takes about a minute to confirm" and cut with a visible "1 min later" card, or send the order just before recording and narrate while it confirms. Never imply it is instant.
- **Pre-sync both wallets** and `enhance` them right before filming so nothing stalls.
- **Keep a backup take:** one order already confirmed and replied, shown as a second clip, labelled as such.
- **Redact the eSIM link** (blur it). Anyone with it can use the eSIM.
- **Big text, no clutter:** terminal at 18pt or larger, hide bookmarks and notifications, 1080p, clear audio. Add short on-screen captions for each step.
- **Be honest on screen:** show the Real vs simulated panel and say what is paid from balance.
- **Lead with the result in the first 10 seconds** (the eSIM arriving in a memo), then show how.
- Upload as unlisted on YouTube or Loom, and check it plays logged out.

## Real versus simulated (say this out loud)

| Step | Status |
|---|---|
| Shielded order and reply | Real, Zcash testnet |
| Memo decryption, policy checks | Real code |
| Bitrefill purchase and delivery | Real |
| Bitrefill payment | From account balance (no ZEC swap) |

## Fallbacks

1. **Testnet is slow:** show the pre-confirmed backup order and label it.
2. **Worker hiccup:** the order and reply transactions in the README are real and can be shown on the explorer.
3. **Wallet not syncing:** run `sync` and `enhance` once, then retry. Do not fake output.

## Evidence to keep

Order txid, reply txid, Bitrefill invoice id, a screenshot of the Testnet proof panel, the public repo link.
