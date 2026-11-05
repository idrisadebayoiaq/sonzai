"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listSongs } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

type Song = {
  id: string;
  title: string;
  signed_url?: string | null;
  duration_sec?: number | null;
  created_at?: string;
  meta?: { demo_mode?: boolean; tags?: string[] };
};

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        setError("Sign in to view your library.");
        setLoading(false);
        return;
      }
      try {
        const rows = await listSongs(token);
        setSongs(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load songs");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="anim-rise text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Collection</p>
          <h1 className="anim-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">
            Library
          </h1>
          <p className="anim-rise-delay-2 mt-3 text-[var(--muted)]">Your generated tracks live here.</p>
        </div>
        <Link href="/create" className="btn-primary shrink-0">
          New song
        </Link>
      </div>

      {loading && <p className="text-[var(--muted)]">Loading…</p>}
      {error && (
        <div className="panel p-5 text-sm">
          <p className="text-[var(--danger)]">{error}</p>
          <Link href="/login" className="mt-3 inline-block text-[var(--accent)]">
            Go to login
          </Link>
        </div>
      )}

      <ul className="space-y-4">
        {songs.map((song, index) => (
          <li
            key={song.id}
            className="panel anim-rise p-5"
            style={{ animationDelay: `${Math.min(index, 6) * 0.06}s` }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">{song.title}</h2>
              {song.meta?.demo_mode && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">demo</span>
              )}
            </div>
            {song.signed_url ? (
              <audio controls src={song.signed_url} className="w-full" />
            ) : (
              <p className="text-sm text-[var(--muted)]">No playable URL</p>
            )}
            {song.meta?.tags?.length ? (
              <p className="mt-3 text-xs capitalize text-[var(--muted)]">{song.meta.tags.filter(Boolean).join(" · ")}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {!loading && !error && songs.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-[var(--muted)]">No songs yet.</p>
          <Link href="/create" className="btn-primary mt-5 inline-flex">
            Create your first track
          </Link>
        </div>
      )}
    </div>
  );
}
