/** ACE-Step supports 10–600s. We cap at 4 minutes so a Vercel function can finish. */
export const MAX_SONG_SECONDS = 240;

export const LENGTH_PRESETS = [
  { id: "auto", label: "Auto — fit the full lyrics" },
  { id: "60", label: "1 minute" },
  { id: "120", label: "2 minutes" },
  { id: "180", label: "3 minutes" },
  { id: "240", label: "4 minutes" },
] as const;

export function estimateDurationSec(input: {
  lyrics: string;
  songType?: string;
  bpm?: number | null;
  length?: string | null;
}): number {
  if (input.length && input.length !== "auto") {
    const chosen = Number(input.length);
    if (Number.isFinite(chosen)) {
      return Math.max(15, Math.min(Math.round(chosen), MAX_SONG_SECONDS));
    }
  }

  const lyrics = input.lyrics || "";
  const words = lyrics
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w && !w.startsWith("[")).length;
  const bpm = input.bpm && input.bpm > 0 ? input.bpm : 100;
  const secPerWord = bpm >= 140 ? 0.42 : bpm >= 110 ? 0.55 : bpm >= 90 ? 0.7 : 0.85;
  const sections = (lyrics.match(/\[[^\]]+\]/g) || []).length;
  let seconds = Math.round(words * secPerWord + Math.max(sections, 2) * 6 + 18);

  const type = input.songType || "full_song";
  if (type === "hook") seconds = Math.min(Math.max(seconds, 20), 50);
  else if (type === "freestyle") seconds = Math.max(seconds, 75);
  else seconds = Math.max(seconds, 90);

  return Math.max(15, Math.min(seconds, MAX_SONG_SECONDS));
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
