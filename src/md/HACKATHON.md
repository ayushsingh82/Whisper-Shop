# Free Society Hack: rules, deadlines and our checklist

Source: the Stadium program page (Zcash Privacy track and Agentic Commerce track by Bitrefill). All times IST.

## Schedule (Nov 2026)

| When | What |
|---|---|
| Wed 4 Nov 11:00 | Hack starts |
| Wed 4 Nov 20:00 | Evening judging (projects in by now) |
| **Thu 5 Nov 00:00** | **Submissions close** |
| Thu 5 Nov 08:00 | Morning judging |
| Thu 5 Nov 11:00 | Top teams announced to demo |
| Thu 5 Nov 11:30 | Demos |
| Thu 5 Nov 13:00 | Prize announcements |

Venue: True Tramm Trunk, BKC, Mumbai. Submit on Stadium with the email registered on Luma. Team of up to 4, one point person gets the prize. We enter **both tracks** (pick "Both" on the form).

## Prizes

- Privacy: $1,300 / $300 x2 / $200 x2. Ecosystem prize: $100 more for two podium projects that finish a milestone.
- Agentic Commerce (Bitrefill): $1,000 / $800 / $600, plus $100 for the best feedback.

## What we must submit

| Item | Track | Required |
|---|---|---|
| One-line pitch | Privacy | Yes |
| Public repo with README listing every technology and design decisions | Both | Yes |
| **One testnet shielded txid our project created** (Stadium checks it) | Privacy | Yes |
| Privacy and trust note (what stays private, what we reveal and to whom, what users must trust, what we fix next) | Privacy | Yes |
| 30-day next-step plan with links | Privacy | Yes |
| Public URL for judges, or show Zcash working in video/README (agents and bots may skip) | Privacy | Yes for apps |
| **Demo video, 3 min max, or a live link showing the agent make a real purchase** | Commerce | Yes |
| Bitrefill feedback: what worked and what did not | Commerce | Yes |
| Privacy demo video (judges watch only the first 2 minutes) | Privacy | Optional, strongly preferred |
| Feedback on what slowed us down | Privacy | Optional |

## Hard rules

- **Privacy:** testnet only, NU7, shielded funds through unified addresses (`utest1...`). Mainnet funds, Sprout, v4 transactions, ZSAs and zcashd wallet RPC are out of scope.
- **Privacy scoring:** every step must be real. A project with a mocked step cannot score full marks on Works, and a project scoring 0 on Works cannot win.
- **Commerce:** use at least one Bitrefill surface (MCP, CLI, Agent Skills, x402 or REST API). The agent-initiated purchase in the demo must be real, not mocked.
- **Commerce:** the test product `delos-syldavia` must never be paid for with real money or store credit.
- Commerce judging: three Bitrefill judges score 1 to 5 on use of Bitrefill tech, following requirements, and innovation (max 15). Ties go to innovation.

## Faucets and testnet facts

- Coins are TAZ (worthless). NU7 is live on testnet, about 25 s blocks. Since NU6.3 new shielded funds go to the Ironwood pool. Ignore old Orchard or Sprout tutorials.
- Public lightwalletd: `https://testnet.zec.rocks:443` (what we use).
- Faucets: **Valar** (0.125 TAZ per day per network), **Fauzec** (1 TAZ per day per address), **Jino Labs**. Any mentor can send more TAZ.
- Local option: **Thus Spoke Zakura** runs a private NU7 network on a laptop with its own faucet and on-demand mining. Check on public testnet before the demo.
- Explorers: Zexplorer, testnet.zcashexplorer.app.
- Treat payments as seen, then mined, then confirmed. Let the SDK compute ZIP 317 fees.
- Help: mentors on the floor, `#zechub` on the Zcash Discord, WebZero hacker chat on Telegram.

## Our status against the checklist

| Item | Status |
|---|---|
| Public repo and README | Done, keep updating |
| Real testnet shielded txid | **Blocked: no TAZ yet** (use Fauzec or Valar, or ask a mentor) |
| Real agent-initiated Bitrefill purchase | Key works, $25 credit. Needs balance-payment wiring and a funded flow |
| Privacy and trust note | Draft in README, finalise before submit |
| 30-day plan | Draft in `DESIGN.md`, finalise before submit |
| Demo video | Not recorded. Keep the shielded payment to reply inside the first 2 minutes |
| Bitrefill feedback | Collect notes while building |
| Teammates added with Luma emails | Not done |

Decision: no mainnet (out of scope for Privacy). Bitrefill is paid from the account balance, and we say so plainly in the demo.
