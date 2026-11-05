"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createJob, getProfile, listPrompts, listVoices, savePrompt, saveVoiceProfile, uploadVoiceSample } from "@/lib/api";
import { COUNTRIES, GENRE_CATEGORIES, KEYS, LANGUAGE_MIXES, LYRIC_SECTIONS, MOODS, SONG_TYPES, STRUCTURE_PRESETS, TIME_SIGNATURES, VOCAL_GENDERS, VOCAL_STYLES } from "@/lib/options";
import { estimateDurationSec, formatDuration, LENGTH_PRESETS } from "@/lib/songLength";

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
  const [mode, setMode] = useState<"custom" | "simple">("custom");
  const [length, setLength] = useState("auto");
  const [stylePrompt, setStylePrompt] = useState("");
  const [instrumental, setInstrumental] = useState(false);
  const [vocalGender, setVocalGender] = useState("auto");
  const [keyScale, setKeyScale] = useState("");
  const [timeSignature, setTimeSignature] = useState("");
  const [negativeStyle, setNegativeStyle] = useState("");
  const [weirdness, setWeirdness] = useState(3);
  const [variations, setVariations] = useState(1);
  const [voiceId, setVoiceId] = useState("");
  const [prompts, setPrompts] = useState<{ id: string; name: string; body: string }[]>([]);
  const [voices, setVoices] = useState<{ id: string; name: string; sample_path: string }[]>([]);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const langOptions = useMemo(() => LANGUAGE_MIXES[country] || [], [country]);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country;
  const plannedSeconds = estimateDurationSec({
    lyrics: mode === "simple" ? stylePrompt : lyrics,
    songType,
    bpm: bpm ? Number(bpm) : null,
    length,
  });

  useEffect(() => {
    if (langOptions.length) setLanguageMix(langOptions[0].id);
  }, [langOptions]);

  useEffect(() => {
    getProfile()
      .then((p) => setCredits(p.credits_remaining ?? 0))
      .catch(() => setCredits(null));
    listPrompts().then(setPrompts).catch(() => undefined);
    listVoices().then(setVoices).catch(() => undefined);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Sign in required.");
      return;
    }
    if (mode === "custom" && lyrics.trim().length < 8 && !instrumental) {
      setError("Paste the full lyrics (at least a few lines), or switch to Describe mode.");
      return;
    }
    if (mode === "simple" && stylePrompt.trim().length < 8) {
      setError("Describe the song you want — genre, story, and mood.");
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
      let voice_sample_path: string | null = voices.find((voice) => voice.id === voiceId)?.sample_path || null;
      if (voiceFile) {
        voice_sample_path = await uploadVoiceSample(voiceFile);
        await saveVoiceProfile(voiceFile.name.replace(/\.[^.]+$/, ""), voice_sample_path);
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
        options: {
          mode,
          length,
          style_prompt: stylePrompt.trim(),
          instrumental,
          vocal_gender: vocalGender,
          key_scale: keyScale,
          time_signature: timeSignature,
          negative_style: negativeStyle.trim(),
          temperature: 0.65 + weirdness * 0.1,
          vocal_language: "en",
          variations,
        },
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
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["custom", "Custom lyrics"],
                ["simple", "Describe a song"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={mode === id ? "btn-primary !px-4 !py-2 text-sm" : "btn-ghost !px-4 !py-2 text-sm"}
              >
                {label}
              </button>
            ))}
          </div>

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
                {GENRE_CATEGORIES.map((category) => (
                  <optgroup key={category.id} label={category.label}>
                    {category.genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </optgroup>
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
              <span className="mb-2 block text-[var(--muted)]">Length</span>
              <select value={length} onChange={(e) => setLength(e.target.value)}>
                {LENGTH_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
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

          <div className="flex flex-wrap gap-2">
            <select
              className="field"
              defaultValue=""
              onChange={(event) => {
                const preset = STRUCTURE_PRESETS.find((item) => item.id === event.target.value);
                if (!preset) return;
                setLyrics((current) => (current.trim() ? `${current.trim()}\n\n${preset.text}` : preset.text));
              }}
            >
              <option value="">Structure</option>
              {STRUCTURE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
            <select
              className="field"
              defaultValue=""
              onChange={(event) => {
                const saved = prompts.find((item) => item.id === event.target.value);
                if (saved) setStylePrompt(saved.body);
              }}
            >
              <option value="">Saved styles</option>
              {prompts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-ghost !px-3 !py-1.5 text-sm"
              onClick={() => {
                const name = stylePrompt.trim().slice(0, 32);
                if (!name) return;
                savePrompt(name, stylePrompt.trim()).then(() => listPrompts().then(setPrompts));
              }}
            >
              Save style
            </button>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input type="checkbox" checked={variations === 2} onChange={(event) => setVariations(event.target.checked ? 2 : 1)} />
              2 versions
            </label>
          </div>

          <label className="field block text-sm">
            <textarea
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              className="min-h-24 resize-y"
              placeholder="Uplifting Lagos gospel, live drums, choir stacks, female lead, call and response"
            />
          </label>

          <label className="field block text-sm">
            <span className="mb-2 flex items-center justify-between text-[var(--muted)]">
              <span>{instrumental ? "Arrangement notes" : "Full lyrics"}</span>
              <span>{formatDuration(plannedSeconds)} target</span>
            </span>
            {mode === "custom" && (
              <div className="mb-2 flex flex-wrap gap-2">
                {LYRIC_SECTIONS.map((section) => (
                  <button
                    key={section}
                    type="button"
                    className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                    onClick={() =>
                      setLyrics((prev) => `${prev}${prev && !prev.endsWith("\n") ? "\n\n" : ""}[${section}]\n`)
                    }
                  >
                    [{section}]
                  </button>
                ))}
              </div>
            )}
            <textarea
              required={mode === "custom" && !instrumental}
              minLength={mode === "custom" && !instrumental ? 8 : undefined}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="min-h-56 resize-y"
              placeholder={
                mode === "simple"
                  ? "Optional: paste lyrics, or leave blank and let AceMusic write them from the description."
                  : "[Verse 1]\n...\n\n[Chorus]\n..."
              }
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Vocal gender</span>
              <select value={vocalGender} onChange={(e) => setVocalGender(e.target.value)}>
                {VOCAL_GENDERS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Key</span>
              <select value={keyScale} onChange={(e) => setKeyScale(e.target.value)}>
                {KEYS.map((key) => (
                  <option key={key || "auto"} value={key}>
                    {key || "Auto"}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Time signature</span>
              <select value={timeSignature} onChange={(e) => setTimeSignature(e.target.value)}>
                {TIME_SIGNATURES.map((sig) => (
                  <option key={sig || "auto"} value={sig}>
                    {sig || "Auto"}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Creativity ({weirdness}/5)</span>
              <input
                type="range"
                min={1}
                max={5}
                value={weirdness}
                onChange={(e) => setWeirdness(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </label>
          </div>

          <label className="field block text-sm">
            <span className="mb-2 block text-[var(--muted)]">Exclude (optional)</span>
            <input
              value={negativeStyle}
              onChange={(e) => setNegativeStyle(e.target.value)}
              placeholder="no trap hi-hats, no autotune, no English rap"
            />
          </label>

          <label className="flex items-start gap-3 text-sm text-[var(--muted)]">
            <input
              type="checkbox"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
              className="mt-1 accent-[var(--accent)]"
            />
            <span>Instrumental only — no sung vocals</span>
          </label>

          <div className="space-y-3 rounded-xl border border-[var(--line)] bg-black/15 p-4">
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Saved voice</span>
              <select value={voiceId} onChange={(event) => setVoiceId(event.target.value)}>
                <option value="">None</option>
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field block text-sm">
              <span className="mb-2 block text-[var(--muted)]">Or upload a new sample</span>
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
            <Row label="Length" value={formatDuration(plannedSeconds)} />
            <Row label="Mode" value={mode === "simple" ? "Describe" : "Custom lyrics"} />
            <Row label="Energy" value={`${energy}/5`} />
            {bpm && <Row label="BPM" value={bpm} />}
            <Row label="Engine" value="AceMusic ACE-Step" />
          </dl>
          <p className="border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--muted)]">
            Length follows your full lyric sheet (up to 6 minutes), with intro and outro. Longer songs can take a few
            minutes. Stay on the job page until AceMusic finishes.
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
