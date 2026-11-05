"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { deleteSong, listSongs } from "@/lib/api";

type Song = {
  id: string;
  title: string;
  storage_path?: string;
  signed_url?: string | null;
  duration_sec?: number | null;
  created_at?: string;
  meta?: { demo_mode?: boolean; tags?: string[]; voice_sample_provided?: boolean; engine_provider?: string };
};

export default function LibraryPage() {
  const { session, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const token = session?.access_token;
    if (!token) {
      setError("Sign in to view your library.");
      setLoading(false);
      return;
    }
    listSongs(token)
      .then(setSongs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load songs"))
      .finally(() => setLoading(false));
  }, [authLoading, session]);

  async function onDelete(song: Song) {
    if (!song.storage_path) return;
    setDeletingId(song.id);
    try {
      await deleteSong(song.id, song.storage_path);
      setSongs((prev) => prev.filter((s) => s.id !== song.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="anim-rise text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Collection</p>
          <h1 className="anim-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">Library</h1>
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
              <div className="flex items-center gap-3">
                {song.meta?.engine_provider && song.meta.engine_provider !== "demo_wav" && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-2)]">
                    {song.meta.engine_provider}
                  </span>
                )}
                {song.meta?.demo_mode && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">demo</span>
                )}
                <button
                  type="button"
                  className="text-xs text-[var(--danger)]"
                  disabled={deletingId === song.id}
                  onClick={() => onDelete(song)}
                >
                  {deletingId === song.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
            {song.signed_url ? (
              <audio controls src={song.signed_url} className="w-full" />
            ) : (
              <p className="text-sm text-[var(--muted)]">No playable URL</p>
            )}
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
