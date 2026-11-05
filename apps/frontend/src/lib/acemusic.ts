import { spawnSync } from "child_process";
import { writeFileSync, readFileSync, existsSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

type GenInput = {
  lyrics: string;
  prompt: string;
  bpm?: number | null;
  durationSec: number;
  instrumental?: boolean;
  vocalLanguage?: string;
  keyScale?: string;
  timeSignature?: string;
  temperature?: number;
  sampleMode?: boolean;
};

function decodeDataUrl(url: string): Buffer {
  // JS split(limit) caps array length — split(",", 1)[1] is undefined (unlike Python).
  const comma = url.indexOf(",");
  const b64 = comma >= 0 ? url.slice(comma + 1) : url;
  if (!b64) throw new Error("AceMusic audio payload was empty");
  return Buffer.from(b64, "base64");
}

export async function generateWithAceMusic(input: GenInput): Promise<{ mp3: Buffer; duration: number }> {
  const key = process.env.ACEMUSIC_API_KEY;
  if (!key) throw new Error("ACEMUSIC_API_KEY is not set on the server");

  const base = (process.env.ACEMUSIC_BASE_URL || "https://api.acemusic.ai").replace(/\/$/, "");
  const model = process.env.ACEMUSIC_MODEL || "acemusic/acestep-v1.5-turbo";
  // Ignore a low ACEMUSIC_MAX_DURATION (older deploys used 60–90s). Full songs need room for every lyric line.
  const envCap = Number(process.env.ACEMUSIC_MAX_DURATION || 0);
  const maxDur = Math.min(600, Math.max(envCap || 0, 240));
  const duration = Math.max(15, Math.min(input.durationSec, maxDur));
  const instrumental = Boolean(input.instrumental);
  const sampleMode = Boolean(input.sampleMode);

  const body = {
    model,
    messages: [
      {
        role: "user",
        content: sampleMode
          ? input.prompt
          : `<prompt>${input.prompt}</prompt>\n<lyrics>${input.lyrics}</lyrics>`,
      },
    ],
    lyrics: sampleMode ? "" : input.lyrics,
    sample_mode: sampleMode,
    thinking: duration >= 120,
    use_format: false,
    use_cot_caption: false,
    use_cot_language: true,
    use_cot_metas: false,
    temperature: input.temperature ?? 0.85,
    audio_config: {
      duration,
      bpm: input.bpm || undefined,
      key_scale: input.keyScale || undefined,
      time_signature: input.timeSignature || undefined,
      vocal_language: input.vocalLanguage || "en",
      instrumental,
      format: "mp3",
    },
  };

  const resp = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "User-Agent": "curl/8.4.0",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AceMusic HTTP ${resp.status}: ${text.slice(0, 500)}`);
  }

  const json = await resp.json();
  const audio = json?.choices?.[0]?.message?.audio?.[0];
  const url = audio?.audio_url?.url || audio?.url;
  if (!url) throw new Error("AceMusic response missing audio");

  return { mp3: decodeDataUrl(url), duration };
}

/** Optional local ffmpeg normalize — ignored if ffmpeg missing */
export function maybeNormalizeMp3(mp3: Buffer): Buffer {
  try {
    const inPath = join(tmpdir(), `sonzai-in-${Date.now()}.mp3`);
    const outPath = join(tmpdir(), `sonzai-out-${Date.now()}.mp3`);
    writeFileSync(inPath, mp3);
    const result = spawnSync(
      "ffmpeg",
      ["-y", "-i", inPath, "-codec:a", "libmp3lame", "-qscale:a", "4", outPath],
      { encoding: "utf8" },
    );
    if (result.status === 0 && existsSync(outPath)) {
      const out = readFileSync(outPath);
      unlinkSync(inPath);
      unlinkSync(outPath);
      return out;
    }
    if (existsSync(inPath)) unlinkSync(inPath);
  } catch {
    // keep original
  }
  return mp3;
}
