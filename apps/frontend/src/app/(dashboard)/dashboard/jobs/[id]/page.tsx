"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Waveform } from "@/components/Waveform";
import { cancelJob, getJob, startGeneration } from "@/lib/api";
import { STAGE_LABELS } from "@/lib/options";

type Job = {
  id: string;
  status: string;
  progress: number;
  stage?: string | null;
  error?: string | null;
  title?: string | null;
  country: string;
  genre: string;
  lyrics?: string;
  song?: {
    title: string;
    signed_url?: string | null;
    meta?: {
      demo_mode?: boolean;
      engine_provider?: string;
      prompt?: string;
    };
  } | null;
};

export default function DashboardJobPage() {
  const params = useParams<{ id: string }>();
  const { session, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const token = session?.access_token;
    if (!token) {
      setError("Sign in required to view this job.");
      return;
    }

    async function tick() {
      try {
        const data = await getJob(token!, params.id);
        if (!cancelled) setJob(data);

        if (data.status === "pending" && !startedRef.current) {
          startedRef.current = true;
          startGeneration(params.id).catch((err) => {
            if (!cancelled) {
              setError(err instanceof Error ? err.message : "Generation failed to start");
            }
          });
        }

        if (["done", "failed", "cancelled"].includes(data.status)) {
          if (timer) clearInterval(timer);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load job");
      }
    }

    tick();
    timer = setInterval(tick, 2500);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [authLoading, session, params.id]);

  const done = job?.status === "done" && job.song?.signed_url;
  const canCancel = job && ["pending", "processing"].includes(job.status);

  async function onCancel() {
    if (!job) return;
    setCancelling(true);
    try {
      await cancelJob(job.id);
      setJob({ ...job, status: "cancelled", stage: "cancelled", progress: 100 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Generation</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">
          {done ? "Song ready" : job?.status === "cancelled" ? "Cancelled" : job?.status === "failed" ? "Failed" : "Generating real song"}
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          AceMusic is composing from your lyrics and style pack. This can take 1–3 minutes.
        </p>
      </div>

      {error && <p className="text-[var(--danger)]">{error}</p>}

      {job && (
        <div className="panel space-y-5 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{job.title || "Untitled"}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {job.country} · {job.genre}
              </p>
            </div>
            <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs capitalize text-[var(--muted)]">
              {STAGE_LABELS[job.stage || job.status] || job.status}
            </span>
          </div>

          {!done && job.status !== "cancelled" && job.status !== "failed" && (
            <div className="h-28 rounded-xl border border-[var(--line)] bg-black/20 px-4 py-3">
              <Waveform className="h-full" />
            </div>
          )}

          <div>
            <div className="mb-2 flex justify-between text-sm text-[var(--muted)]">
              <span>{STAGE_LABELS[job.stage || ""] || "Progress"}</span>
              <span>{job.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/35">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>

          {canCancel && (
            <button type="button" className="btn-ghost" disabled={cancelling} onClick={onCancel}>
              {cancelling ? "Cancelling…" : "Cancel job"}
            </button>
          )}

          {job.error && <p className="text-sm text-[var(--danger)]">{job.error}</p>}

          {done && (
            <div className="space-y-4 border-t border-[var(--line)] pt-5">
              {job.song?.meta?.engine_provider && (
                <p className="text-sm text-[var(--muted)]">Engine: {job.song.meta.engine_provider}</p>
              )}
              {job.song?.meta?.demo_mode && (
                <p className="text-sm text-[var(--danger)]">
                  This file was marked demo — check ACEMUSIC_API_KEY on the server.
                </p>
              )}
              <audio controls src={job.song!.signed_url!} className="w-full" />
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/library" className="btn-primary">
                  Open library
                </Link>
                <Link href="/dashboard/create" className="btn-ghost">
                  Create another
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
