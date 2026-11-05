import { NextRequest, NextResponse } from "next/server";
import { generateWithAceMusic, maybeNormalizeMp3 } from "@/lib/acemusic";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

const DURATION: Record<string, number> = {
  hook: 30,
  freestyle: 45,
  dance_track: 60,
  full_song: 60,
  ballad: 60,
  gospel: 60,
};

function buildPrompt(job: Record<string, unknown>) {
  const energy = Number(job.energy || 3);
  const energyWord = energy >= 4 ? "high energy" : energy <= 2 ? "mellow low energy" : "medium energy";
  const parts = [
    `${job.country} contemporary song with authentic regional feel`,
    String(job.genre || ""),
    String(job.mood || "") + " mood",
    `${job.vocal_style || "natural"} vocal style`,
    String(job.language_mix || ""),
    energyWord,
    job.bpm ? `BPM ${job.bpm}` : "",
    `song type ${job.song_type}`,
    "sing the provided lyrics clearly with natural human vocals",
    "coherent melody, full arrangement, studio quality mix",
  ];
  return parts.filter(Boolean).join(", ");
}

export async function POST(req: NextRequest) {
  try {
    const { job_id } = await req.json();
    if (!job_id) {
      return NextResponse.json({ error: "job_id required" }, { status: 400 });
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

    if (["done", "cancelled"].includes(job.status)) {
      return NextResponse.json({ status: job.status, job_id });
    }

    // Avoid duplicate AceMusic calls when the job page remounts/refreshes
    if (job.status === "processing" && (job.progress ?? 0) >= 20) {
      return NextResponse.json({ status: "processing", job_id, message: "already generating" });
    }

    await admin
      .from("jobs")
      .update({ status: "processing", stage: "generating", progress: 20 })
      .eq("id", job_id);

    const prompt = buildPrompt(job);
    const durationSec = DURATION[job.song_type] || 60;
    const bpm = job.bpm || 108;

    let mp3: Buffer;
    let duration: number;
    try {
      const result = await generateWithAceMusic({
        lyrics: job.lyrics,
        prompt,
        bpm,
        durationSec,
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
