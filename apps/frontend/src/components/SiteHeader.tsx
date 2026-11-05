"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/create", label: "Create" },
  { href: "/library", label: "Library" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(11,16,14,0.78)] px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
          Sonzai
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  active ? "bg-white/8 text-[var(--fg)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {!loading && user ? (
            <>
              <Link href="/account" className="hidden text-[var(--muted)] hover:text-[var(--fg)] sm:inline">
                {user.email?.split("@")[0]}
              </Link>
              <button type="button" className="btn-ghost !px-3 !py-1.5 text-sm" onClick={() => signOut()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost !px-3 !py-1.5 text-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary !px-3 !py-1.5 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="mx-auto mt-3 flex max-w-6xl gap-2 overflow-x-auto text-sm md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-full px-3 py-1 text-[var(--muted)]">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
