"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/create` },
      });
      if (err) {
        setError(err.message);
      } else {
        setMessage("Check your email for the magic link.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send login link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="anim-rise text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Welcome back</p>
      <h1 className="anim-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">Sign in</h1>
      <p className="anim-rise-delay-2 mt-3 text-[var(--muted)]">
        Magic link via email. No password to remember.
      </p>

      <form onSubmit={onSubmit} className="anim-rise-delay-3 panel mt-8 space-y-5 p-6">
        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Sending…" : "Send magic link"}
        </button>
        {message && <p className="text-sm text-[var(--accent-2)]">{message}</p>}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Just browsing?{" "}
        <Link href="/create" className="text-[var(--accent)]">
          Open the create studio
        </Link>
      </p>
    </div>
  );
}
