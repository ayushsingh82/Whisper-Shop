import Link from "next/link";
import { cn } from "@/lib/utils";

/** Whisper Shop mark: a speech bubble with a shielded keyhole, on the accent tile. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Whisper Shop" className={cn("size-7", className)}>
      <rect width="64" height="64" rx="16" className="fill-accent" />
      <path
        className="fill-accent-foreground"
        d="M18 14h28a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H34l-9 9v-9h-7a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8Z"
      />
      <circle cx="32" cy="28" r="4.5" className="fill-accent" />
      <path className="fill-accent" d="M30 30h4l1.5 8h-7Z" />
    </svg>
  );
}

export function BrandLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <BrandMark />
      <span className="font-display text-lg font-semibold tracking-tight">Whisper Shop</span>
    </Link>
  );
}
