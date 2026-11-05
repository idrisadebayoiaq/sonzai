"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type PlayableSong = {
  id: string;
  title: string;
  url: string;
  subtitle?: string;
  tags?: string[];
};

type PlayerContextValue = {
  queue: PlayableSong[];
  current: PlayableSong | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: PlayableSong, queue?: PlayableSong[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<PlayableSong[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);
  const queueRef = useRef(queue);
  const indexRef = useRef(index);
  const loadedUrl = useRef("");
  queueRef.current = queue;
  indexRef.current = index;

  const current = queue[index] ?? null;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      const i = indexRef.current;
      if (i + 1 < queueRef.current.length) setIndex(i + 1);
      else setPlaying(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const song = queue[index];
    if (!audio || !song) return;
    if (loadedUrl.current !== song.url) {
      loadedUrl.current = song.url;
      audio.src = song.url;
      setCurrentTime(0);
      setDuration(0);
    }
    audio.volume = volume;
    audio.play().catch(() => setPlaying(false));
  }, [queue, index]);

  const playSong = useCallback((song: PlayableSong, nextQueue?: PlayableSong[]) => {
    const list = nextQueue && nextQueue.length ? nextQueue : [song];
    const found = list.findIndex((item) => item.id === song.id);
    setQueue(list);
    setIndex(found >= 0 ? found : 0);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [current]);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(queueRef.current.length - 1, 0)));
  }, []);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    setVolumeState(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  }, []);

  const value = useMemo(
    () => ({ queue, current, playing, currentTime, duration, volume, playSong, toggle, next, prev, seek, setVolume }),
    [queue, current, playing, currentTime, duration, volume, playSong, toggle, next, prev, seek, setVolume],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function formatPlayback(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
