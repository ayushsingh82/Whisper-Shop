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

## Privacy and trust note (draft)

- **What stays private:** the payment amount, the memo (order) and the reply (code) are shielded on-chain. Public observers see nothing about them.
- **What the app reveals, and to whom:**
  - The shop operator can read every order, because the shop wallet holds the viewing key.
  - Bitrefill sees the invoice and its payment from the account balance. It does not see the buyer's Zcash address.
  - The lightwalletd server (`testnet.zec.rocks`) sees the shop wallet's IP address and sync pattern.
- **What users must trust:** the operator (reads orders and holds the spending key for replies), Bitrefill (delivers the code), and the light-wallet server operator.
- **What we would fix next:** payment to Bitrefill uses account balance, not ZEC, so ZEC does not pay Bitrefill directly. Bitrefill does not document ZEC, so a swap would leave the shielded pool. Also run our own lightwalletd and add Nym for network privacy. Memos hold about 512 bytes, so QR images cannot be returned.

## Evidence to collect before submitting

- [x] Testnet shielded txid (order): `3d9fc0248a35bf2fc88da224139a333256a886f37bd1f75ae31362fa2a1d74d3`
- [x] Reply txid: `96f99a16cebf803ce3ad98cd012aa6888b9f3245adecbfadf372ca4dcd99fede`
- [x] Bitrefill invoice `2c244888-c027-484e-9d5c-43b3eef05c49`, complete and delivered
- [ ] Demo video: 3 minutes max, payment to reply inside the first 2 minutes
- [ ] Public repo link with commit history
- [ ] Bitrefill feedback: what worked, what did not (write while building)
- [ ] Teammates added with their Luma emails
