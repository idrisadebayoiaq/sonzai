"use client";

import { formatPlayback, usePlayer } from "@/components/PlayerProvider";

function coverStyle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  const hueA = 28 + (hash % 40);
  const hueB = 140 + ((hash >> 4) % 40);
  return {
    background: `linear-gradient(145deg, hsl(${hueA} 70% 48%), hsl(${hueB} 45% 28%))`,
  };
}

export function PlayerBar() {
  const { current, playing, currentTime, duration, volume, toggle, next, prev, seek, setVolume, queue } = usePlayer();
  if (!current) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="sticky bottom-0 z-30 border-t border-[var(--line)] bg-[rgba(11,16,14,0.94)] px-4 py-3 backdrop-blur-md md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <button
          type="button"
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10"
          aria-label="Seek"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            seek(Math.max(0, Math.min(1, ratio)) * (duration || 0));
          }}
        >
          <span className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]" style={{ width: `${progress}%` }} />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-lg" style={coverStyle(current.title)} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-display)] font-semibold">{current.title}</p>
            <p className="truncate text-xs text-[var(--muted)]">{current.subtitle || current.tags?.slice(0, 3).join(" · ")}</p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn-ghost !px-2 !py-1 text-sm" onClick={prev} aria-label="Previous">
              Prev
            </button>
            <button type="button" className="btn-primary !px-4 !py-2 text-sm" onClick={toggle}>
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className="btn-ghost !px-2 !py-1 text-sm"
              onClick={next}
              disabled={queue.length < 2}
              aria-label="Next"
            >
              Next
            </button>
          </div>

          <p className="hidden w-24 text-right text-xs tabular-nums text-[var(--muted)] sm:block">
            {formatPlayback(currentTime)} / {formatPlayback(duration)}
          </p>
          <label className="hidden w-24 items-center gap-2 text-[10px] uppercase tracking-wide text-[var(--muted)] lg:flex">
            Vol
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export function SongCover({ title, className = "" }: { title: string; className?: string }) {
  return <div className={`rounded-2xl ${className}`} style={coverStyle(title)} />;
}
