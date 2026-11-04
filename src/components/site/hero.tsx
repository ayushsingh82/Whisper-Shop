import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, EyeOff, KeyRound, Lock, MailX } from "lucide-react";
import { cn } from "@/lib/utils";

const card = "rounded-2xl border bg-card p-4 shadow-[0_24px_60px_-15px] shadow-black/50 ring-1 ring-white/10";

function Float({ className, duration = 8, delay = 0, children }: { className?: string; duration?: number; delay?: number; children: ReactNode }) {
  return (
    <div className={cn("absolute hidden xl:block", className)}>
      <div className="animate-[float_var(--d)_ease-in-out_infinite]" style={{ "--d": `${duration}s`, animationDelay: `${delay}s` } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

function Bubble({ side, label, children }: { side: "out" | "in"; label: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1", side === "out" ? "items-end" : "items-start")}>
      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <Lock className="size-2.5" /> {label}
      </span>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3 text-left font-mono text-[13px] leading-relaxed",
          side === "out" ? "rounded-br-sm bg-accent text-accent-foreground" : "rounded-bl-sm border bg-muted",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function MemoChat() {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border bg-card p-4 text-left shadow-[0_40px_90px_-20px] shadow-black/70 ring-1 ring-white/10">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-accent font-mono text-xs font-bold text-accent-foreground">Z</span>
          <div>
            <p className="text-sm font-medium leading-none">shop.whisper</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">u1whisper…k7x · shielded</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> online
        </span>
      </div>
      <div className="mt-4 space-y-4">
        <Bubble side="out" label="You · 0.08 ZEC · memo">
          buy: esim thailand 5gb 7d
          <br />
          max: 12 USD
          <br />
          reply: u1you…q9m
        </Bubble>
        <div className="mx-auto w-fit rounded-full border bg-muted px-3 py-1 font-mono text-[10px] text-muted-foreground">
          decrypt → parse → policy ok → invoice → swap → paid
        </div>
        <Bubble side="in" label="Shop · shielded reply">
          ✓ Airalo Thailand 5GB / 7 days
          <br />
          <span className="text-accent">LPA:1$smdp.io$K2X9…QF</span>
          <br />
          <span className="text-muted-foreground">Scan or paste in Settings → eSIM. Spent $9.40 of $12.</span>
        </Bubble>
      </div>
      <p className="mt-4 border-t pt-3 text-center font-mono text-[10px] text-muted-foreground">No site. No account. No email. Just a memo.</p>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Float className="left-[3%] top-[18%] -rotate-[6deg]" duration={7}>
          <div className={cn(card, "w-52")}>
            <MailX className="size-5 text-accent" />
            <p className="mt-3 text-sm font-medium">No email</p>
            <p className="mt-1 text-xs text-muted-foreground">Codes never touch an inbox or a phone number.</p>
          </div>
        </Float>
        <Float className="right-[3%] top-[14%] rotate-[5deg]" duration={9} delay={1}>
          <div className={cn(card, "w-52")}>
            <EyeOff className="size-5 text-accent" />
            <p className="mt-3 text-sm font-medium">Shielded both ways</p>
            <p className="mt-1 text-xs text-muted-foreground">Order and delivery are encrypted memos.</p>
          </div>
        </Float>
        <Float className="left-[5%] bottom-[10%] rotate-[3deg]" duration={8} delay={3}>
          <div className={cn(card, "w-52")}>
            <KeyRound className="size-5 text-accent" />
            <p className="mt-3 text-sm font-medium">Code decides</p>
            <p className="mt-1 text-xs text-muted-foreground">The LLM proposes. Plain code holds the spending rules.</p>
          </div>
        </Float>
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28 sm:pb-32">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-accent" />
          Zcash Free Society Hackathon · Privacy + Bitrefill tracks
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          The memo is the order.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Send shielded ZEC with a note like <span className="font-mono text-foreground">esim thailand 5gb</span>. An agent buys it and whispers the code back in a shielded memo.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#how" className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90">
            See how it works <ArrowRight className="size-4" />
          </a>
          <a href="#memo" className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted">
            Read the memo format
          </a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Testnet build. Any Zcash wallet that can send a memo works.</p>
        <div className="mt-14 animate-[rise_.7s_ease-out_both]">
          <MemoChat />
        </div>
      </div>
    </section>
  );
}
