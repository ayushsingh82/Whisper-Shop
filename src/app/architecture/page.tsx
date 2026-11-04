import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { Sequence } from "./sequence";

export const metadata: Metadata = {
  title: "Architecture",
  description: "How Whisper Shop turns a shielded Zcash memo into a purchase and a shielded reply.",
};

const MAIN = ["received", "parsed", "validated", "quoted", "invoiced", "paid", "fulfilled", "replied"];
const FAIL = [
  { name: "rejected", from: "bad memo or policy", to: "refunded" },
  { name: "needs_review", from: "paid but not delivered", to: "refunded" },
];

function States() {
  return (
    <div>
      <ol className="flex flex-wrap items-center gap-2">
        {MAIN.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className="rounded-full border border-accent/50 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">{s}</span>
            {i < MAIN.length - 1 && <span className="text-muted-foreground">→</span>}
          </li>
        ))}
      </ol>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {FAIL.map((f) => (
          <div key={f.name} className="rounded-xl border border-red-400/30 bg-red-400/5 p-4">
            <p className="font-mono text-xs text-red-300">{f.name} → {f.to}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.from}. The buyer gets a refund memo with the reason.</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Every money step is keyed on the transaction id and output index, so the same payment is never processed twice. A failed payment step is never retried automatically.
      </p>
    </div>
  );
}

const PARTS = [
  { name: "Wallet adapter", file: "src/server/zcash-cli.ts", text: "Syncs the shop wallet, fetches full transactions so memos can be decrypted, reads incoming memos and sends replies through zcash-devtool." },
  { name: "Parser", file: "src/server/parser.ts", text: "Turns the WS1 memo into a structured order: item, country, spending cap, reply address. Free text is also accepted." },
  { name: "Policy engine", file: "src/server/policy.ts", text: "Plain code that checks the order against per-order and daily caps, allowed categories and the amount actually paid." },
  { name: "Orchestrator", file: "src/server/orchestrator.ts", text: "The state machine. Runs one order end to end and always ends in a reply or a refund. It never throws." },
  { name: "Bitrefill client", file: "src/server/bitrefill.ts", text: "Searches products, buys from the account balance and reads delivery status over Bitrefill's MCP API." },
  { name: "Console and API", file: "src/app/app, src/app/api", text: "The dashboard you can open at /app: live pipeline, orders, wallets and balances. It reads the same order store." },
];

const SEES = [
  ["Chain observers", "Nothing: amount, memo and reply are shielded"],
  ["Shop operator", "Every order and its reply"],
  ["Bitrefill", "The invoice and its payment, not the buyer's Zcash address"],
  ["Light-wallet server", "The shop wallet's IP address and sync pattern, not memo contents"],
];

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function ArchitecturePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-6 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Architecture</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">How the memo becomes a purchase</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            One shielded payment in. One real Bitrefill purchase. One shielded reply out. Plain code holds the spending rules; the model never does.
          </p>
        </section>

        <Section id="flow" eyebrow="The flow" title="One order, step by step">
          <div className="overflow-x-auto rounded-2xl border bg-card p-4 sm:p-6">
            <div className="min-w-[720px]"><Sequence /></div>
          </div>
        </Section>

        <Section id="states" eyebrow="Order states" title="A state machine that always ends in a reply or a refund">
          <div className="rounded-2xl border bg-card p-6"><States /></div>
        </Section>

        <Section id="structure" eyebrow="Structure" title="The pieces">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PARTS.map((p) => (
              <div key={p.name} className="rounded-xl border bg-card p-5">
                <h3 className="text-sm font-medium">{p.name}</h3>
                <p className="mt-1 font-mono text-[11px] text-accent">{p.file}</p>
                <p className="mt-3 text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Two processes: the web app (Vercel-friendly, simulated demo) and a long-running worker that holds the wallet and polls it. See the deploy notes in the repository.
          </p>
        </Section>

        <Section id="privacy" eyebrow="Privacy and trust" title="Who sees what">
          <div className="overflow-hidden rounded-2xl border bg-card">
            {SEES.map(([who, what]) => (
              <div key={who} className="flex flex-col gap-1 border-b px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium">{who}</span>
                <span className="text-sm text-muted-foreground">{what}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            Honest limits: Bitrefill does not document Zcash, so it is paid from the shop&apos;s account balance and ZEC does not pay Bitrefill directly. Privacy is against outside observers, not against the operator. Memos hold about 512 bytes: enough for codes and links, not images.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
