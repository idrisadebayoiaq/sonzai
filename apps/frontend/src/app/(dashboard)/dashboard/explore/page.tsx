"use client";

import { useEffect, useState } from "react";
import { listPublicSongs, type PublicSong } from "@/lib/api";
import { SongCover } from "@/components/PlayerBar";
import { usePlayer } from "@/components/PlayerProvider";

export default function ExplorePage() {
  const player = usePlayer();
  const [songs, setSongs] = useState<PublicSong[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPublicSongs()
      .then(setSongs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  const queue = songs
    .filter((song) => song.signed_url)
    .map((song) => ({
      id: song.id,
      title: song.title,
      url: song.signed_url as string,
      subtitle: (song.meta?.tags || []).slice(0, 3).join(" · "),
      lyrics: song.lyrics,
    }));

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold">Explore</h1>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <ul className="space-y-3">
        {songs.map((song) => (
          <li key={song.id} className="panel flex items-center gap-4 p-4">
            <button
              type="button"
              className="relative h-14 w-14 shrink-0"
              disabled={!song.signed_url}
              onClick={() =>
                song.signed_url &&
                player.playSong(
                  { id: song.id, title: song.title, url: song.signed_url, lyrics: song.lyrics },
                  queue,
                )
              }
            >
              <SongCover title={song.title} className="h-full w-full" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-medium">{song.title}</p>
              <p className="truncate text-xs text-[var(--muted)]">{(song.meta?.tags || []).filter(Boolean).join(" · ")}</p>
            </div>
          </li>
        ))}
      </ul>
      {songs.length === 0 && !error && <p className="text-sm text-[var(--muted)]">No public songs yet.</p>}
    </div>
  );
}
