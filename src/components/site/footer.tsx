import { BrandLogo } from "@/components/brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <BrandLogo />
        <p className="text-xs text-muted-foreground">Built for the Zcash Free Society Hackathon, Mumbai 2026. Testnet only.</p>
        <a href="https://github.com/ayushsingh82/Wshiper-Shop" className="text-xs text-muted-foreground hover:text-foreground">GitHub</a>
      </div>
    </footer>
  );
}
