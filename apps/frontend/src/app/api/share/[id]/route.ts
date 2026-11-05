import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const admin = createAdminClient();
  const { data: song, error } = await admin
    .from("songs")
    .select("id,title,storage_path,lyrics,meta,duration_sec,visibility")
    .eq("id", id)
    .single();
  if (error || !song || song.visibility !== "public") {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }
  const signed = await admin.storage.from("generated-songs").createSignedUrl(song.storage_path, 60 * 60);
  return NextResponse.json({
    id: song.id,
    title: song.title,
    lyrics: song.lyrics,
    meta: song.meta,
    duration_sec: song.duration_sec,
    signed_url: signed.data?.signedUrl || null,
  });
}
