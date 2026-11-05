"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-[var(--muted)]">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold">Account</h1>
        <p className="mt-4 text-[var(--muted)]">You are signed out.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/login" className="btn-primary">
            Log in
          </Link>
          <Link href="/signup" className="btn-ghost">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  const name = (user.user_metadata?.display_name as string) || user.email?.split("@")[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Profile</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">Account</h1>

      <div className="panel mt-8 space-y-4 p-6">
        <Row label="Name" value={name || "—"} />
        <Row label="Email" value={user.email || "—"} />
        <Row label="User ID" value={user.id} />
        <Row label="Created" value={user.created_at ? new Date(user.created_at).toLocaleString() : "—"} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/create" className="btn-primary">
          Create song
        </Link>
        <Link href="/library" className="btn-ghost">
          Library
        </Link>
        <button type="button" className="btn-ghost" onClick={() => signOut()}>
          Log out
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--line)] pb-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <span className="break-all text-sm">{value}</span>
    </div>
  );
}
