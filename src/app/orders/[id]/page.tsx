import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BrandLogo } from "@/components/brand";
import { Receipt } from "./receipt";

export const metadata: Metadata = { title: "Receipt" };

async function ReceiptLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Receipt id={decodeURIComponent(id)} />;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <BrandLogo />
          <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground">
            Console
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <ReceiptLoader params={params} />
        </Suspense>
      </main>
    </>
  );
}
