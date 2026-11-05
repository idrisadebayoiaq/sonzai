"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getJob } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Waveform } from "@/components/Waveform";

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
    meta?: { demo_mode?: boolean };
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
        setError("Sign in required to view this job.");
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

  const done = job?.status === "done" && job.song?.signed_url;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-12">
      <p className="anim-rise text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Session</p>
      <h1 className="anim-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-bold">
        {done ? "Ready" : "Generating"}
      </h1>

      {error && <p className="mt-6 text-[var(--danger)]">{error}</p>}

      {job && (
        <div className="anim-rise-delay-2 panel mt-8 space-y-5 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{job.title || "Untitled"}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {job.country} · {job.genre}
              </p>
            </div>
            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs capitalize text-[var(--muted)]">
              {job.status}
            </span>
          </div>

          {!done && (
            <div className="h-28 rounded-xl border border-[var(--line)] bg-black/20 px-4 py-3">
              <Waveform className="h-full" />
            </div>
          )}

          <div>
            <div className="mb-2 flex justify-between text-sm text-[var(--muted)]">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/35">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>

          {job.error && <p className="text-sm text-[var(--danger)]">{job.error}</p>}

          {done && (
            <div className="space-y-4 border-t border-[var(--line)] pt-5">
              {job.song?.meta?.demo_mode && (
                <p className="text-sm text-[var(--muted)]">
                  Demo audio for now — the full AI music engine wires in later.
                </p>
              )}
              <audio controls src={job.song!.signed_url!} className="w-full" />
              <Link href="/library" className="btn-ghost inline-flex">
                Open library
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
