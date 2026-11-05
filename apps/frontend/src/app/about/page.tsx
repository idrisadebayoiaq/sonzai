import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">About</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">Why Sonzai</h1>
      <div className="mt-8 space-y-5 text-[var(--muted)] leading-relaxed">
        <p>
          Most AI music tools default to a US/UK pop voice. Sonzai is built so a Nigeria request steers Nigerian English
          delivery and Afrobeats-aware drums — not a generic Mid-Atlantic vocal over EDM.
        </p>
        <p>
          You control country/accent, genre, song type, mood, language mix, energy, and optional voice reference. Under
          the hood, Style Packs compile those choices into rich generation prompts for ACE-Step.
        </p>
        <p>
          Auth and song history run on Supabase. Generation uses the free AceMusic ACE-Step cloud when configured, with
          an optional self-hosted / Colab path.
        </p>
      </div>
      <Link href="/create" className="btn-primary mt-10 inline-flex">
        Open the studio
      </Link>
    </div>
  );
}
