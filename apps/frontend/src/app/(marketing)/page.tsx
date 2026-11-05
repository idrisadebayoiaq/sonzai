import type { Metadata } from "next";
import Link from "next/link";
import { Waveform } from "@/components/Waveform";
import { COUNTRIES, GENRES } from "@/lib/options";

export const metadata: Metadata = {
  title: "Sonzai — AI music with real regional feel",
  description:
    "Write lyrics, pick country accent and genre, optionally add your voice — generate songs that sound local, not generic AI pop.",
};

const faqs = [
  {
    q: "Do I need to know music production?",
    a: "No. You write or paste lyrics, choose a Style Pack (country + genre + mood), and Sonzai handles arrangement, vocals, and mix direction. Producers can still dial BPM, energy, and song type for tighter control.",
  },
  {
    q: "What makes Sonzai different from other AI music tools?",
    a: "Most generators default to a Mid-Atlantic pop vocal. Sonzai steers delivery, phrasing, and production cues toward the region you pick — Nigerian English on afrobeats, Ghanaian highlife warmth, amapiano log drums, and more.",
  },
  {
    q: "Can I use my own voice?",
    a: "Yes. Upload a short, clean reference clip (with consent). Sonzai uses it as a timbre guide — not a full clone — so the track can feel closer to you while staying within fair-use guardrails.",
  },
  {
    q: "Who owns the songs I generate?",
    a: "You do, for personal and commercial use within our terms. Always disclose AI-assisted audio where platforms or clients require it, and do not impersonate real artists without permission.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes. Sign up for free credits to explore Style Packs and build your library. Paid plans add more monthly credits and priority generation when demand is high.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
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
              Regional AI music studio
            </p>
            <h1 className="anim-rise-delay-1 font-[family-name:var(--font-display)] text-6xl leading-[0.92] font-extrabold tracking-tight sm:text-7xl md:text-8xl">
              Sonzai
            </h1>
            <p className="anim-rise-delay-2 mt-6 max-w-md text-lg leading-relaxed text-[var(--muted)]">
              Turn your lyrics into full songs with the accent, genre, and groove of the place you are making music for.
            </p>
            <div className="anim-rise-delay-3 mt-10 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Sign up free
              </Link>
              <Link href="/dashboard/create" className="btn-ghost">
                Open create studio
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

      <section className="border-t border-[var(--line)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">How it works</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
            Three steps from lyrics to listen
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">
            Sonzai is built for creators who care about how a song <em>sounds</em> in Lagos, Accra, Nairobi, or Johannesburg — not how it sounds on a generic global playlist.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Write & choose your pack",
                d: "Paste lyrics and select country accent, genre, mood, song type, language mix, and energy. Style Packs compile those choices into production-aware prompts.",
              },
              {
                n: "02",
                t: "Optional voice reference",
                d: "Upload 10–60 seconds of clean speech or singing if you want the vocal timbre to lean toward your voice. Skip this step anytime for a modeled vocal in your chosen style.",
              },
              {
                n: "03",
                t: "Generate & save",
                d: "A background pipeline builds the track, mixes toward your pack, and saves it to your library. Re-run with tweaked lyrics or BPM until it clicks.",
              },
            ].map((step) => (
              <div key={step.n} className="panel p-6">
                <p className="text-xs text-[var(--accent)]">{step.n}</p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-[var(--muted)]">
            <Link href="/how-it-works" className="text-[var(--accent)] underline-offset-4 hover:underline">
              Read the full pipeline →
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Style Packs</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
            Regional accents, real genres
          </h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
            Country packs steer pronunciation, ad-lib habits, and mix aesthetics. Genre packs shape drums, bass, and harmonic color. Combine them the way you would brief a human producer.
          </p>
          <p className="mt-10 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Countries</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {COUNTRIES.map((c) => (
              <span
                key={c.code}
                className="rounded-full border border-[var(--line)] bg-white/[0.03] px-4 py-2 text-sm transition hover:border-[var(--accent)]/40"
              >
                {c.name}
              </span>
            ))}
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Genres</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {GENRES.map((g) => (
              <span key={g} className="rounded-full bg-white/5 px-4 py-2 text-sm capitalize text-[var(--muted)]">
                {g}
              </span>
            ))}
          </div>
          <div className="mt-10 panel p-6 md:p-8">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">What a Style Pack actually does</h3>
            <ul className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-2">
              <li>Maps your country pick to vocal delivery and common phrasing patterns</li>
              <li>Locks genre-appropriate drum patterns, bass movement, and tempo ranges</li>
              <li>Respects language mix (e.g. Nigerian English + Pidgin, Yoruba + English)</li>
              <li>Adjusts energy, mood, and song type (hook, ballad, dance track, gospel)</li>
            </ul>
            <Link href="/styles" className="btn-ghost mt-6 inline-flex text-sm">
              Explore all Style Packs
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Why Sonzai</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
            Built for music that travels home first
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Accent-aware vocals",
                body: "Steer Nigerian, Ghanaian, Kenyan, South African, US, or UK delivery instead of a one-size-fits-all AI voice. Your lyrics stay yours; the performance matches the brief.",
              },
              {
                title: "Genre fidelity",
                body: "Afrobeats, amapiano, highlife, afrosoul, hip-hop, R&B, pop, and gospel each get distinct rhythmic and harmonic treatment — not the same four-on-the-floor with a filter.",
              },
              {
                title: "Creator-owned workflow",
                body: "Private library, job history, and re-generation when a hook is almost there. Export and use tracks in content, demos, and client work per our terms.",
              },
              {
                title: "Voice optional, not mandatory",
                body: "Start with modeled vocals in your pack, then add a reference clip when you want songs that feel closer to your brand or artist project.",
              },
              {
                title: "Transparent pipeline",
                body: "See stages from style build through generation, vocals, mixing, and upload. Know when to wait and when to tweak inputs instead of spamming regenerate.",
              },
              {
                title: "Fair starting cost",
                body: "Free credits to learn the tool. Upgrade when you are shipping weekly content or running a studio roster — not before you have heard what Sonzai can do.",
              },
            ].map((item) => (
              <div key={item.title} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Creator stories</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
            Use cases we designed for
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              {
                role: "Independent artist",
                story:
                  "Draft three afrobeats toplines over a week, test which hook lands on TikTok, then take the winner to your human producer for final production.",
                tags: ["Afrobeats", "Hooks", "Demos"],
              },
              {
                role: "Content creator",
                story:
                  "Generate short jingles and background beds with Ghanaian highlife color for YouTube intros — same brand voice, new melody each series.",
                tags: ["Highlife", "Jingles", "Brand"],
              },
              {
                role: "Pastor / worship leader",
                story:
                  "Turn sermon notes into a gospel ballad with choir energy for conference rehearsal, then iterate language mix for bilingual congregations.",
                tags: ["Gospel", "Ballad", "Choir"],
              },
              {
                role: "Ad agency writer",
                story:
                  "Pitch three mood boards with fully sung spec lyrics for a soft-drink campaign targeting Nairobi youth — amapiano bounce, patriotic mood optional.",
                tags: ["Amapiano", "Spec", "Campaign"],
              },
              {
                role: "Producer / topliner",
                story:
                  "Send clients two-minute references with South African accent and afrosoul harmony stacks before booking session vocalists.",
                tags: ["Afrosoul", "References", "Clients"],
              },
              {
                role: "Educator",
                story:
                  "Teach song structure by generating parallel verses in hip-hop vs R&B with the same lyrics so students hear arrangement choices instantly.",
                tags: ["Hiphop", "R&B", "Teaching"],
              },
            ].map((card) => (
              <article key={card.role} className="panel flex flex-col p-6">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">{card.role}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">{card.story}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-[var(--muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">FAQ</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
            Common questions
          </h2>
          <dl className="mt-10 space-y-6">
            {faqs.map((item) => (
              <div key={item.q} className="panel p-6">
                <dt className="font-[family-name:var(--font-display)] text-lg font-semibold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="panel overflow-hidden p-8 md:p-12">
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Ready when you are</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold md:text-4xl">
                Make the next song sound like where you are from
              </h2>
              <p className="mt-4 max-w-xl text-[var(--muted)] leading-relaxed">
                Create a free account, spend your starter credits on a Style Pack that matches your scene, and save your first track to your library in minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-primary">
                  Sign up free
                </Link>
                <Link href="/dashboard/create" className="btn-ghost">
                  Go to create studio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
