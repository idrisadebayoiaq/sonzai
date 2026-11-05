import { createClient } from "@/lib/supabase/client";

export type CreateJobPayload = {
  lyrics: string;
  country: string;
  genre: string;
  song_type: string;
  mood?: string;
  bpm?: number | null;
  language_mix?: string;
  vocal_style?: string;
  title?: string;
  voice_sample_path?: string | null;
  energy?: number | null;
  options?: Record<string, unknown>;
};

async function requireUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sign in required");
  return { supabase, user: data.user };
}

async function signedSongUrl(storagePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("generated-songs").createSignedUrl(storagePath, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function getProfile() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProfile(patch: {
  full_name?: string | null;
  display_name?: string | null;
  bio?: string | null;
  country?: string | null;
  avatar_url?: string | null;
}) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadVoiceSample(file: File) {
  const { supabase, user } = await requireUser();
  const ext = file.name.split(".").pop()?.toLowerCase() || "wav";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("voice-samples").upload(path, file, {
    contentType: file.type || "audio/mpeg",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function createJob(_token: string, payload: CreateJobPayload) {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase.from("profiles").select("credits_remaining").eq("id", user.id).maybeSingle();
  if (profile && profile.credits_remaining <= 0) {
    throw new Error("No credits remaining. Update credits in Settings or contact support.");
  }

  // Insert already claimed for the AceMusic API so local workers cannot steal the job as demo_wav
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      user_id: user.id,
      status: "processing",
      stage: "api_queued",
      lyrics: payload.lyrics.trim(),
      country: payload.country.toUpperCase(),
      genre: payload.genre.toLowerCase(),
      song_type: payload.song_type,
      mood: payload.mood ?? null,
      bpm: payload.bpm ?? null,
      language_mix: payload.language_mix ?? null,
      vocal_style: payload.vocal_style ?? null,
      title: payload.title || "Untitled",
      voice_sample_path: payload.voice_sample_path ?? null,
      energy: payload.energy ?? null,
      options: payload.options ?? {},
      progress: 5,
    })
    .select("id, status")
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to create job");

  return { job_id: data.id as string, status: data.status as string };
}

/** Starts AceMusic generation (long-running; poll job status). Pass force to replace demo tracks. */
export async function startGeneration(jobId: string, opts?: { force?: boolean }) {
  const { supabase } = await requireUser();
  const { data: sessionData } = await supabase.auth.getSession();
  const access = sessionData.session?.access_token;
  if (!access) throw new Error("Sign in required");

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
    body: JSON.stringify({ job_id: jobId, force: Boolean(opts?.force) }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Generation failed (${res.status})`);
  }
  return res.json();
}

export async function cancelJob(jobId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("jobs")
    .update({ status: "cancelled", stage: "cancelled", progress: 100 })
    .eq("id", jobId)
    .in("status", ["pending", "processing"]);
  if (error) throw new Error(error.message);
}

export async function getJob(_token: string, jobId: string) {
  const { supabase } = await requireUser();
  const { data: job, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  if (error || !job) throw new Error(error?.message || "Job not found");

  let song = null;
  if (job.result_song_id) {
    const { data: songRow } = await supabase.from("songs").select("*").eq("id", job.result_song_id).maybeSingle();
    if (songRow) {
      song = {
        ...songRow,
        signed_url: await signedSongUrl(songRow.storage_path),
      };
    }
  }

  return { ...job, song };
}

export async function listSongs(_token?: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("songs").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  const songs = [];
  for (const row of data || []) {
    songs.push({ ...row, signed_url: await signedSongUrl(row.storage_path) });
  }
  return songs;
}

export async function listJobs() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function deleteSong(songId: string, storagePath: string) {
  const { supabase } = await requireUser();
  await supabase.storage.from("generated-songs").remove([storagePath]);
  const { error } = await supabase.from("songs").delete().eq("id", songId);
  if (error) throw new Error(error.message);
}

export async function deleteProfile() {
  const { supabase, user } = await requireUser();
  // Soft-clear profile fields; full auth delete requires service role
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: null,
      display_name: "Deleted",
      bio: null,
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  await supabase.auth.signOut();
}
