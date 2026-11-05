"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";
import { COUNTRIES, GENRES, LANGUAGE_MIXES, MOODS, SONG_TYPES, VOCAL_STYLES } from "@/lib/options";
import { createClient } from "@/lib/supabase/client";

export default function CreatePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [country, setCountry] = useState("NG");
  const [genre, setGenre] = useState("afrobeats");
  const [songType, setSongType] = useState("full_song");
  const [mood, setMood] = useState("party");
  const [languageMix, setLanguageMix] = useState("nigerian_english_pidgin");
  const [vocalStyle, setVocalStyle] = useState("energetic");
  const [bpm, setBpm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const langOptions = useMemo(() => LANGUAGE_MIXES[country] || [], [country]);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (langOptions.length) setLanguageMix(langOptions[0].id);
  }, [langOptions]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Sign in first to generate a song.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { job_id } = await createJob(token, {
        title: title || "Untitled",
        lyrics,
        country,
        genre,
        song_type: songType,
        mood,
        language_mix: langOptions.length ? languageMix : undefined,
        vocal_style: vocalStyle,
        bpm: bpm ? Number(bpm) : null,
      });
      router.push(`/jobs/${job_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start job");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 max-w-2xl">
        <p className="anim-rise text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Studio</p>
        <h1 className="anim-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl">
          Create
        </h1>
        <p className="anim-rise-delay-2 mt-3 text-[var(--muted)]">
          Shape the accent, groove, and delivery before the beat lands.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.85fr]">
        <form onSubmit={onSubmit} className="anim-rise-delay-2 panel space-y-6 p-6 md:p-8">
          {authReady && !token && (
            <div className="rounded-xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm text-[var(--muted)]">
              Browse freely.{" "}
              <Link href="/login" className="text-[var(--accent)]">
                Sign in
              </Link>{" "}
              when you are ready to generate.
            </div>
          )}

          <label className="field block text-sm">
            <span className="mb-2 block text-[var(--muted)]">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lagos Nights" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Country / accent</span>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Genre</span>
              <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Song type</span>
              <select value={songType} onChange={(e) => setSongType(e.target.value)}>
                {SONG_TYPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Mood</span>
              <select value={mood} onChange={(e) => setMood(e.target.value)}>
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            {langOptions.length > 0 && (
              <label className="field block text-sm">
                <span className="mb-2 block text-[var(--muted)]">Language mix</span>
                <select value={languageMix} onChange={(e) => setLanguageMix(e.target.value)}>
                  {langOptions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Vocal style</span>
              <select value={vocalStyle} onChange={(e) => setVocalStyle(e.target.value)}>
                {VOCAL_STYLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm sm:col-span-2">
              <span className="mb-2 block text-[var(--muted)]">BPM (optional)</span>
              <input
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="Auto from genre"
                type="number"
                min={60}
                max={200}
              />
            </label>
          </div>

          <label className="field block text-sm">
            <span className="mb-2 block text-[var(--muted)]">Lyrics</span>
            <textarea
              required
              minLength={8}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="min-h-44 resize-y"
              placeholder={"Verse 1...\n\nChorus..."}
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={loading || !token} className="btn-primary">
              {loading ? "Starting…" : "Generate song"}
            </button>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          </div>
        </form>

        <aside className="anim-rise-delay-3 panel sticky top-24 space-y-5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Session feel</p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight">
            {title.trim() || "Untitled track"}
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Accent" value={countryName} />
            <Row label="Genre" value={genre} />
            <Row label="Type" value={SONG_TYPES.find((s) => s.id === songType)?.label ?? songType} />
            <Row label="Mood" value={mood} />
            <Row label="Vocal" value={vocalStyle} />
            {bpm && <Row label="BPM" value={bpm} />}
          </dl>
          <p className="border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--muted)]">
            These choices steer accent tags, drums, and energy so a {countryName} {genre} request does not sound like
            generic US pop.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-2">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-right capitalize">{value}</dd>
    </div>
  );
}
