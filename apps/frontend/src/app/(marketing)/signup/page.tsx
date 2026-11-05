"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await signUp(email.trim(), password, displayName.trim() || undefined);
      setMessage("Account created. Opening your dashboard…");
      router.push("/dashboard");
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not sign up";
      if (text.toLowerCase().includes("confirm")) {
        setMessage("Check your email to confirm your account, then log in.");
      } else {
        setError(text);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="anim-rise text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Get started</p>
      <h1 className="anim-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">Sign up</h1>
      <p className="anim-rise-delay-2 mt-3 text-[var(--muted)]">
        Free account with 50 credits to generate real AceMusic songs.
      </p>

      <form onSubmit={onSubmit} className="anim-rise-delay-3 panel mt-8 space-y-5 p-6">
        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Display name</span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Optional" />
        </label>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Confirm password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create account"}
        </button>
        {message && <p className="text-sm text-[var(--accent-2)]">{message}</p>}
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)]">
          Log in
        </Link>
      </p>
    </div>
  );
}
