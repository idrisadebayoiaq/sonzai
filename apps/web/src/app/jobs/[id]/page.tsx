"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getJob } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

type Job = {
  id: string;
  status: string;
  progress: number;
  error?: string | null;
  title?: string | null;
  country: string;
  genre: string;
  song?: {
    title: string;
    signed_url?: string | null;
    duration_sec?: number | null;
    meta?: { demo_mode?: boolean; prompt?: string };
  } | null;
};

export default function JobPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function tick(token: string) {
      try {
        const data = await getJob(token, params.id);
        if (!cancelled) setJob(data);
        if (data.status === "done" || data.status === "failed") {
          if (timer) clearInterval(timer);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load job");
      }
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        setError("Sign in required");
        return;
      }
      tick(token);
      timer = setInterval(() => tick(token), 2000);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [params.id]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Generating</h1>
      {error && <p className="mt-4 text-[var(--danger)]">{error}</p>}
      {job && (
        <div className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] p-6">
          <p className="text-sm text-[var(--muted)]">
            {job.title || "Untitled"} · {job.country} · {job.genre}
          </p>
          <p className="text-lg capitalize">Status: {job.status}</p>
          <div className="h-2 overflow-hidden rounded-full bg-black/30">
            <div className="h-full bg-[var(--accent-2)] transition-all" style={{ width: `${job.progress}%` }} />
          </div>
          <p className="text-sm text-[var(--muted)]">{job.progress}%</p>
          {job.error && <p className="text-[var(--danger)]">{job.error}</p>}
          {job.song?.signed_url && (
            <div className="space-y-3 pt-2">
              <p className="text-[var(--accent-2)]">Ready</p>
              {job.song.meta?.demo_mode && (
                <p className="text-sm text-[var(--muted)]">
                  Demo audio (free path, no GPU). Prompt was still built from your Style Pack for later ACE-Step.
                </p>
              )}
              <audio controls src={job.song.signed_url} className="w-full" />
              <Link href="/library" className="inline-block text-[var(--accent)]">
                Open library →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
