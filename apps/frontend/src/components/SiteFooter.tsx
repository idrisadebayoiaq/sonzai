import Link from "next/link";

const productLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/styles", label: "Styles" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

const accountLinks = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/dashboard", label: "Dashboard" },
];

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
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-[var(--fg)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Account</p>
          <ul className="space-y-2 text-[var(--muted)]">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-[var(--fg)]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Sonzai. AI-generated audio — create responsibly.
      </p>
    </footer>
  );
}
