import { NextRequest, NextResponse } from "next/server";
import { generateWithAceMusic, maybeNormalizeMp3 } from "@/lib/acemusic";
import { estimateDurationSec } from "@/lib/songLength";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 800;

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
    const sampleMode = options.mode === "simple";
    const prompt = buildPrompt(job);
    const durationSec = estimateDurationSec({
      lyrics: sampleMode ? String(options.style_prompt || job.title || "") : job.lyrics,
      songType: job.song_type,
      bpm: job.bpm,
      length: String(options.length || "auto"),
    });
    const bpm = job.bpm || null;
    const temperature = Number(options.temperature ?? 0.85);

    let mp3: Buffer;
    let duration: number;
    try {
      const result = await generateWithAceMusic({
        lyrics: job.lyrics,
        prompt,
        bpm,
        durationSec,
        instrumental: Boolean(options.instrumental),
        vocalLanguage: String(options.vocal_language || "en"),
        keyScale: String(options.key_scale || ""),
        timeSignature: String(options.time_signature || ""),
        temperature: Number.isFinite(temperature) ? temperature : 0.85,
        sampleMode,
      });
      mp3 = maybeNormalizeMp3(result.mp3);
      duration = result.duration;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      await admin
        .from("jobs")
        .update({ status: "failed", stage: "failed", progress: 100, error: message.slice(0, 1000) })
        .eq("id", job_id);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    if (mp3.byteLength < 1000) {
      await admin
        .from("jobs")
        .update({ status: "failed", stage: "failed", progress: 100, error: "Empty audio from AceMusic" })
        .eq("id", job_id);
      return NextResponse.json({ error: "Empty audio" }, { status: 502 });
    }

    await admin.from("jobs").update({ stage: "uploading", progress: 80 }).eq("id", job_id);

    const storage_path = `${userData.user.id}/${job_id}.mp3`;
    const { error: upErr } = await admin.storage.from("generated-songs").upload(storage_path, mp3, {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (upErr) {
      await admin
        .from("jobs")
        .update({ status: "failed", stage: "failed", progress: 100, error: upErr.message })
        .eq("id", job_id);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Replace any previous demo song for this job (clear FK first)
    await admin.from("jobs").update({ result_song_id: null }).eq("id", job_id);
    await admin.from("songs").delete().eq("job_id", job_id);

    const { data: song, error: songErr } = await admin
      .from("songs")
      .insert({
        user_id: userData.user.id,
        job_id,
        title: job.title || "Untitled",
        storage_path,
        duration_sec: duration,
        meta: {
          engine: "acemusic",
          engine_provider: "acemusic",
          demo_mode: false,
          prompt,
          bpm,
          duration_sec: duration,
          tags: [job.country, job.genre, job.song_type, job.mood],
        },
      })
      .select("id")
      .single();

    if (songErr || !song) {
      await admin
        .from("jobs")
        .update({ status: "failed", stage: "failed", progress: 100, error: songErr?.message || "song insert failed" })
        .eq("id", job_id);
      return NextResponse.json({ error: songErr?.message || "song insert failed" }, { status: 500 });
    }

    try {
      await admin.rpc("spend_credit", { p_user_id: userData.user.id, p_amount: 1 });
    } catch {
      // non-fatal
    }

    await admin
      .from("jobs")
      .update({
        status: "done",
        stage: "done",
        progress: 100,
        result_song_id: song.id,
        error: null,
      })
      .eq("id", job_id);

    return NextResponse.json({ status: "done", job_id, song_id: song.id, engine: "acemusic" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
