"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  Music2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PlaqueConfig, PlaqueTheme } from "../config";
import { ScanCode } from "./scan-code";

/** How long each cover frame holds before advancing. */
const FRAME_MS = 4200;

/**
 * Classic acrylic Spotify plaque: square cover, personal message + heart,
 * track meta, scrubber, transport controls, and a monochrome scan code.
 */
export function PlaqueFrame({
  config,
  photoUrls,
  theme,
  musicUrl = null,
  playMusic = false,
}: {
  config: PlaqueConfig;
  photoUrls: string[];
  theme: PlaqueTheme;
  musicUrl?: string | null;
  playMusic?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const count = photoUrls.length;

  useEffect(() => {
    if (count <= 1 || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), FRAME_MS);
    return () => clearInterval(id);
  }, [count, reduceMotion]);

  const current = count > 0 ? photoUrls[index % count] : null;
  const songLabel = config.songLabel.trim() || "Our song";
  const message = config.title.trim() || "For you";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[300px] overflow-hidden rounded-[4px] px-5 pb-6 pt-5 sm:max-w-[320px] sm:px-6 sm:pb-7 sm:pt-6"
      style={{
        background: theme.glassTint,
        boxShadow: `
          0 36px 80px -28px rgba(0,0,0,0.5),
          0 12px 28px -16px rgba(0,0,0,0.28),
          inset 0 1px 0 rgba(255,255,255,0.7),
          inset 0 0 0 1px ${theme.glassBorder}
        `,
      }}
    >
      {/* acrylic edge highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.55) 0%, transparent 32%, transparent 70%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col">
        {/* ── Cover art ──────────────────────────────────────────── */}
        <div
          className="relative aspect-square w-full overflow-hidden"
          style={{
            boxShadow: `inset 0 0 0 1px ${
              theme.dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)"
            }`,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {current ? (
              <motion.img
                key={`${current}-${index}`}
                src={current}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }
                }
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : (
              <div
                key="placeholder"
                className="absolute inset-0 grid place-items-center"
                style={{
                  background: theme.well,
                  color: theme.inkSoft,
                }}
              >
                <div className="flex flex-col items-center gap-2 px-6 text-center">
                  <Music2 className="size-7 opacity-45" />
                  <span className="text-[11px] tracking-wide">
                    Your photo goes here
                  </span>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Personal message + liked heart ─────────────────────── */}
        <div className="relative mt-5 flex items-center justify-center px-1">
          <p
            className="max-w-[85%] text-center text-[15px] leading-snug font-medium tracking-tight"
            style={{ color: theme.ink }}
          >
            {message}
          </p>
          <Heart
            aria-hidden
            className="absolute right-0 size-[15px] shrink-0 fill-[#e91429] text-[#e91429]"
          />
        </div>

        {/* ── Track meta ─────────────────────────────────────────── */}
        <div className="mt-5 min-w-0">
          <p
            className="truncate text-[22px] leading-tight font-bold tracking-tight"
            style={{ color: theme.ink }}
          >
            {songLabel}
          </p>
          <p
            className="mt-1 truncate text-[14px] leading-snug"
            style={{ color: theme.inkSoft }}
          >
            {config.artist.trim() || "Artist"}
          </p>
          {config.date.trim() ? (
            <p
              className="mt-1.5 text-[10px] tracking-[0.18em] uppercase"
              style={{ color: theme.inkSoft, opacity: 0.75 }}
            >
              {config.date}
            </p>
          ) : null}
        </div>

        {/* ── Transport ──────────────────────────────────────────── */}
        <PlayerTransport
          theme={theme}
          songLabel={songLabel}
          musicUrl={musicUrl}
          playMusic={playMusic}
          onPrev={() => count > 1 && setIndex((i) => (i - 1 + count) % count)}
          onNext={() => count > 1 && setIndex((i) => (i + 1) % count)}
        />

        {/* ── Spotify code ───────────────────────────────────────── */}
        <div className="mt-7 flex justify-center">
          <ScanCode
            seed={`${songLabel}|${config.artist}`}
            barColor={theme.scanBar}
            glyphColor={theme.scanBar}
            size="plaque"
          />
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayerTransport({
  theme,
  songLabel,
  musicUrl,
  playMusic,
  onPrev,
  onNext,
}: {
  theme: PlaqueTheme;
  songLabel: string;
  musicUrl: string | null;
  playMusic: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const canPlay = Boolean(playMusic && musicUrl);
  const progress = duration > 0 ? Math.min(1, current / duration) : 0.48;

  useEffect(() => {
    if (!canPlay) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [canPlay, musicUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [musicUrl]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;
    if (audio.paused) {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const seek = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  // Decorative mid-track times when no audio is mounted (builder / empty draft).
  const displayCurrent = canPlay && duration > 0 ? current : 137;
  const displayDuration = canPlay && duration > 0 ? duration : 264;

  return (
    <div className="mt-5">
      {canPlay ? (
        <audio ref={audioRef} src={musicUrl!} loop preload="auto" />
      ) : null}

      {/* scrubber */}
      <div className="px-0.5">
        <button
          type="button"
          aria-label={`Seek in ${songLabel}`}
          disabled={!canPlay || duration <= 0}
          className="relative block h-3 w-full cursor-pointer disabled:cursor-default"
          onClick={(e) => {
            if (!canPlay || duration <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width);
          }}
        >
          <span
            aria-hidden
            className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 rounded-full"
            style={{
              background: theme.dark
                ? "rgba(255,255,255,0.22)"
                : "rgba(0,0,0,0.18)",
            }}
          />
          <span
            aria-hidden
            className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: theme.ink,
            }}
          />
          <span
            aria-hidden
            className="absolute top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${progress * 100}%`,
              background: theme.ink,
              boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          />
        </button>
        <div
          className="mt-1 flex justify-between text-[11px] tabular-nums"
          style={{ color: theme.inkSoft }}
        >
          <span>{formatTime(displayCurrent)}</span>
          <span>{formatTime(displayDuration)}</span>
        </div>
      </div>

      {/* controls */}
      <div
        className="mt-3 flex items-center justify-between px-1"
        style={{ color: theme.ink }}
      >
        <span className="grid size-8 place-items-center opacity-80" aria-hidden>
          <Shuffle className="size-[18px]" strokeWidth={1.75} />
        </span>
        <button
          type="button"
          aria-label="Previous"
          onClick={onPrev}
          className="grid size-9 place-items-center transition-transform active:scale-95"
        >
          <SkipBack className="size-6 fill-current" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={canPlay ? toggle : undefined}
          className="grid size-[54px] place-items-center rounded-full transition-transform active:scale-95"
          style={{
            background: theme.ink,
            color: theme.dark ? "#121212" : "#ffffff",
          }}
        >
          {playing ? (
            <Pause className="size-6 fill-current" />
          ) : (
            <Play className="size-6 fill-current translate-x-[1px]" />
          )}
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={onNext}
          className="grid size-9 place-items-center transition-transform active:scale-95"
        >
          <SkipForward className="size-6 fill-current" strokeWidth={1.5} />
        </button>
        <span className="grid size-8 place-items-center opacity-80" aria-hidden>
          <Repeat className="size-[18px]" strokeWidth={1.75} />
        </span>
      </div>
    </div>
  );
}
