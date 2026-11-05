import type { Metadata } from "next";
import Link from "next/link";
import { STAGE_LABELS } from "@/lib/options";

export const metadata: Metadata = {
  title: "How it works",
  description: "From lyrics and Style Packs to a finished track — Sonzai's generation pipeline explained.",
};

const pipelineStages = Object.entries(STAGE_LABELS).filter(([k]) => k !== "failed" && k !== "cancelled");

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Overview</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl">How Sonzai works</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">
            Sonzai is a lyrics-in, song-out studio with regional control. You describe the sound with Style Packs, optionally
            anchor the vocal with a short reference clip, and let a background worker compile prompts, generate audio, and
            deliver a mixed track to your library.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Input", value: "Lyrics + Style Pack (+ optional voice)" },
              { label: "Engine", value: "ACE-Step via configured AceMusic / self-hosted path" },
              { label: "Output", value: "Full song in your private library" },
              { label: "Account", value: "Supabase Auth — your jobs, your files" },
            ].map((stat) => (
              <div key={stat.label} className="panel p-5">
                <p className="text-xs uppercase tracking-wider text-[var(--accent)]">{stat.label}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Lyrics</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Start with words that matter</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4 text-[var(--muted)] leading-relaxed">
              <p>
                Paste finished lyrics or a rough draft. Sonzai works best when verses and choruses are labeled clearly — even
                simple markers like [Verse] and [Chorus] help the model place energy correctly.
              </p>
              <p>
                Write in the language mix you intend to perform: pure English, Nigerian English + Pidgin, or bilingual lines
                where Yoruba, Igbo, or Hausa sit next to English. Match the language mix selector to what is on the page.
              </p>
            </div>
            <div className="panel p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">Lyrics checklist</h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                <li>Keep lines singable — avoid paragraph-long sentences in the chorus</li>
                <li>Repeat hook phrases; repetition helps both listeners and the generator</li>
                <li>Note ad-libs in parentheses if you want call-and-response energy</li>
                <li>For gospel or patriotic moods, lead with the emotional arc in the first verse</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Style Packs</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">One brief, many knobs</h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
            Style Packs are Sonzai&apos;s way of turning your creative intent into a dense generation prompt. Country steers accent
            and cultural production cues. Genre steers instrumentation. Mood, song type, BPM, energy, language mix, and vocal
            style refine the result.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Country accent",
                body: "Nigeria, Ghana, Kenya, South Africa, US, or UK — each nudges pronunciation, slang rhythm, and mix habits toward that market.",
              },
              {
                title: "Genre & song type",
                body: "Afrobeats vs amapiano vs highlife changes the drum grid entirely. Song type tells the model whether you need a 30-second hook or a full ballad arc.",
              },
              {
                title: "Mood & energy",
                body: "Party, romantic, street, spiritual, chill, or patriotic moods adjust brightness, density, and vocal attitude on top of the genre base.",
              },
            ].map((card) => (
              <div key={card.title} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{card.body}</p>
              </div>
            ))}
          </div>
          <Link href="/styles" className="mt-8 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline">
            Deep dive on Style Packs →
          </Link>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Voice (optional)</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Your timbre, lightly referenced</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="panel p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">When to upload</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Use a 10–60 second clip of clean speech or singing in a quiet room. The clip should be yours or you must have
                documented consent. Sonzai uses it as a timbre reference — not a pixel-perfect voice clone.
              </p>
            </div>
            <div className="panel p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">When to skip</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                Exploring genres, pitching to clients, or teaching arrangement? Modeled vocals in your Style Pack are often faster
                and cleaner. Add voice later once lyrics and pack choices are locked.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Never upload celebrities, minors without guardian consent, or samples you do not have rights to use.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Generation pipeline</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">What happens after you hit generate</h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
            Jobs run asynchronously so you can leave the tab open or come back later. Status labels map to real stages in the
            worker — use them to decide whether to wait or adjust inputs.
          </p>
          <ol className="mt-10 space-y-3">
            {pipelineStages.map(([key, label], i) => (
              <li key={key} className="panel flex items-start gap-4 p-5">
                <span className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {key === "queued" && "Your job enters the queue; peak times may add wait."}
                    {key === "composing" && "Style Pack fields merge into the ACE-Step prompt."}
                    {key === "generating" && "Core music and vocal performance are synthesized."}
                    {key === "vocals" && "Vocal pass may refine delivery when reference or style demands it."}
                    {key === "mixing" && "Levels, space, and genre-appropriate polish."}
                    {key === "uploading" && "Audio lands in storage tied to your account."}
                    {key === "done" && "Play, download, or regenerate from your library."}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Quality tips</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Get better takes without guessing</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Align BPM with genre",
                tip: "Afrobeats and amapiano have comfortable tempo bands. Extreme BPM with the wrong genre fights the Style Pack.",
              },
              {
                title: "One major change per re-run",
                tip: "If a track fails, tweak lyrics OR genre OR energy — not all three at once — so you learn what moved the needle.",
              },
              {
                title: "Shorter hooks for ads",
                tip: "Pick hook / jingle song type and front-load the brand line in the first eight bars.",
              },
              {
                title: "Match language mix to lyrics",
                tip: "Pidgin in the text but English-only mix selected? The vocal may sound mismatched. Sync them.",
              },
              {
                title: "Reference clip quality",
                tip: "No reverb on the sample, no backing track, no room noise — the model copies what it hears.",
              },
              {
                title: "Credits & retries",
                tip: "Each generation spends credits. Iterate with purpose; save versions you like as you go.",
              },
            ].map((item) => (
              <div key={item.title} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="panel p-8 md:p-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">Try the pipeline on your lyrics</h2>
            <p className="mt-4 max-w-xl text-[var(--muted)] leading-relaxed">
              Sign up for free credits, open the create studio, and run your first Style Pack today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
              <Link href="/dashboard/create" className="btn-ghost">
                Open create studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
