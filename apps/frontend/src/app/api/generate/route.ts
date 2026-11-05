import { NextRequest, NextResponse } from "next/server";
import { generateWithAceMusic, maybeNormalizeMp3 } from "@/lib/acemusic";
import { estimateDurationSec } from "@/lib/songLength";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

function buildPrompt(job: Record<string, unknown>) {
  const options = (job.options || {}) as Record<string, unknown>;
  const energy = Number(job.energy || 3);
  const energyWord = energy >= 4 ? "high energy" : energy <= 2 ? "mellow low energy" : "medium energy";
  const gender = String(options.vocal_gender || "auto");
  const genderLine =
    gender === "female"
      ? "female lead vocal"
      : gender === "male"
        ? "male lead vocal"
        : gender === "duet"
          ? "male and female duet vocals"
          : "";
  const parts = [
    `${job.country} contemporary song with authentic regional feel`,
    String(job.genre || ""),
    String(job.mood || "") + " mood",
    `${job.vocal_style || "natural"} vocal style`,
    genderLine,
    String(job.language_mix || ""),
    String(options.style_prompt || ""),
    energyWord,
    job.bpm ? `BPM ${job.bpm}` : "",
    options.key_scale ? `key ${options.key_scale}` : "",
    options.time_signature ? `time signature ${options.time_signature}` : "",
    `song type ${job.song_type}`,
    options.negative_style ? `avoid: ${options.negative_style}` : "",
    options.instrumental
      ? "instrumental only, no vocals"
      : "sing every lyric line in order from start to finish, do not skip verses or the chorus, complete arrangement with intro and outro",
    "coherent melody, studio quality mix",
  ];
  return parts.filter(Boolean).join(", ");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const job_id = body.job_id as string | undefined;
    const force = Boolean(body.force);
    if (!job_id) {
      return NextResponse.json({ error: "job_id required" }, { status: 400 });
    }

    if (!process.env.ACEMUSIC_API_KEY) {
      return NextResponse.json(
        { error: "ACEMUSIC_API_KEY is not set on the server. Add it in Vercel Project → Settings → Environment Variables." },
        { status: 503 },
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { data: job, error: jobErr } = await admin
      .from("jobs")
      .select("*")
      .eq("id", job_id)
      .eq("user_id", userData.user.id)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "cancelled" && !force) {
      return NextResponse.json({ status: job.status, job_id });
    }

    if (job.status === "done" && !force) {
      return NextResponse.json({ status: job.status, job_id });
    }

    // Duplicate guard — api_queued (progress 5) should still start; generating >=20 means in flight
    if (
      !force &&
      job.status === "processing" &&
      job.stage === "generating" &&
      (job.progress ?? 0) >= 20
    ) {
      return NextResponse.json({ status: "processing", job_id, message: "already generating" });
    }

    await admin
      .from("jobs")
      .update({
        status: "processing",
        stage: "generating",
        progress: 20,
        error: null,
        result_song_id: null,
      })
      .eq("id", job_id);

    const options = (job.options || {}) as Record<string, unknown>;
    const task = String(options.task || "text2music");
    const sampleMode = options.mode === "simple" || task === "radio";
    const prompt = buildPrompt(job);
    let durationSec = estimateDurationSec({
      lyrics: sampleMode ? String(options.style_prompt || job.title || "") : job.lyrics,
      songType: job.song_type,
      bpm: job.bpm,
      length: String(options.length || "auto"),
    });
    const bpm = job.bpm || null;
    const temperature = Number(options.temperature ?? 0.85);

    let sourceBase64: string | undefined;
    let sourceDuration = 0;
    if (options.source_song_id && !["text2music", "radio"].includes(task)) {
      const { data: source, error: sourceErr } = await admin
        .from("songs")
        .select("storage_path,duration_sec,lyrics")
        .eq("id", options.source_song_id)
        .eq("user_id", userData.user.id)
        .single();
      if (sourceErr || !source) {
        await admin.from("jobs").update({ status: "failed", stage: "failed", progress: 100, error: "Source song not found" }).eq("id", job_id);
        return NextResponse.json({ error: "Source song not found" }, { status: 404 });
      }
      const downloaded = await admin.storage.from("generated-songs").download(source.storage_path);
      if (downloaded.error || !downloaded.data) {
        await admin.from("jobs").update({ status: "failed", stage: "failed", progress: 100, error: downloaded.error?.message || "Could not read source audio" }).eq("id", job_id);
        return NextResponse.json({ error: "Could not read source audio" }, { status: 500 });
      }
      const bytes = Buffer.from(await downloaded.data.arrayBuffer());
      sourceBase64 = bytes.toString("base64");
      sourceDuration = Number(source.duration_sec || 0);
      if (!job.lyrics && source.lyrics) job.lyrics = source.lyrics;
    }

    if (task === "extend") {
      durationSec = Math.min(360, Math.max(30, sourceDuration + Number(options.extra_sec || 60)));
    }

    const instruction =
      task === "vocal_stem"
        ? "Extract the vocals track from the audio:"
        : task === "instrumental_stem"
          ? "Extract the drums, bass, guitar, and keyboard tracks from the audio:"
          : task === "extend"
            ? "Complete and extend the song, keeping the existing section and singing the rest of the lyrics:"
            : String(options.instruction || "") || undefined;

    let tracks: Buffer[];
    let duration: number;
    try {
      const result = await generateWithAceMusic({
        lyrics: job.lyrics,
        prompt,
        bpm,
        durationSec,
        instrumental: Boolean(options.instrumental) || task === "instrumental_stem",
        vocalLanguage: String(options.vocal_language || "en"),
        keyScale: String(options.key_scale || ""),
        timeSignature: String(options.time_signature || ""),
        temperature: Number.isFinite(temperature) ? temperature : 0.85,
        sampleMode,
        task,
        sourceBase64,
        repaintStart: options.repaint_start != null ? Number(options.repaint_start) : undefined,
        repaintEnd: options.repaint_end != null ? Number(options.repaint_end) : task === "extend" ? -1 : undefined,
        coverStrength: task === "cover" ? Number(options.cover_strength ?? 0.35) : undefined,
        instruction,
        batchSize: Number(options.variations) === 2 ? 2 : 1,
      });
      tracks = result.tracks.map((track) => maybeNormalizeMp3(track)).filter((track) => track.byteLength > 1000);
      duration = result.duration;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      await admin
        .from("jobs")
        .update({ status: "failed", stage: "failed", progress: 100, error: message.slice(0, 1000) })
        .eq("id", job_id);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    if (!tracks.length) {
      await admin
        .from("jobs")
        .update({ status: "failed", stage: "failed", progress: 100, error: "Empty audio from AceMusic" })
        .eq("id", job_id);
      return NextResponse.json({ error: "Empty audio" }, { status: 502 });
    }

    await admin.from("jobs").update({ stage: "uploading", progress: 80 }).eq("id", job_id);
    await admin.from("jobs").update({ result_song_id: null }).eq("id", job_id);
    await admin.from("songs").delete().eq("job_id", job_id);

    let firstSongId: string | null = null;
    for (let i = 0; i < tracks.length; i += 1) {
      const storage_path = `${userData.user.id}/${job_id}-${i}.mp3`;
      const { error: upErr } = await admin.storage.from("generated-songs").upload(storage_path, tracks[i], {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (upErr) {
        if (!firstSongId) {
          await admin.from("jobs").update({ status: "failed", stage: "failed", progress: 100, error: upErr.message }).eq("id", job_id);
          return NextResponse.json({ error: upErr.message }, { status: 500 });
        }
        break;
      }

      const inserted = await admin
        .from("songs")
        .insert({
          user_id: userData.user.id,
          job_id,
          title: tracks.length > 1 ? `${job.title || "Untitled"} v${i + 1}` : job.title || "Untitled",
          storage_path,
          duration_sec: duration,
          lyrics: job.lyrics || null,
          parent_song_id: (options.source_song_id as string) || (i > 0 ? firstSongId : null),
          meta: {
            engine: "acemusic",
            engine_provider: "acemusic",
            demo_mode: false,
            prompt,
            bpm,
            duration_sec: duration,
            task,
            tags: [job.country, job.genre, job.song_type, job.mood, task !== "text2music" ? task : ""].filter(Boolean),
          },
        })
        .select("id")
        .single();
      const song = inserted.data as { id: string } | null;
      const songErr = inserted.error;

      if (songErr || !song) {
        if (!firstSongId) {
          await admin.from("jobs").update({ status: "failed", stage: "failed", progress: 100, error: songErr?.message || "song insert failed" }).eq("id", job_id);
          return NextResponse.json({ error: songErr?.message || "song insert failed" }, { status: 500 });
        }
        break;
      }
      if (!firstSongId) firstSongId = song.id;
      try {
        await admin.rpc("spend_credit", { p_user_id: userData.user.id, p_amount: 1 });
      } catch {
        // non-fatal
      }
    }

    await admin
      .from("jobs")
      .update({
        status: "done",
        stage: "done",
        progress: 100,
        result_song_id: firstSongId,
        error: null,
      })
      .eq("id", job_id);

    return NextResponse.json({ status: "done", job_id, song_id: firstSongId, engine: "acemusic", tracks: tracks.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
