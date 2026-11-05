"use client";

import { useEffect, useRef, useState } from "react";
import { downloadMp3, downloadWav } from "@/lib/downloadAudio";
import { formatPlayback, usePlayer } from "@/components/PlayerProvider";

function coverStyle(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  const hueA = 28 + (hash % 40);
  const hueB = 140 + ((hash >> 4) % 40);
  return { background: `linear-gradient(145deg, hsl(${hueA} 70% 48%), hsl(${hueB} 45% 28%))` };
}

const peakCache = new Map<string, number[]>();

function WaveSeek({ url, progress, onSeek }: { url: string; progress: number; onSeek: (ratio: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = useState<number[]>(() => peakCache.get(url) || []);

  useEffect(() => {
    const cached = peakCache.get(url);
    if (cached) {
      setPeaks(cached);
      return;
    }
    let cancelled = false;
    const context = new AudioContext();
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((raw) => context.decodeAudioData(raw.slice(0)))
      .then((buffer) => {
        const data = buffer.getChannelData(0);
        const bars = 96;
        const size = Math.floor(data.length / bars);
        const next: number[] = [];
        for (let i = 0; i < bars; i += 1) {
          let peak = 0;
          for (let j = 0; j < size; j += 40) peak = Math.max(peak, Math.abs(data[i * size + j] || 0));
          next.push(peak);
        }
        const max = Math.max(...next, 0.01);
        const normalized = next.map((value) => value / max);
        peakCache.set(url, normalized);
        if (!cancelled) setPeaks(normalized);
      })
      .catch(() => undefined)
      .finally(() => context.close());
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const values = peaks.length ? peaks : Array.from({ length: 96 }, () => 0.25);
    const gap = 3;
    const barWidth = canvas.width / values.length - gap;
    values.forEach((peak, index) => {
      const height = Math.max(4, peak * canvas.height * 0.9);
      const x = index * (barWidth + gap);
      const y = (canvas.height - height) / 2;
      ctx.fillStyle = index / values.length <= progress ? "#f0b45a" : "rgba(243,239,228,0.28)";
      ctx.fillRect(x, y, barWidth, height);
    });
  }, [peaks, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="h-10 w-full cursor-pointer"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        onSeek(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)));
      }}
    />
  );
}

export function PlayerBar() {
  const player = usePlayer();
  const { current, playing, currentTime, duration, volume, toggle, next, prev, seek, setVolume, shuffle, repeat, toggleShuffle, cycleRepeat } = player;
  if (!current) return null;

  const start = current.cropStart || 0;
  const end = current.cropEnd || duration;
  const span = Math.max(end - start, 0.1);
  const progress = duration > 0 ? (currentTime - start) / span : 0;
  const lines = (current.lyrics || "").split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("["));
  const lineIndex = lines.length && duration ? Math.min(lines.length - 1, Math.floor((currentTime / duration) * lines.length)) : 0;

  return (
    <div className="sticky bottom-0 z-30 border-t border-[var(--line)] bg-[rgba(11,16,14,0.96)] px-4 py-3 backdrop-blur-md md:px-6">
      {lines.length > 0 && (
        <p className="mx-auto mb-2 max-w-6xl truncate text-center text-sm text-[var(--fg)]">
          {lines[Math.max(0, lineIndex - 1)] ? <span className="mr-3 text-[var(--muted)]">{lines[Math.max(0, lineIndex - 1)]}</span> : null}
          <span>{lines[lineIndex]}</span>
        </p>
      )}
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <WaveSeek
          url={current.url}
          progress={Math.max(0, Math.min(1, progress))}
          onSeek={(ratio) => seek(start + ratio * (duration ? Math.min(span, duration - start) : span))}
        />
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-lg" style={coverStyle(current.title)} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-display)] font-semibold">{current.title}</p>
            <p className="truncate text-xs text-[var(--muted)]">{current.subtitle || current.tags?.slice(0, 3).join(" · ")}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className={`btn-ghost !px-2 !py-1 text-xs ${shuffle ? "text-[var(--accent)]" : ""}`} onClick={toggleShuffle}>
              Shuffle
            </button>
            <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={prev}>
              Prev
            </button>
            <button type="button" className="btn-primary !px-3 !py-1.5 text-sm" onClick={toggle}>
              {playing ? "Pause" : "Play"}
            </button>
            <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={next}>
              Next
            </button>
            <button type="button" className={`btn-ghost !px-2 !py-1 text-xs ${repeat !== "off" ? "text-[var(--accent)]" : ""}`} onClick={cycleRepeat}>
              {repeat === "one" ? "Repeat 1" : "Repeat"}
            </button>
          </div>
          <p className="hidden w-24 text-right text-xs tabular-nums text-[var(--muted)] sm:block">
            {formatPlayback(currentTime)} / {formatPlayback(duration)}
          </p>
          <div className="hidden items-center gap-2 lg:flex">
            <button type="button" className="text-xs text-[var(--muted)]" onClick={() => downloadMp3(current.url, current.title)}>
              MP3
            </button>
            <button
              type="button"
              className="text-xs text-[var(--muted)]"
              onClick={() => downloadWav(current.url, current.title, current.cropStart || 0, current.cropEnd)}
            >
              WAV
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              aria-label="Volume"
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-20 accent-[var(--accent)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SongCover({ title, className = "" }: { title: string; className?: string }) {
  return <div className={`rounded-2xl ${className}`} style={coverStyle(title)} />;
}
