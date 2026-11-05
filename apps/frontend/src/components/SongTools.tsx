"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  addSongToPlaylist,
  createJob,
  createPlaylist,
  listPlaylists,
  updateSong,
} from "@/lib/api";
import { GENRE_CATEGORIES } from "@/lib/options";

export type ToolSong = {
  id: string;
  title: string;
  lyrics?: string | null;
  visibility?: string | null;
  crop_start?: number | null;
  crop_end?: number | null;
  meta?: { tags?: string[]; prompt?: string };
  country?: string;
  genre?: string;
};

export function SongTools({ song, onChange }: { song: ToolSong; onChange?: () => void }) {
  const router = useRouter();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [genre, setGenre] = useState(song.meta?.tags?.[1] || "pop");
  const [extra, setExtra] = useState("60");
  const [repaintStart, setRepaintStart] = useState("30");
  const [repaintEnd, setRepaintEnd] = useState("50");
  const [cropStart, setCropStart] = useState(song.crop_start != null ? String(song.crop_start) : "0");
  const [cropEnd, setCropEnd] = useState(song.crop_end != null ? String(song.crop_end) : "");
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [playlistId, setPlaylistId] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    listPlaylists().then(setPlaylists).catch(() => undefined);
  }, [open]);

  const country = song.country || song.meta?.tags?.[0] || "NG";
  const baseGenre = song.genre || song.meta?.tags?.[1] || "pop";

  async function run(task: string, options: Record<string, unknown>, nextGenre = baseGenre) {
    if (!session?.access_token) return;
    setBusy(true);
    setError(null);
    try {
      const { job_id } = await createJob(session.access_token, {
        title: song.title,
        lyrics: song.lyrics || song.title,
        country: String(country).slice(0, 2).toUpperCase(),
        genre: nextGenre,
        song_type: "full_song",
        options: { task, source_song_id: song.id, style_prompt: song.meta?.prompt || "", ...options },
      });
      router.push(`/dashboard/jobs/${job_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start");
      setBusy(false);
    }
  }

  async function onPlaylist(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let id = playlistId;
      if (!id && playlistName.trim()) {
        const created = await createPlaylist(playlistName.trim());
        id = created.id;
      }
      if (!id) throw new Error("Pick or name a playlist");
      await addSongToPlaylist(id, song.id);
      setPlaylistName("");
      onChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playlist failed");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="text-xs text-[var(--accent)]" onClick={() => setOpen(true)}>
        Tools
      </button>
    );
  }

  return (
    <div className="mt-3 grid gap-3 border-t border-[var(--line)] pt-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <select className="field !w-auto" value={extra} onChange={(event) => setExtra(event.target.value)}>
          <option value="30">+30s</option>
          <option value="60">+60s</option>
          <option value="90">+90s</option>
        </select>
        <button type="button" className="btn-ghost !px-3 !py-1.5" disabled={busy} onClick={() => run("extend", { extra_sec: Number(extra) })}>
          Extend
        </button>
        <select className="field !w-auto" value={genre} onChange={(event) => setGenre(event.target.value)}>
          {GENRE_CATEGORIES.flatMap((category) => category.genres).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button type="button" className="btn-ghost !px-3 !py-1.5" disabled={busy} onClick={() => run("cover", { cover_strength: 0.35 }, genre)}>
          Cover
        </button>
        <button type="button" className="btn-ghost !px-3 !py-1.5" disabled={busy} onClick={() => run("radio", { mode: "simple", style_prompt: `${baseGenre} in the style of ${song.title}` })}>
          Radio
        </button>
        <button type="button" className="btn-ghost !px-3 !py-1.5" disabled={busy} onClick={() => run("vocal_stem", {})}>
          Vocal stem
        </button>
        <button type="button" className="btn-ghost !px-3 !py-1.5" disabled={busy} onClick={() => run("instrumental_stem", { instrumental: true })}>
          Instrumental stem
        </button>
        <button
          type="button"
          className="btn-ghost !px-3 !py-1.5"
          onClick={() => {
            const next = song.visibility === "public" ? "private" : "public";
            updateSong(song.id, { visibility: next }).then(() => onChange?.()).catch((err) => setError(err.message));
          }}
        >
          {song.visibility === "public" ? "Make private" : "Make public"}
        </button>
        <button
          type="button"
          className="text-xs text-[var(--muted)]"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/share/${song.id}`);
          }}
        >
          Copy share link
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input className="field !w-20" value={repaintStart} onChange={(event) => setRepaintStart(event.target.value)} aria-label="Repaint start" />
        <input className="field !w-20" value={repaintEnd} onChange={(event) => setRepaintEnd(event.target.value)} aria-label="Repaint end" />
        <button
          type="button"
          className="btn-ghost !px-3 !py-1.5"
          disabled={busy}
          onClick={() => run("repaint", { repaint_start: Number(repaintStart), repaint_end: Number(repaintEnd) })}
        >
          Replace section
        </button>
        <input className="field !w-20" value={cropStart} onChange={(event) => setCropStart(event.target.value)} aria-label="Crop start" />
        <input className="field !w-20" value={cropEnd} onChange={(event) => setCropEnd(event.target.value)} aria-label="Crop end" />
        <button
          type="button"
          className="btn-ghost !px-3 !py-1.5"
          onClick={() =>
            updateSong(song.id, {
              crop_start: Number(cropStart) || 0,
              crop_end: cropEnd ? Number(cropEnd) : null,
            })
              .then(() => onChange?.())
              .catch((err) => setError(err.message))
          }
        >
          Crop
        </button>
      </div>
      <form onSubmit={onPlaylist} className="flex flex-wrap gap-2">
        <select className="field !w-auto" value={playlistId} onChange={(event) => setPlaylistId(event.target.value)}>
          <option value="">Playlist</option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
        <input className="field !w-40" value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="New playlist" />
        <button type="submit" className="btn-ghost !px-3 !py-1.5" disabled={busy}>
          Add
        </button>
        <button type="button" className="text-xs text-[var(--muted)]" onClick={() => setOpen(false)}>
          Close
        </button>
      </form>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
