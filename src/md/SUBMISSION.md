# Stadium submission: Whisper Shop

Copy each answer into the form at Stadium. Deadline: **Thu 5 Nov, 00:00 IST**. Do not finalize until the real testnet txid and the real Bitrefill purchase exist (see `HACKATHON.md`).

## Form answers

**Track:** Both tracks

**One-line pitch** (131/140):

```
Send shielded ZEC with a memo like "esim thailand 5gb"; an agent buys it on Bitrefill and replies with the code in a shielded memo.
```

**What is it:** agent

**Public URL:** leave blank (agents may skip). Add only if the console is hosted.

**Technologies used:**

```
Zcash (testnet, NU7), zcash-devtool, lightwalletd, Bitrefill API, Next.js, React, TypeScript, Tailwind CSS, Node.js
```

Add NEAR Intents or the Claude API only if we actually ship them.

**Theme (Privacy track):** 1. Private payment rails

**Description** (460/500):

```
Whisper Shop turns a Zcash memo into a purchase order. A buyer sends shielded testnet ZEC with a note like "esim thailand 5gb". The agent decrypts it with a viewing key, and a plain-code policy engine checks the price, spending caps and amount paid. It then buys the product on Bitrefill and returns the redemption code as a shielded memo. Failures get a refund memo with the reason. Any Zcash wallet that can attach a memo works: no website, account or email.
```

**Next 30-day milestone:**

```
Publish the open memo-order spec (WS1) and a reusable TypeScript library for reading and writing order memos, so any Zcash wallet or agent can use it. Then add Whisper Standing Orders: recurring memo orders such as a monthly mobile top-up, paid from a prepaid balance. Present it at a ZecHub Friday Lounge and pilot it with one other agent builder.
```

## Privacy and trust note (form answer, 2,425 of 3,000 characters)

```
WHAT STAYS PRIVATE
The order, the amount and the reply are all shielded on Zcash testnet (NU7, Ironwood pool). Our order and reply transactions show up on the explorer as "Shielded" with 0 shielded inputs/outputs visible and no amount or memo. A chain observer sees only that a transaction happened. The buyer never gives an email, account or phone number, and delivery comes back as a shielded memo, so privacy holds through delivery.

WHAT THE APP REVEALS, AND TO WHOM
- Shop operator (us): reads every order and reply, because the shop wallet decrypts the memos. Orders (memo text, reply address, product, price, invoice id) are stored in plain text in a local JSON file.
- Bitrefill: sees the product, price and invoice, plus the shop's one account. It never sees the buyer's Zcash address or the memo. All buyers share one account, so Bitrefill cannot tell them apart.
- Light-wallet server (testnet.zec.rocks): sees the shop wallet's IP address and sync pattern. When the wallet fetches full transactions to read memos, the server also learns which transactions belong to the shop wallet, but not their contents.
- No AI provider sees anything: the shipped path uses a deterministic memo parser, not an LLM.
- The eSIM link in the reply is a bearer secret: whoever reads the memo can use it.

WHAT USERS HAVE TO TRUST
- Us as operator: we can read orders, hold the shop wallet's spending key, and could refuse or fail to deliver. A failed order sends a refund memo with the reason, but the ZEC itself is returned by a separate manual step, not automatically.
- Bitrefill, to deliver what was paid for.
- The light-wallet server operator, not to log and correlate IPs.
- zcash-devtool, which is experimental software (we use testnet coins only).

WHAT WE WOULD FIX NEXT
1. Run our own lightwalletd or Zebra node and route wallet traffic over Nym or Tor, so no third party sees the shop's IP.
2. Split keys: a watch-only viewing-key service that reads orders, and a separate signer for replies, so the reader cannot spend.
3. Stop keeping plain-text orders: store only what is needed, encrypt at rest and expire old records.
4. Automatic ZEC refunds on failure.
5. Fresh diversified reply addresses per order to avoid linking a buyer's orders.
6. Paying Bitrefill in ZEC through a swap. That would leave the shielded pool, so we would document exactly what it reveals first. Today Bitrefill is paid from account balance.
```

## Evidence to collect before submitting

- [x] Testnet shielded txid (order, unassisted run): `c158b16a37f7e6062f64bef96fbc4526347decc170ed6e615bc12f84f8d6bce4`
- [x] Reply txid (unassisted run): `bda404c9cfdead3c1635d0db560b9ed4b6c7688188ef702bb853d730623f5386`
- [x] First run: order `3d9fc024…1d74d3`, reply `96f99a16…cdfede`
- [x] Bitrefill invoices `800818ca-def0-4f9d-a07f-fd299abd9349` (unassisted run) and `2c244888-c027-484e-9d5c-43b3eef05c49`, both complete and delivered
- [ ] Demo video: 3 minutes max, payment to reply inside the first 2 minutes
- [ ] Public repo link with commit history
- [ ] Bitrefill feedback: what worked, what did not (write while building)
- [ ] Teammates added with their Luma emails

## Bitrefill feedback (form answers)

**What worked with Bitrefill?**

```
The hosted MCP worked on the first try. The API key as a Bearer header just worked, and search-products and get-product-details returned real prices for every eSIM package. buy-products with payment_method "balance" auto-debits the account with no checkout step, and a Thailand eSIM was delivered in about 6 seconds. get-invoice-by-id returned the eSIM install link, and get-balances and list-invoices made it easy to verify what the agent had spent. The tool descriptions in tools/list were clear enough to build from without trial and error. Our agent bought and delivered 4 real eSIMs this way, and 2 of those orders ran fully automatically from a shielded Zcash memo.
```

**What didn't?**

```
Nothing blocked us. The only friction was that responses come back as compact TOON text rather than JSON, so we fitted our parsers to the real output once and then everything worked. Delivery is checked by polling get-invoice-by-id, which was fast enough: an eSIM arrived in about 6 seconds.
```

**What did you try to do that Bitrefill couldn't handle?**

```
We did everything we set out to do. A shielded Zcash memo became a real Bitrefill purchase and came back as a shielded reply, fully automatically. The one design choice was how to pay: we used the account balance with payment_method "balance", which auto-debits cleanly, so Zcash carries the order and the reply. Ideas that would make it even better for agents: a quote or dry-run mode for buy-products, an idempotency key so a retried call can't buy twice, and a delivery webhook instead of polling.
```
