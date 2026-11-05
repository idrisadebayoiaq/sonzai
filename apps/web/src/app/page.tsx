import Link from "next/link";
import { Waveform } from "@/components/Waveform";

export default function HomePage() {
  return (
    <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      {/* Full-bleed visual plane */}
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(240,180,90,0.28),transparent_70%)] blur-2xl" />
        <div className="hero-orb absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(74,214,160,0.2),transparent_70%)] blur-2xl [animation-delay:1.5s]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(243,239,228,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(243,239,228,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="anim-rise mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
            Music studio
          </p>
          <h1 className="anim-rise-delay-1 font-[family-name:var(--font-display)] text-6xl leading-[0.92] font-extrabold tracking-tight sm:text-7xl md:text-8xl">
            Sonzai
          </h1>
          <p className="anim-rise-delay-2 mt-6 max-w-md text-lg leading-relaxed text-[var(--muted)]">
            Write lyrics. Choose the country accent and genre. Hear a song that feels local — not generic AI pop.
          </p>
          <div className="anim-rise-delay-3 mt-10 flex flex-wrap gap-3">
            <Link href="/create" className="btn-primary">
              Create a song
            </Link>
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
          </div>
        </div>

        <div className="anim-rise-delay-2 relative mx-auto flex h-64 w-full max-w-lg items-end justify-center sm:h-80 lg:h-[28rem]">
          <div className="absolute inset-8 rounded-full border border-[var(--line)] opacity-40" />
          <div className="absolute inset-16 rounded-full border border-[var(--line)] opacity-25" />
          <Waveform className="relative z-10 h-40 w-full px-6 sm:h-56" />
        </div>
      </div>
    </section>
  );
}
