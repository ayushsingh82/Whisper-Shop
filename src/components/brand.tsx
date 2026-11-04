import Link from "next/link";
import { cn } from "@/lib/utils";

/** Whisper Shop mark: a shield that is also a speech bubble, with a keyhole. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Whisper Shop" className={cn("size-8", className)}>
      <rect width="64" height="64" rx="16" fill="#131313" />
      <path d="M32 10 48 15.5V29c0 9.5-6 16-13.5 19.5L23 55l1.5-8C18.5 44 16 37.5 16 29V15.5L32 10Z" fill="#f5a524" />
      <circle cx="32" cy="27" r="4" fill="#131313" />
      <path d="M30 29h4l1.5 8h-7Z" fill="#131313" />
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
