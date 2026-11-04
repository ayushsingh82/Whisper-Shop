"use client";

import { useEffect, useState } from "react";

const ROW = 52;

const ACTORS = [
  { x: 130, name: "Buyer wallet", sub: "any Zcash wallet" },
  { x: 370, name: "Shop wallet", sub: "viewing key" },
  { x: 610, name: "Agent", sub: "worker" },
  { x: 850, name: "Policy engine", sub: "plain code" },
  { x: 1090, name: "Bitrefill", sub: "MCP API" },
];
const X = Object.fromEntries(ACTORS.map((a, i) => [i, a.x])) as Record<number, number>;

type Msg = { from: number; to: number; text: string; back?: boolean; n: number };
const MSGS: Msg[] = [
  { n: 1, from: 0, to: 1, text: "shielded ZEC + memo (the order)" },
  { n: 2, from: 1, to: 2, text: "decrypted memo" },
  { n: 3, from: 2, to: 2, text: "parse order (the model only proposes)" },
  { n: 4, from: 2, to: 3, text: "price, cap, category, amount paid?" },
  { n: 5, from: 3, to: 2, text: "approved", back: true },
  { n: 6, from: 2, to: 4, text: "search, then buy (account balance)" },
  { n: 7, from: 4, to: 2, text: "eSIM link / code", back: true },
  { n: 8, from: 2, to: 1, text: "send reply memo", back: true },
  { n: 9, from: 1, to: 0, text: "shielded reply (the code)", back: true },
];

export function Sequence() {
  const [step, setStep] = useState<number | null>(null);
  useEffect(() => {
    // /architecture?step=N shows exactly the first N messages with no animation (used for screen captures)
    const n = new URLSearchParams(window.location.search).get("step");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL is only possible after mount
    if (n !== null) setStep(Number(n));
  }, []);
  const top = 110;
  const h = top + MSGS.length * ROW + 90;
  return (
    <svg viewBox={`0 0 1220 ${h}`} role="img" aria-label="Sequence diagram of one order" className="w-full">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="fill-accent" />
        </marker>
        <marker id="arr-d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" className="fill-muted-foreground" />
        </marker>
      </defs>
      {ACTORS.map((a) => (
        <g key={a.name}>
          <rect x={a.x - 90} y={14} width={180} height={56} rx={12} className="fill-card stroke-border" />
          <text x={a.x} y={38} textAnchor="middle" className="fill-foreground text-[15px] font-medium">{a.name}</text>
          <text x={a.x} y={57} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">{a.sub}</text>
          <line x1={a.x} y1={70} x2={a.x} y2={h - 70} className="stroke-border" strokeDasharray="4 5" />
        </g>
      ))}
      {MSGS.map((m, i) => {
        const hidden = step !== null && i >= step;
        const y = top + i * ROW;
        const x1 = X[m.from];
        const x2 = X[m.to];
        const label = (x: number, anchor: "start" | "middle" | "end", dy = -9) => (
          <text x={x} y={y + dy} textAnchor={anchor} className="fill-foreground text-[13px]">{m.text}</text>
        );
        return (
          <g key={m.n} style={hidden ? { opacity: 0 } : step === null ? { animation: `ws-in .5s ease-out ${0.4 + i * 0.7}s both` } : undefined}>
            {m.from === m.to ? (
              <>
                <path d={`M${x1} ${y - 10} h46 v22 h-46`} fill="none" className="stroke-accent" strokeWidth={1.6} markerEnd="url(#arr)" />
                <text x={x1 + 58} y={y + 6} className="fill-foreground text-[13px]">{m.text}</text>
              </>
            ) : (
              <>
                <line
                  x1={x1 + (x2 > x1 ? 6 : -6)} y1={y} x2={x2 + (x2 > x1 ? -6 : 6)} y2={y}
                  className={m.back ? "stroke-muted-foreground" : "stroke-accent"} strokeWidth={1.6}
                  strokeDasharray={m.back ? "6 5" : undefined} markerEnd={m.back ? "url(#arr-d)" : "url(#arr)"}
                />
                {label((x1 + x2) / 2, "middle")}
              </>
            )}
            <circle cx={Math.min(x1, x2) - 22 < 20 ? 18 : Math.min(x1, x2) - 22} cy={y} r={11} className="fill-accent" />
            <text x={Math.min(x1, x2) - 22 < 20 ? 18 : Math.min(x1, x2) - 22} y={y + 4} textAnchor="middle" className="fill-accent-foreground font-mono text-[11px] font-semibold">{m.n}</text>
          </g>
        );
      })}
      <g style={step !== null && step < MSGS.length ? { opacity: 0 } : step === null ? { animation: `ws-in .5s ease-out ${0.4 + MSGS.length * 0.7}s both` } : undefined}>
      <rect x={130} y={h - 62} width={960} height={44} rx={10} className="fill-red-400/10 stroke-red-400/40" />
      <text x={610} y={h - 34} textAnchor="middle" className="fill-red-300 text-[13px]">
        Rejected, over cap, underpaid or failed at any step: the agent sends a shielded refund memo with the reason.
      </text>
      </g>
    </svg>
  );
}

