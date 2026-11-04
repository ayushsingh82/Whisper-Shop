import { ArrowRight, Check, ChevronDown, Eye, Gauge, MessageSquareLock, ReceiptText, ShieldCheck, ShoppingBag, Undo2, X } from "lucide-react";

const section = "mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6";

function Heading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-3 text-muted-foreground">{body}</p>}
    </div>
  );
}

export function Stats() {
  const items = [
    ["0", "accounts, emails or phone numbers"],
    ["2", "shielded memos: the order and the reply"],
    ["1", "deterministic policy gate before any spend"],
    ["100%", "of failures end in a refund memo"],
  ];
  return (
    <section className="border-y bg-card/40">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
        {items.map(([n, label]) => (
          <div key={label} className="text-center">
            <dt className="font-display text-4xl font-semibold text-accent">{n}</dt>
            <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const STEPS = [
  { icon: MessageSquareLock, name: "Send a memo", text: "Pay the shop's unified address with shielded ZEC. The order and your return address go in the memo." },
  { icon: Gauge, name: "Policy check", text: "The agent decrypts the memo. Code checks the price, your cap, the category and the amount you paid." },
  { icon: ShoppingBag, name: "Buy it", text: "It finds the product on Bitrefill, creates the invoice, swaps ZEC to the invoice asset and pays." },
  { icon: ReceiptText, name: "Whisper back", text: "The code or eSIM details arrive as a shielded memo in your wallet. Failures return a refund memo." },
];

export function Pipeline() {
  return (
    <section id="how" className={section}>
      <Heading eyebrow="How it works" title="One payment in. One whisper out." body="Everything happens inside the wallet you already use." />
      <div className="grid gap-4 md:grid-cols-4">
        {STEPS.map(({ icon: Icon, name, text }, i) => (
          <div key={name} className="group relative rounded-xl border bg-card p-5 transition-colors hover:border-accent/50">
            {i < STEPS.length - 1 && <ArrowRight className="absolute -right-3.5 top-1/2 z-10 hidden size-4 -translate-y-1/2 rounded-full bg-background text-muted-foreground md:block" />}
            <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
            <Icon className="mt-3 size-6 text-accent" />
            <h3 className="mt-3 font-display text-lg font-semibold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MemoSpec() {
  return (
    <section id="memo" className={section}>
      <Heading eyebrow="The memo" title="A tiny open format any wallet can send." body="Plain text. The LLM normalizes it, and code validates it." />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Order memo (v0 draft)</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-[13px] leading-relaxed">
{`WS1
buy: esim thailand 5gb 7d
max: 12 USD
reply: u1you...q9m`}
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">Ambiguous order? The agent asks one clarifying memo, or refunds.</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Reply memo</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-[13px] leading-relaxed">
{`WS1 OK
item: Thailand 5GB / 7d
spent: 9.40 USD
code: LPA:1$smdp.io$K2X9...QF`}
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">Memos hold about 512 bytes: enough for codes and activation strings.</p>
        </div>
      </div>
    </section>
  );
}

const SEES: [string, string][] = [
  ["Chain observers", "Nothing: amount, order and reply are shielded"],
  ["Shop operator", "Every order and its contents"],
  ["Bitrefill", "The invoice and the payment"],
  ["Swap provider", "The swap from ZEC to the invoice asset"],
];

export function Privacy() {
  return (
    <section id="privacy" className={section}>
      <Heading eyebrow="Privacy and trust" title="Honest about who sees what." body="Private against outsiders. Not against the operator, and the swap leaves the pool." />
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border bg-card">
        {SEES.map(([who, sees], i) => (
          <div key={who} className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${i ? "border-t" : ""}`}>
            <span className="flex items-center gap-2 font-medium"><Eye className="size-4 text-accent" />{who}</span>
            <span className="text-sm text-muted-foreground">{sees}</span>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-muted-foreground">
        Bitrefill does not document ZEC as a payment method, so the agent swaps ZEC to a supported asset. We never claim otherwise.
      </p>
    </section>
  );
}

const COMPARE: [string, string, string][] = [
  ["Buy with Zcash today", "Create an account, enter an email", "Send a payment with a memo"],
  ["Where the code goes", "Inbox, SMS, a web page", "A shielded memo to your wallet"],
  ["An agent misreads the order", "Pays whatever the model decided", "Policy code refuses over-cap or unknown items"],
  ["Something fails after payment", "Support ticket", "Refund memo with the reason"],
  ["Same payment seen twice", "Possible double purchase", "Idempotent on txid and output index"],
];

export function Compare() {
  return (
    <section id="vs" className={section}>
      <Heading eyebrow="Why it's different" title="Other Zcash agents wrap x402. This one uses the memo." />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-normal">Situation</th>
              <th className="px-5 py-3 font-normal">Usual way</th>
              <th className="px-5 py-3 font-normal text-accent">Whisper Shop</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([a, b, c]) => (
              <tr key={a} className="border-b last:border-0">
                <td className="px-5 py-4 font-medium">{a}</td>
                <td className="px-5 py-4 text-muted-foreground"><X className="mr-1.5 inline size-3.5 text-red-400" />{b}</td>
                <td className="px-5 py-4"><Check className="mr-1.5 inline size-3.5 text-emerald-400" />{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const SAFETY = [
  { icon: ShieldCheck, name: "The LLM never spends", text: "It turns text into a proposed order. Deterministic code approves or rejects." },
  { icon: Undo2, name: "Fail closed", text: "Expired invoice, bad slippage or a missing code leads to a refund or a human review." },
  { icon: Gauge, name: "Caps everywhere", text: "Per-order and daily limits, allowed categories and countries." },
];

export function Safety() {
  return (
    <section className={section}>
      <Heading eyebrow="Safety" title="Autonomous, but on a short leash." />
      <div className="grid gap-4 md:grid-cols-3">
        {SAFETY.map(({ icon: Icon, name, text }) => (
          <div key={name} className="rounded-xl border bg-card p-5 transition-colors hover:border-accent/50">
            <Icon className="size-6 text-accent" />
            <h3 className="mt-3 font-display text-lg font-semibold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQ: [string, string][] = [
  ["Does Bitrefill accept ZEC?", "Not as far as its docs say. The agent swaps ZEC to a supported asset through NEAR Intents and pays the invoice. That leg is visible to the swap provider."],
  ["Can the operator read my order?", "Yes. Privacy here is against outsiders and chain observers. The privacy note says so plainly."],
  ["What can I buy?", "Whatever Bitrefill sells that fits the policy: eSIMs, mobile top-ups and gift cards."],
  ["What if the purchase fails?", "You get a refund memo with the reason. Payment steps are never retried blindly."],
  ["Is this live?", "It is a hackathon build on Zcash testnet. The landing page comes first, then the agent."],
];

export function Faq() {
  return (
    <section id="faq" className={`${section} max-w-3xl`}>
      <Heading eyebrow="FAQ" title="Questions" />
      <div className="space-y-2">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group rounded-xl border bg-card px-5 py-4 open:border-accent/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <h2 className="relative font-display text-3xl font-semibold tracking-tight sm:text-4xl">Shop like it&apos;s a private message.</h2>
        <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">Open source, testnet first. Follow the build on GitHub.</p>
        <a href="https://github.com/ayushsingh82/Wshiper-Shop" className="relative mt-7 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90">
          View on GitHub <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}
