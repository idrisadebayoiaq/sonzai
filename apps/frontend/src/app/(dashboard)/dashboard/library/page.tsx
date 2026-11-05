"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteSong, listPlaylistSongs, listPlaylists, listSongs } from "@/lib/api";
import { SongCover } from "@/components/PlayerBar";
import { SongTools } from "@/components/SongTools";
import { formatPlayback, usePlayer } from "@/components/PlayerProvider";

type Song = {
  id: string;
  title: string;
  storage_path?: string;
  signed_url?: string | null;
  duration_sec?: number | null;
  created_at?: string;
  lyrics?: string | null;
  visibility?: string | null;
  crop_start?: number | null;
  crop_end?: number | null;
  meta?: {
    demo_mode?: boolean;
    tags?: string[];
    engine_provider?: string;
    prompt?: string;
  };
};

export default function DashboardLibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const player = usePlayer();

  useEffect(() => {
    listPlaylists().then(setPlaylists).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!playlistId) {
      listSongs()
        .then(setSongs)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load songs"))
        .finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    listPlaylistSongs(playlistId)
      .then(setSongs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load playlist"))
      .finally(() => setLoading(false));
  }, [playlistId, reloadKey]);

  async function onDelete(song: Song) {
    if (!song.storage_path) return;
    if (!confirm(`Delete “${song.title}”? This cannot be undone.`)) return;
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

  const filtered = songs.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const tags = (s.meta?.tags || []).join(" ").toLowerCase();
    return s.title.toLowerCase().includes(q) || tags.includes(q);
  });

  const playable = filtered
    .filter((song) => song.signed_url)
    .map((song) => ({
      id: song.id,
      title: song.title,
      url: song.signed_url as string,
      subtitle: (song.meta?.tags || []).filter(Boolean).slice(0, 3).join(" · "),
      tags: (song.meta?.tags || []).map(String),
      lyrics: song.lyrics,
      cropStart: song.crop_start,
      cropEnd: song.crop_end,
    }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Library</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">Your songs</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Your tracks.</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary shrink-0">
          New song
        </Link>
      </div>

      <section className="panel grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Total tracks</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">{songs.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Real engine</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            {songs.filter((s) => s.meta?.engine_provider === "acemusic").length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Demo leftovers</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">
            {songs.filter((s) => s.meta?.demo_mode).length}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <label className="field block max-w-md flex-1 text-sm">
          <span className="mb-2 block text-[var(--muted)]">Search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title or tag" />
        </label>
        <label className="field block text-sm">
          <span className="mb-2 block text-[var(--muted)]">Playlist</span>
          <select value={playlistId} onChange={(event) => setPlaylistId(event.target.value)}>
            <option value="">All songs</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="text-[var(--muted)]">Loading library…</p>}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <ul className="space-y-3">
        {filtered.map((song) => {
          const active = player.current?.id === song.id;
          return (
            <li key={song.id} className={`panel p-4 ${active ? "border-[var(--accent)]" : ""}`}>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={!song.signed_url}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl"
                  onClick={() => {
                    if (!song.signed_url) return;
                    if (active) player.toggle();
                    else
                      player.playSong(
                        {
                          id: song.id,
                          title: song.title,
                          url: song.signed_url,
          subtitle: (song.meta?.tags || []).filter(Boolean).slice(0, 3).join(" · "),
          tags: (song.meta?.tags || []).map(String),
          lyrics: song.lyrics,
          cropStart: song.crop_start,
          cropEnd: song.crop_end,
        },
        playable,
      );
                  }}
                >
                  <SongCover title={song.title} className="h-full w-full rounded-xl" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-xs font-semibold">
                    {active && player.playing ? "Pause" : "Play"}
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-[family-name:var(--font-display)] text-lg font-semibold">{song.title}</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {song.created_at ? new Date(song.created_at).toLocaleString() : ""}
                    {song.duration_sec ? ` · ${formatPlayback(Number(song.duration_sec))}` : ""}
                  </p>
                  {song.meta?.tags && song.meta.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {song.meta.tags.filter(Boolean).map((tag) => (
                        <span
                          key={String(tag)}
                          className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]"
                        >
                          {String(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {song.meta?.demo_mode && (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--danger)]">demo</span>
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
              <SongTools song={song} onChange={() => setReloadKey((value) => value + 1)} />
            </li>
          );
        })}
      </ul>
      {!loading && !error && filtered.length === 0 && <p className="text-sm text-[var(--muted)]">No songs.</p>}
    </div>
  );
}
