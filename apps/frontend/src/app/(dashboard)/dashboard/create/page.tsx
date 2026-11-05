"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createJob, getProfile, uploadVoiceSample } from "@/lib/api";
import { COUNTRIES, GENRES, LANGUAGE_MIXES, MOODS, SONG_TYPES, VOCAL_STYLES } from "@/lib/options";

export default function DashboardCreatePage() {
  const router = useRouter();
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [country, setCountry] = useState("NG");
  const [genre, setGenre] = useState("afrobeats");
  const [songType, setSongType] = useState("full_song");
  const [mood, setMood] = useState("party");
  const [languageMix, setLanguageMix] = useState("nigerian_english_pidgin");
  const [vocalStyle, setVocalStyle] = useState("energetic");
  const [bpm, setBpm] = useState("");
  const [energy, setEnergy] = useState(3);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const langOptions = useMemo(() => LANGUAGE_MIXES[country] || [], [country]);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country;

  useEffect(() => {
    if (langOptions.length) setLanguageMix(langOptions[0].id);
  }, [langOptions]);

  useEffect(() => {
    getProfile()
      .then((p) => setCredits(p.credits_remaining ?? 0))
      .catch(() => setCredits(null));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Sign in required.");
      return;
    }
    if (voiceFile && !consent) {
      setError("Confirm you own this voice (or have permission) before uploading.");
      return;
    }
    if (credits !== null && credits <= 0) {
      setError("No credits remaining.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let voice_sample_path: string | null = null;
      if (voiceFile) {
        voice_sample_path = await uploadVoiceSample(voiceFile);
      }
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
        energy,
        voice_sample_path,
      });
      router.push(`/dashboard/jobs/${job_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start job");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Create</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">Generate a real song</h1>
        <p className="mt-3 text-[var(--muted)]">
          Lyrics + regional style pack go to AceMusic ACE-Step. Credits left:{" "}
          <span className="text-[var(--accent)]">{credits === null ? "…" : credits}</span>
        </p>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[1.35fr_0.85fr]">
        <form onSubmit={onSubmit} className="panel space-y-6 p-6 md:p-8">
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
            <label className="field block text-sm">
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
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Energy ({energy}/5)</span>
              <input
                type="range"
                min={1}
                max={5}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </label>
          </div>

          <label className="field block text-sm">
            <span className="mb-2 block text-[var(--muted)]">Lyrics (sung by the model)</span>
            <textarea
              required
              minLength={8}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="min-h-48 resize-y"
              placeholder={"[Verse 1]\n...\n\n[Chorus]\n..."}
            />
          </label>

          <div className="space-y-3 rounded-xl border border-[var(--line)] bg-black/15 p-4">
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Your voice sample (optional, 10–60s)</span>
              <input
                type="file"
                accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/webm,.mp3,.wav,.m4a"
                onChange={(e) => setVoiceFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {voiceFile && <p className="text-xs text-[var(--muted)]">Selected: {voiceFile.name}</p>}
            <label className="flex items-start gap-3 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                I own this voice recording or have permission to use it. I will not upload celebrity or other people’s
                voices without consent.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={loading || !token} className="btn-primary">
              {loading ? "Queuing…" : "Generate real song"}
            </button>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          </div>
        </form>

        <aside className="panel sticky top-24 space-y-5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Prompt preview</p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight">
            {title.trim() || "Untitled track"}
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Accent" value={countryName} />
            <Row label="Genre" value={genre} />
            <Row label="Type" value={SONG_TYPES.find((s) => s.id === songType)?.label ?? songType} />
            <Row label="Mood" value={mood} />
            <Row label="Vocal" value={vocalStyle} />
            <Row label="Energy" value={`${energy}/5`} />
            {bpm && <Row label="BPM" value={bpm} />}
            <Row label="Engine" value="AceMusic ACE-Step" />
          </dl>
          <p className="border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--muted)]">
            Generation usually takes 1–3 minutes. Stay on the job page while AceMusic builds vocals and arrangement from
            your lyrics.
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
