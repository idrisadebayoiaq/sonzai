import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Sonzai exists so AI music can sound local — built by creators who care about regional scenes.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Mission</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl">
            Music AI that respects where you are from
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">
            Sonzai&apos;s mission is to give writers, creators, and independent artists a fast path from lyrics to finished songs
            without flattening their culture into generic global pop. Regional accent and genre control are not side features — they
            are the product.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Story</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Why we built Sonzai</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-4 text-[var(--muted)] leading-relaxed">
              <p>
                We kept seeing the same failure mode: brilliant lyrics written for Lagos or Accra, fed into AI tools, and returned
                with a Mid-Atlantic vocal sitting on EDM drums. The words were right; the <em>feel</em> was wrong.
              </p>
              <p>
                Sonzai started as a prompt compiler — Style Packs that encode what producers already know about afrobeats push,
                amapiano log drums, highlife guitars, and gospel chord movement. The studio wrapped around that idea so anyone
                could use it without learning prompt engineering.
              </p>
            </div>
            <div className="panel p-8">
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold">&ldquo;Local first, then global.&rdquo;</p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                We believe the next wave of AI music will be won by tools that nail specific scenes — Naija street, Ghanaian
                wedding season, Kenyan gengetone-adjacent pop — not by tools that average every scene into one voice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Thesis</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Regional music deserves regional defaults</h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
            Most models are trained on broad English-language corpora with US/UK bias. Sonzai does not pretend that bias away — we
            steer against it with explicit country packs, language mixes, and genre templates maintained with input from people who
            listen to these scenes daily.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { region: "West Africa", note: "Afrobeats, highlife, gospel crossovers, Pidgin phrasing" },
              { region: "East Africa", note: "Bongo-adjacent pop sensibilities, bilingual hooks" },
              { region: "Southern Africa", note: "Amapiano depth, house-influenced club records" },
              { region: "Diaspora", note: "US/UK packs for artists bridging home and abroad" },
            ].map((item) => (
              <div key={item.region} className="panel p-5">
                <h3 className="font-[family-name:var(--font-display)] font-semibold">{item.region}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Technology</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Stack at a glance</h2>
          <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
            We keep the architecture boring where it helps reliability and creative where it helps sound. You do not need to know
            any of this to make a song — it is here for the curious.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                layer: "Frontend",
                detail: "Next.js app with a dark, studio-inspired UI. Auth-aware marketing and dashboard routes.",
              },
              {
                layer: "Auth & data",
                detail: "Supabase Auth for accounts; Postgres and storage for jobs, songs, and metadata.",
              },
              {
                layer: "Style Packs",
                detail: "Server-side compilation of country, genre, mood, and language fields into ACE-Step prompts.",
              },
              {
                layer: "Generation",
                detail: "ACE-Step via AceMusic cloud when configured, with optional self-hosted or Colab paths for power users.",
              },
              {
                layer: "Workers",
                detail: "Background jobs for queue, compose, generate, vocal polish, mix, and upload with visible stage labels.",
              },
              {
                layer: "Responsible use",
                detail: "Consent-based voice reference, fair-use queues, and clear AI disclosure expectations in terms.",
              },
            ].map((row) => (
              <div key={row.layer} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] font-semibold">{row.layer}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{row.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Values</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">How we make decisions</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Creators own their work",
                body: "Your lyrics, your library, your exports. We do not train on your private songs without explicit permission.",
              },
              {
                title: "Culture is not a costume",
                body: "Style Packs describe production reality, not stereotypes. We iterate packs with feedback from people in those scenes.",
              },
              {
                title: "Honest AI",
                body: "We call generated audio what it is. Impersonation and non-consensual voice use are off limits.",
              },
            ].map((v) => (
              <li key={v.title} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Community</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Team & collaborators</h2>
          <div className="mt-8 space-y-4 text-[var(--muted)] leading-relaxed">
            <p>
              Sonzai is a small team of engineers and music obsessives spanning Lagos, London, and remote. We partner with
              independent producers and writers who stress-test Style Packs before they ship.
            </p>
            <p>
              Want to suggest a pack, language mix, or genre template? Ship feedback from the dashboard or reach out when we open
              beta lists for new regions. The roadmap follows real scenes, not press-release genres.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {["Producers", "Songwriters", "Creators", "Educators", "Indie labels"].map((tag) => (
              <span key={tag} className="rounded-full border border-[var(--line)] px-4 py-2 text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="panel p-8 md:p-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">Make something that sounds like home</h2>
            <p className="mt-4 max-w-xl text-[var(--muted)] leading-relaxed">
              Join Sonzai, pick a Style Pack, and put your lyrics in the center of the mix.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
              <Link href="/styles" className="btn-ghost">
                Browse Style Packs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
