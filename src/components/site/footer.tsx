import { BrandLogo } from "@/components/brand";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "The memo format", href: "#memo" },
      { label: "Privacy and trust", href: "#privacy" },
      { label: "FAQ", href: "#faq" },
      { label: "Open console", href: "/app" },
    ],
  },
  {
    title: "Built with",
    links: [
      { label: "Zcash", href: "https://z.cash" },
      { label: "Bitrefill", href: "https://www.bitrefill.com" },
      { label: "NEAR Intents", href: "https://near.org" },
      { label: "Next.js", href: "https://nextjs.org" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_repeat(2,1fr)]">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            An agent that buys with shielded Zcash. The memo is the order and the delivery channel.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" /> Testnet build
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© 2026 Whisper Shop. Released under the MIT License.</p>
          <p>Built for the Zcash Free Society Hackathon, Mumbai. Experimental software, testnet only.</p>
        </div>
      </div>
    </footer>
  );
}
