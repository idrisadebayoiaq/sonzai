"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listJobs } from "@/lib/api";
import { STAGE_LABELS } from "@/lib/options";

type Job = Awaited<ReturnType<typeof listJobs>>[number];

export default function DashboardHistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    listJobs()
      .then(setJobs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return jobs;
    return jobs.filter((j) => j.status === statusFilter);
  }, [jobs, statusFilter]);

  const counts = useMemo(() => {
    const base = { all: jobs.length, done: 0, failed: 0, processing: 0, pending: 0, cancelled: 0 };
    for (const j of jobs) {
      if (j.status in base) (base as Record<string, number>)[j.status] += 1;
    }
    return base;
  }, [jobs]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">History</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">History</h1>
      </div>

      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ["all", "All"],
            ["done", "Done"],
            ["processing", "Processing"],
            ["pending", "Pending"],
            ["failed", "Failed"],
            ["cancelled", "Cancelled"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatusFilter(id)}
            className={`panel px-4 py-3 text-left transition ${
              statusFilter === id ? "border-[var(--accent)]" : "hover:border-white/20"
            }`}
          >
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {counts[id as keyof typeof counts] ?? 0}
            </p>
          </button>
        ))}
      </section>

      {loading && <p className="text-[var(--muted)]">Loading history…</p>}
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <section className="panel overflow-x-auto p-4 md:p-6">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[var(--muted)]">
            <tr className="border-b border-[var(--line)]">
              <th className="py-2 pr-3 font-medium">Title</th>
              <th className="py-2 pr-3 font-medium">Country</th>
              <th className="py-2 pr-3 font-medium">Genre</th>
              <th className="py-2 pr-3 font-medium">Type</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Progress</th>
              <th className="py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr key={job.id} className="border-b border-[var(--line)] last:border-0 align-top">
                <td className="py-3 pr-3">
                  <Link href={`/dashboard/jobs/${job.id}`} className="font-medium text-[var(--accent)] hover:underline">
                    {job.title || "Untitled"}
                  </Link>
                  {job.error && <p className="mt-1 max-w-xs text-xs text-[var(--danger)]">{job.error}</p>}
                </td>
                <td className="py-3 pr-3">{job.country}</td>
                <td className="py-3 pr-3 capitalize">{job.genre}</td>
                <td className="py-3 pr-3">{job.song_type}</td>
                <td className="py-3 pr-3 capitalize">
                  {STAGE_LABELS[job.stage || ""] || job.status}
                </td>
                <td className="py-3 pr-3">{job.progress}%</td>
                <td className="py-3 text-[var(--muted)]">
                  {job.created_at ? new Date(job.created_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="py-8 text-center text-[var(--muted)]">No jobs in this filter.</p>
        )}
      </section>
    </div>
  );
}
