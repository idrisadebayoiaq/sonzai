"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getProfile } from "@/lib/api";
import { PlayerBar } from "@/components/PlayerBar";
import { PlayerProvider } from "@/components/PlayerProvider";

const nav = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/create", label: "Create" },
  { href: "/dashboard/library", label: "Library" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    getProfile()
      .then((p) => setCredits(p.credits_remaining ?? 0))
      .catch(() => setCredits(null));
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Loading studio…
      </div>
    );
  }

  const name =
    (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "Creator";

  return (
    <PlayerProvider>
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-[var(--line)] bg-[rgba(11,16,14,0.95)] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="font-[family-name:var(--font-display)] text-xl font-bold">
            Sonzai
          </Link>
          <button
            type="button"
            className="btn-ghost !px-3 !py-1.5 text-sm lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
          </button>
        </div>

        <div className={`${menuOpen ? "block" : "hidden"} px-3 pb-6 lg:block`}>
          <div className="mb-4 rounded-xl border border-[var(--line)] bg-black/20 px-4 py-3">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Credits remaining</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--accent)]">
              {credits === null ? "—" : credits}
            </p>
          </div>

          <nav className="space-y-1 text-sm">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-xl px-3 py-2.5 transition ${
                    active ? "bg-white/8 text-[var(--fg)]" : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 space-y-2 border-t border-[var(--line)] pt-4">
            <Link href="/" className="block rounded-xl px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--fg)]">
              Marketing site
            </Link>
            <button
              type="button"
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--muted)] hover:text-[var(--fg)]"
              onClick={() => signOut().then(() => router.push("/"))}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[rgba(11,16,14,0.85)] px-5 py-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Studio</p>
            <p className="text-sm text-[var(--muted)]">Generate real AceMusic songs from your lyrics & style</p>
          </div>
          <Link href="/dashboard/create" className="btn-primary !px-4 !py-2 text-sm">
            New song
          </Link>
        </header>
        <div className="px-5 py-8 pb-8 md:px-8">{children}</div>
        <PlayerBar />
      </div>
    </div>
    </PlayerProvider>
  );
}
