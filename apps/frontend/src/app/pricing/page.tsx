import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Pricing</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">Free to start</h1>
      <div className="panel mt-10 p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Free studio</h2>
        <ul className="mt-5 space-y-3 text-[var(--muted)]">
          <li>Email + password accounts</li>
          <li>Country / genre Style Packs</li>
          <li>Voice upload (reference)</li>
          <li>Up to 8 generations per day</li>
          <li>Private library</li>
        </ul>
        <Link href="/signup" className="btn-primary mt-8 inline-flex">
          Create free account
        </Link>
      </div>
      <p className="mt-6 text-sm text-[var(--muted)]">
        Heavy public traffic may need paid GPU later. The product software and AceMusic free key path stay free for personal use.
      </p>
    </div>
  );
}
