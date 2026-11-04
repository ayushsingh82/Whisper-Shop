# Whisper Shop

**The memo is the order.** Buy real products with shielded Zcash by sending a normal payment with a text note. No website, no account, no email.

Built for the Zcash FREE SOCIETY Hackathon (Mumbai, 4–5 Nov 2026), targeting the **Zcash Privacy** and **Agentic Commerce (Bitrefill)** tracks.

> **Status:** early development. This README describes the design. Anything not yet built is marked as planned.

## How it works

1. You send shielded ZEC to the shop's unified address. The memo holds your order, for example `esim thailand 5gb`, plus a return address.
2. The agent decrypts the memo with its viewing key.
3. An LLM turns the memo into a structured order. It only proposes. Deterministic code checks the order against spending caps, allowed categories and the amount you paid.
4. The agent finds a product on [Bitrefill](https://www.bitrefill.com), creates an invoice, swaps ZEC to the invoice asset through NEAR Intents, and pays it.
5. It verifies fulfillment and sends the redemption code or eSIM details back as a shielded memo.
6. If anything fails, you get a shielded refund memo with the reason.

## Why it is different

- Existing Zcash agent projects wrap x402 or MCP. Whisper Shop uses wallet memos as the order and delivery channel, so any Zcash wallet user can shop.
- The policy engine is plain code. The LLM never holds spending authority.
- Output includes an open memo-order spec and a reusable TypeScript memo reader and writer.

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

## Stack

Next.js, TypeScript, Tailwind CSS, Zcash light-wallet tooling (testnet, NU7), Bitrefill MCP or x402, NEAR Intents, Claude API for order parsing, Postgres.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Environment variables will be documented in `.env.example` as integrations land.

## Roadmap

- [ ] Memo listener and memo reply on Zcash testnet
- [ ] Bitrefill search, invoice and fulfillment
- [ ] Policy engine and order parser
- [ ] Swap and pay, refund path
- [ ] Order timeline dashboard
- [ ] Whisper Standing Orders (recurring orders)
- [ ] Publish the memo-order spec and library

The full plan, schema, milestones and demo script are in [WHISPER_SHOP.md](./WHISPER_SHOP.md).

## License

MIT
