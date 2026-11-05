import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  {
    title: "Sign up",
    body: "Create an account with email and password (Supabase Auth). Your songs stay private to your account.",
  },
  {
    title: "Describe the sound",
    body: "Pick country accent, genre, song type, mood, language mix, vocal style, energy, and BPM.",
  },
  {
    title: "Add lyrics (+ optional voice)",
    body: "Paste lyrics. Optionally upload 10–60s of clean voice with consent — used as a timbre reference.",
  },
  {
    title: "Generate & listen",
    body: "A background worker builds the Style Pack prompt, calls ACE-Step, and saves the track to your library.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Guide</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">How it works</h1>
      <ol className="mt-10 space-y-6">
        {steps.map((step, i) => (
          <li key={step.title} className="panel p-6">
            <p className="text-xs text-[var(--accent)]">Step {i + 1}</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">{step.title}</h2>
            <p className="mt-2 text-[var(--muted)] leading-relaxed">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex gap-3">
        <Link href="/signup" className="btn-primary">
          Sign up
        </Link>
        <Link href="/create" className="btn-ghost">
          Create
        </Link>
      </div>
    </div>
  );
}
