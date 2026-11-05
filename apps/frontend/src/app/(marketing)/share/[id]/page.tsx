"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const [song, setSong] = useState<{ title: string; signed_url: string | null; lyrics?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${params.id}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Not found");
        setSong(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Not found"));
  }, [params.id]);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      {error && <p className="text-[var(--danger)]">{error}</p>}
      {song && (
        <div className="panel space-y-4 p-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{song.title}</h1>
          {song.signed_url && <audio controls src={song.signed_url} className="w-full" />}
          {song.lyrics && <pre className="whitespace-pre-wrap text-sm text-[var(--muted)]">{song.lyrics}</pre>}
        </div>
      )}
    </div>
  );
}
