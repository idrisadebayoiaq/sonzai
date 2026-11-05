"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getProfile, listJobs, listSongs } from "@/lib/api";

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [songs, setSongs] = useState<Awaited<ReturnType<typeof listSongs>>>([]);
  const [jobs, setJobs] = useState<Awaited<ReturnType<typeof listJobs>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProfile(), listSongs(), listJobs()])
      .then(([profile, songRows, jobRows]) => {
        setCredits(profile.credits_remaining ?? 0);
        setSongs(songRows.slice(0, 5));
        setJobs(jobRows.slice(0, 5));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, []);

  const name =
    (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "Creator";
  const doneJobs = jobs.filter((j) => j.status === "done").length;
  const failedJobs = jobs.filter((j) => j.status === "failed").length;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Overview</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">{name}</h1>
      </div>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Credits remaining" value={credits === null ? "—" : String(credits)} />
        <Stat label="Songs in library" value={String(songs.length)} />
        <Stat label="Recent jobs done" value={String(doneJobs)} />
        <Stat label="Recent failures" value={String(failedJobs)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Quick actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/create" className="btn-primary text-center">
              Create song
            </Link>
            <Link href="/dashboard/library" className="btn-ghost text-center">
              Open library
            </Link>
            <Link href="/dashboard/history" className="btn-ghost text-center">
              Song history
            </Link>
            <Link href="/dashboard/profile" className="btn-ghost text-center">
              Edit profile
            </Link>
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Recent songs</h2>
            <Link href="/dashboard/library" className="text-sm text-[var(--accent)]">
              View all
            </Link>
          </div>
          {songs.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No songs yet. Create your first track.</p>
          ) : (
            <ul className="space-y-3">
              {songs.map((song) => (
                <li key={song.id} className="border-b border-[var(--line)] pb-3 last:border-0">
                  <p className="font-medium">{song.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {song.created_at ? new Date(song.created_at).toLocaleString() : ""}
                    {song.meta?.engine_provider ? ` · ${song.meta.engine_provider}` : ""}
                    {song.meta?.demo_mode ? " · demo" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Recent generation jobs</h2>
          <Link href="/dashboard/history" className="text-sm text-[var(--accent)]">
            Full history
          </Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No jobs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr className="border-b border-[var(--line)]">
                  <th className="py-2 pr-3 font-medium">Title</th>
                  <th className="py-2 pr-3 font-medium">Style</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="py-3 pr-3">
                      <Link href={`/dashboard/jobs/${job.id}`} className="text-[var(--accent)] hover:underline">
                        {job.title || "Untitled"}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 capitalize text-[var(--muted)]">
                      {job.country} · {job.genre}
                    </td>
                    <td className="py-3 pr-3 capitalize">{job.status}</td>
                    <td className="py-3 text-[var(--muted)]">
                      {job.created_at ? new Date(job.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold">{value}</p>
    </div>
  );
}
