# Setup

How to run Whisper Shop locally, from zero to a real testnet order. Wallet directories and key files live **outside** this repo, in `~/.whisper-shop/`.

## 1. Install the tools

```bash
npm install
cargo install --git https://github.com/zcash/zcash-devtool --locked   # builds in about 6 minutes
zcash-devtool --help
```

`zcash-devtool` warns that its CLI "can and will change at any time" and is not meant for significant funds. We only use testnet funds.

## 2. Create the two testnet wallets

```bash
B=~/.whisper-shop; mkdir -p $B && chmod 700 $B
zcash-devtool wallet -w $B/shop  init --name whisper-shop  -i $B/shop.key  -n test
zcash-devtool wallet -w $B/buyer init --name whisper-buyer -i $B/buyer.key -n test
chmod 600 $B/*.key
zcash-devtool wallet -w $B/shop get-info   # expect "chain_name":"test"
```

The default server alias `zecrocks` resolves to `testnet.zec.rocks`. Back up the `.key` files if the wallets ever hold anything you care about.

## 3. Fund the buyer wallet

```bash
zcash-devtool wallet -w ~/.whisper-shop/buyer list-addresses   # copy the Default Address exactly
```

Send testnet ZEC to it from a faucet. Ask the mentors or the Zcash Discord for the current faucet URL, since none is listed here. Then check:

```bash
zcash-devtool wallet -w ~/.whisper-shop/buyer sync
zcash-devtool wallet -w ~/.whisper-shop/buyer balance --json
```

Notes arrive spendable after the default confirmation policy (3 trusted or 10 untrusted confirmations), so allow some minutes.

## 4. Configure

```bash
cp .env.example .env.local
```

Set `WHISPER_WALLET_DIR=~/.whisper-shop/shop` (use the absolute path) and `WHISPER_IDENTITY=~/.whisper-shop/shop.key`. Add `BITREFILL_API_KEY` when you have one. Without them the app runs with simulated adapters, and the console says so.

## 5. Run

```bash
npm run dev                                                   # UI and API on :3000
npx tsx --env-file=.env.local scripts/worker.mts 20           # polls the shop wallet every 20s
npx tsx scripts/send-order.mts "esim thailand 5gb 7d" 12      # places a real testnet order
```

The worker must be a long-running process. Do not host it on serverless functions.

## 6. Checks

```bash
npx tsx --test src/server/*.test.ts     # unit tests
npx tsx scripts/wallet-check.mts        # prints the real zcash-devtool help, changes nothing
BITREFILL_API_KEY=... npx tsx scripts/bitrefill-check.mts "esim thailand" TH   # read-only, no purchase
```

## Status

| Part | State |
|---|---|
| Memo parser, policy engine, state machine | Done, tested |
| Console (sidebar dashboard), receipt page, orders API | Done |
| zcash-devtool wallet adapter | Done and verified on testnet: sync, enhance, read memos, send memos |
| Bitrefill client | Done and verified: search, prices, purchase from account balance, delivery |
| Bitrefill payment | From account balance. No ZEC swap (Bitrefill does not document ZEC) |
| Real round trip | Done: shielded order, real eSIM purchase, shielded reply (see the README) |

Note: memos are only readable after `wallet enhance`, which the adapter runs after every sync.
