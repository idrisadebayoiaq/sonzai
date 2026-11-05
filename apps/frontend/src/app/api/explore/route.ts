import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("songs")
    .select("id,title,storage_path,lyrics,meta,duration_sec,created_at")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const songs = [];
  for (const song of data || []) {
    const signed = await admin.storage.from("generated-songs").createSignedUrl(song.storage_path, 60 * 60);
    songs.push({
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      meta: song.meta,
      duration_sec: song.duration_sec,
      signed_url: signed.data?.signedUrl || null,
    });
  }
  return NextResponse.json({ songs });
}
