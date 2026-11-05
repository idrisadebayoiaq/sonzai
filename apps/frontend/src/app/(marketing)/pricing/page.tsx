import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free credits to start, Creator and Studio plans for teams shipping music every week.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Learn Sonzai, finish your first tracks, and build a private library.",
    features: [
      "Starter credits on signup",
      "All Style Packs (country + genre)",
      "Optional voice reference upload",
      "Private library & job history",
      "Standard queue at busy times",
    ],
    cta: "Sign up free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Creator",
    price: "$12",
    period: "/ month",
    blurb: "For solo artists and creators publishing weekly content.",
    features: [
      "Generous monthly credit refill",
      "Priority queue during peak hours",
      "Higher daily generation cap",
      "Early access to new packs & moods",
      "Email support within 2 business days",
    ],
    cta: "Start as Creator",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$39",
    period: "/ month",
    blurb: "For producers, agencies, and small rosters managing multiple voices.",
    features: [
      "Largest monthly credit pool",
      "Fastest queue tier",
      "Team-friendly usage (fair use)",
      "Bulk re-generation for client pitches",
      "Priority support & roadmap input",
    ],
    cta: "Talk to us",
    href: "/signup",
    highlight: false,
  },
];

const pricingFaqs = [
  {
    q: "What is a credit?",
    a: "One credit typically covers one full song generation job through the pipeline (style build, generate, mix, upload). Failed jobs caused by platform errors are refunded per policy.",
  },
  {
    q: "Can I stay on Free forever?",
    a: "Yes for personal exploration. Heavy daily use may hit fair-use caps; Creator and Studio exist when Sonzai becomes part of your workflow.",
  },
  {
    q: "Do paid plans include commercial use?",
    a: "Generated audio is yours to use per our terms, including commercial projects. Always label AI-assisted content where required by clients or platforms.",
  },
  {
    q: "Will GPU costs change pricing?",
    a: "We optimize for sustainable free tiers via AceMusic and efficient queuing. If infrastructure costs shift, we will communicate before changing plan inclusions.",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Pricing</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl">
            Simple plans for serious songs
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] md:mx-0">
            Start free with credits that let you hear real regional Style Packs on your lyrics. Upgrade when you are shipping
            hooks, client specs, or a catalog — not before you know Sonzai fits your sound.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Free credits</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Start without a card</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="panel p-8">
              <p className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--accent)]">Free</p>
              <p className="mt-2 text-[var(--muted)]">Starter credits on every new account</p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
                <li>Enough for multiple full songs while you learn the studio</li>
                <li>Same Style Packs as paid tiers — no locked countries or genres</li>
                <li>Credits refresh promotions may run during launches; check your dashboard</li>
              </ul>
            </div>
            <div className="flex flex-col justify-center text-[var(--muted)] leading-relaxed">
              <p>
                We would rather you generate three tracks you love than burn credits on random settings. Use free tier time to
                lock country, genre, and language mix — then upgrade for volume.
              </p>
              <p className="mt-4">
                Need only one hero track? Free may be all you require. Need twenty variants for a campaign? Creator or Studio
                keeps you out of the slow queue.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Plans</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Compare Free, Creator, Studio</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`panel flex flex-col p-8 ${plan.highlight ? "ring-1 ring-[var(--accent)]/50" : ""}`}
              >
                {plan.highlight && (
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--accent)]">Most popular</p>
                )}
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2">
                  <span className="font-[family-name:var(--font-display)] text-4xl font-bold">{plan.price}</span>
                  <span className="text-[var(--muted)]">{plan.period}</span>
                </p>
                <p className="mt-4 text-sm text-[var(--muted)]">{plan.blurb}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--muted)]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-[var(--accent-2)]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`mt-8 ${plan.highlight ? "btn-primary" : "btn-ghost"} text-center`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-[var(--muted)]">
            Creator and Studio pricing shown as marketing targets; billing activates when paid tiers launch in your region.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Credits</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">What credits buy</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Full song generation",
                body: "One completed job from Style Pack compile through mixed upload. Hook, ballad, dance track, or gospel — same credit model.",
              },
              {
                title: "Re-generation",
                body: "Each new job spends a credit. Duplicate a session with tweaked BPM or lyrics instead of starting from zero when possible.",
              },
              {
                title: "Voice reference",
                body: "Uploading a reference does not cost extra credits; the generation job does. Use clean samples to avoid wasted runs.",
              },
              {
                title: "Library storage",
                body: "Saved tracks stay in your account. Credits are for synthesis, not for listening back.",
              },
            ].map((item) => (
              <div key={item.title} className="panel p-6">
                <h3 className="font-[family-name:var(--font-display)] font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Fair use</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Shared GPUs, shared respect</h2>
          <div className="mt-8 space-y-4 text-[var(--muted)] leading-relaxed">
            <p>
              Sonzai runs generation on shared infrastructure. Free accounts may see daily caps or slower queues during spikes
              so paying creators and small studios get predictable turnaround.
            </p>
            <p>
              Automated scraping, reselling raw API access, or attempting to extract model weights violates terms and may result
              in account suspension. Human creators making music for themselves, their channels, or their clients are exactly who
              we built this for.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {["No bot farms", "No celebrity impersonation", "Disclose AI where required"].map((rule) => (
              <li key={rule} className="panel p-4 text-center text-sm font-medium">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">FAQ</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">Billing questions</h2>
          <dl className="mt-10 space-y-6">
            {pricingFaqs.map((item) => (
              <div key={item.q} className="panel p-6">
                <dt className="font-[family-name:var(--font-display)] font-semibold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="panel p-8 md:p-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">Spend your first credits today</h2>
            <p className="mt-4 max-w-xl text-[var(--muted)] leading-relaxed">
              Create an account, pick a Style Pack, and hear your lyrics with regional feel — free to start.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Sign up free
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
