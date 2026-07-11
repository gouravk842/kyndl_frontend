"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SoundConfig } from "@/features/constellation/config";
import { SkyAudio } from "@/features/constellation/lib/audio";

/**
 * React wrapper around the {@link SkyAudio} engine. Owns the single audio
 * instance, mirrors mute state for the UI, swells the pad with reading
 * progress, chimes once per newly-opened star, and plays the finale flourish.
 *
 * Browsers block audio until a user gesture, so nothing sounds until
 * `unlock()` is called from the entrance tap.
 */
export function useSkyAudio(
  config: SoundConfig,
  openedCount: number,
  total: number,
) {
  const audioRef = useRef<SkyAudio | null>(null);
  const [muted, setMutedState] = useState(config.startMuted);
  const prevOpened = useRef(0);

  // Lazily create the engine (constructor is SSR-safe; no AudioContext yet).
  if (audioRef.current == null) {
    if (config.enabled) audioRef.current = new SkyAudio();
  }

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  /** Resume the context + set initial mute — call from a user gesture. */
  const unlock = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.resume();
    audio.setMuted(config.startMuted);
  }, [config.startMuted]);

  const toggleMuted = useCallback(() => {
    const audio = audioRef.current;
    setMutedState((m) => {
      const next = !m;
      audio?.resume();
      audio?.setMuted(next);
      return next;
    });
  }, []);

  // Chime per newly-opened star; finale when the last one lands.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (openedCount > prevOpened.current) {
      audio.chime(openedCount - 1);
      if (openedCount === total && total > 0) audio.finale();
    }
    prevOpened.current = openedCount;
    audio.setIntensity(total > 0 ? openedCount / total : 0);
  }, [openedCount, total]);

  return { muted, unlock, toggleMuted };
}
