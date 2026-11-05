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
};

async function requireUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Sign in required");
  }
  return { supabase, user: data.user };
}

async function signedSongUrl(storagePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("generated-songs")
    .createSignedUrl(storagePath, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

export async function createJob(_token: string, payload: CreateJobPayload) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      user_id: user.id,
      status: "pending",
      lyrics: payload.lyrics.trim(),
      country: payload.country.toUpperCase(),
      genre: payload.genre.toLowerCase(),
      song_type: payload.song_type,
      mood: payload.mood ?? null,
      bpm: payload.bpm ?? null,
      language_mix: payload.language_mix ?? null,
      vocal_style: payload.vocal_style ?? null,
      title: payload.title || "Untitled",
      progress: 0,
    })
    .select("id, status")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create job");
  }
  return { job_id: data.id as string, status: data.status as string };
}

export async function getJob(_token: string, jobId: string) {
  const { supabase } = await requireUser();
  const { data: job, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  if (error || !job) {
    throw new Error(error?.message || "Job not found");
  }

  let song = null;
  if (job.result_song_id) {
    const { data: songRow } = await supabase.from("songs").select("*").eq("id", job.result_song_id).maybeSingle();
    if (songRow) {
      song = {
        id: songRow.id,
        title: songRow.title,
        storage_path: songRow.storage_path,
        duration_sec: songRow.duration_sec,
        meta: songRow.meta || {},
        created_at: songRow.created_at,
        signed_url: await signedSongUrl(songRow.storage_path),
      };
    }
  }

  return {
    id: job.id,
    status: job.status,
    progress: job.progress ?? 0,
    error: job.error,
    title: job.title,
    country: job.country,
    genre: job.genre,
    song_type: job.song_type,
    mood: job.mood,
    created_at: job.created_at,
    song,
  };
}

export async function listSongs(_token: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message || "Failed to list songs");
  }

  const songs = [];
  for (const row of data || []) {
    songs.push({
      id: row.id,
      title: row.title,
      storage_path: row.storage_path,
      duration_sec: row.duration_sec,
      meta: row.meta || {},
      created_at: row.created_at,
      signed_url: await signedSongUrl(row.storage_path),
    });
  }
  return songs;
}
