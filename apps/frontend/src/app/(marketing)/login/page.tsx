"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.push(next.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="anim-rise text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Welcome back</p>
      <h1 className="anim-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">Log in</h1>
      <p className="anim-rise-delay-2 mt-3 text-[var(--muted)]">Access your Sonzai studio dashboard.</p>

      <form onSubmit={onSubmit} className="anim-rise-delay-3 panel mt-8 space-y-5 p-6">
        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Log in"}
        </button>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/signup" className="text-[var(--accent)]">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-center text-[var(--muted)]">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
