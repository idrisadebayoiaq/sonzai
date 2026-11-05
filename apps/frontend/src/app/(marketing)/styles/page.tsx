import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES, GENRES, LANGUAGE_MIXES, MOODS, SONG_TYPES, VOCAL_STYLES } from "@/lib/options";

export const metadata: Metadata = {
  title: "Style Packs",
  description: "Country accents, genres, language mixes, and vocal styles — how Sonzai shapes your song.",
};

const genreNotes: Record<string, string> = {
  afrobeats: "Percussive drive, warm bass, call-and-response hooks, space for ad-libs.",
  amapiano: "Log drums, rolling bass, club-ready length, slower harmonic movement.",
  highlife: "Bright guitars, horn stabs, danceable swing rooted in Ghanaian tradition.",
  afrosoul: "Rich chords, intimate vocals, R&B-adjacent warmth with African rhythmic feel.",
  hiphop: "Pocket drums, lyrical clarity, street or chill mood depending on your pack.",
  rnb: "Smooth harmony stacks, melismatic lines, romantic or late-night energy.",
  pop: "Wide hooks, accessible structure — still steered by your country vocal pack.",
  gospel: "Lift, choir potential, spiritual mood, room for crescendo and testimony.",
};

export default function StylesPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Style Packs</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl">
            Your sound brief, compiled automatically
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">
            Style Packs translate your choices — country, genre, mood, song type, language, vocal character, BPM, and energy —
            into a generation prompt that ACE-Step can execute. Think of them as a producer brief you do not have to write by hand.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Countries</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Country packs in detail</h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
            Country selection is the strongest lever on vocal accent and phrasing. Pair it with the right language mix when you
            code-switch in lyrics.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {COUNTRIES.map((c) => (
              <div key={c.code} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {c.code === "NG" &&
                    "Nigerian English delivery, afrobeats-native ad-lib culture, optional Pidgin and Yoruba/Igbo/Hausa mixes."}
                  {c.code === "GH" && "Ghanaian English warmth, highlife-friendly instrumentation bias, celebratory hook energy."}
                  {c.code === "KE" && "Kenyan English clarity, bongo-flavored pop sensibility, upbeat or chill moods."}
                  {c.code === "ZA" && "South African English, amapiano and house crossover defaults, club-length structures."}
                  {c.code === "US" && "US delivery for diaspora artists, hip-hop/R&B/pop baselines with global drum palettes."}
                  {c.code === "GB" && "UK delivery, grime-adjacent phrasing optional via mood and genre, pop and rnb hooks."}
                </p>
                {LANGUAGE_MIXES[c.code] && (
                  <p className="mt-3 text-xs text-[var(--accent)]">
                    {LANGUAGE_MIXES[c.code].length} language mix option
                    {LANGUAGE_MIXES[c.code].length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Genres</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Genre deep dive</h2>
          <div className="mt-10 space-y-4">
            {GENRES.map((g) => (
              <div key={g} className="panel flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold capitalize">{g}</h3>
                <p className="max-w-xl text-sm text-[var(--muted)]">{genreNotes[g] ?? "Genre-aware drums, bass, and arrangement."}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-[var(--muted)]">
            Combine genre with{" "}
            {SONG_TYPES.map((s) => s.label.toLowerCase()).slice(0, 3).join(", ")}
            , and more via song type in the studio.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Language</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Language mixes</h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
            Nigeria leads with the richest mix list today — Nigerian English, Pidgin blends, and major regional languages paired
            with English. Other country packs expand over time; always match the mix to the words on your lyric sheet.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {Object.entries(LANGUAGE_MIXES).map(([code, mixes]) => {
              const country = COUNTRIES.find((c) => c.code === code);
              return (
                <div key={code} className="panel p-6">
                  <h3 className="font-[family-name:var(--font-display)] font-semibold">{country?.name ?? code}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                    {mixes.map((m) => (
                      <li key={m.id} className="flex gap-2">
                        <span className="text-[var(--accent)]">·</span>
                        {m.label}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Vocals</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Vocal styles & moods</h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold">Vocal character</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {VOCAL_STYLES.map((v) => (
                  <span key={v} className="rounded-full bg-white/5 px-4 py-2 text-sm capitalize">
                    {v}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
                Soft for ballads and intimate R&B. Energetic for party afrobeats and dance tracks. Raspy for street-leaning hooks.
                Choir for gospel and big chorus moments.
              </p>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold">Mood</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {MOODS.map((m) => (
                  <span key={m} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm capitalize">
                    {m}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
                Mood sits on top of genre — the same amapiano pack can feel romantic or party depending on mood and energy sliders.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Tips</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Better songs from better packs</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Nigeria + afrobeats + party",
                tip: "Great for uptempo hooks. Use Nigerian English + Pidgin mix if your chorus uses Pidgin punchlines.",
              },
              {
                title: "South Africa + amapiano + chill",
                tip: "Let the log drum breathe. Keep verses shorter so the bass loop carries the track.",
              },
              {
                title: "Ghana + highlife + romantic",
                tip: "Lean into guitar-forward brightness; ballad song type for wedding-style content.",
              },
              {
                title: "Any country + gospel + spiritual",
                tip: "Pick choir vocal style and structure lyrics with a clear lift into the final chorus.",
              },
              {
                title: "US/UK + hiphop + street",
                tip: "Tighter BPM, punchy consonants in lyrics, energetic or raspy vocal style.",
              },
              {
                title: "Match energy to song type",
                tip: "Freestyle types tolerate loose structure; hook types need a repeatable line in the first 15 seconds.",
              },
            ].map((item) => (
              <div key={item.title} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--accent)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="panel p-8 md:p-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">Apply a Style Pack to your lyrics</h2>
            <p className="mt-4 max-w-xl text-[var(--muted)] leading-relaxed">
              Open the create studio, choose country and genre, fine-tune mood and vocal style, and generate your first track.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard/create" className="btn-primary">
                Open create studio
              </Link>
              <Link href="/how-it-works" className="btn-ghost">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
