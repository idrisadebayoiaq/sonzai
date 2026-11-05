import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl font-bold">Sonzai</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            AI music with regional accent and genre control — your lyrics, your voice, your vibe.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Product</p>
          <ul className="space-y-2 text-[var(--muted)]">
            <li>
              <Link href="/create">Create</Link>
            </li>
            <li>
              <Link href="/library">Library</Link>
            </li>
            <li>
              <Link href="/how-it-works">How it works</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Account</p>
          <ul className="space-y-2 text-[var(--muted)]">
            <li>
              <Link href="/login">Log in</Link>
            </li>
            <li>
              <Link href="/signup">Sign up</Link>
            </li>
            <li>
              <Link href="/account">Account</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Sonzai. AI-generated audio — create responsibly.
      </p>
    </footer>
  );
}
