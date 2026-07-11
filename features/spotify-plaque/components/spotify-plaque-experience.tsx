"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  PLAQUE_CONFIG,
  type PlaqueConfig,
  themeFor,
} from "@/features/spotify-plaque/config";

import { BackgroundMusic } from "./background-music";
import { Envelope } from "./envelope";
import { PlaqueFrame } from "./plaque-frame";

type PlaqueExperienceProps = {
  config?: PlaqueConfig;
  /** Resolved media URLs keyed by fileId (photos + music). */
  assets?: Record<string, string>;
  /** Whether to mount the looping music (off in the side-by-side builder). */
  playMusic?: boolean;
  /** Root min-height utility — overridden per host (page vs. builder pane). */
  className?: string;
};

/**
 * The live plaque scene, staged like a product shot: a wax-sealed envelope
 * beside a frosted-glass plaque, on a soft studio backdrop. The frame cross-fades
 * the uploaded photos while the track loops; tapping the envelope unwraps the
 * private message. Self-themed from `config.theme`, so the public viewer can
 * render it with nothing but content + assets.
 */
export function SpotifyPlaqueExperience({
  config = PLAQUE_CONFIG,
  assets = {},
  playMusic = true,
  className = "min-h-dvh",
}: PlaqueExperienceProps) {
  const reduceMotion = useReducedMotion();
  const theme = themeFor(config.theme);

  // Resolve photos in order, dropping any whose asset hasn't loaded.
  const photoUrls = config.photos
    .map((p) => assets[p.fileId])
    .filter((url): url is string => Boolean(url));

  const musicUrl = config.music ? (assets[config.music.fileId] ?? null) : null;

  return (
    <div
      className={`relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-4 py-16 ${className}`}
    >
      {/* themed studio backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{ background: theme.background }}
      />
      {/* soft grain for tactility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-14 sm:flex-row sm:items-center sm:justify-center sm:gap-20">
        {/* The envelope */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="order-2 sm:order-1"
        >
          <Envelope hidden={config.hidden} theme={theme} />
        </motion.div>

        {/* The framed plaque */}
        <div className="order-1 sm:order-2">
          <PlaqueFrame config={config} photoUrls={photoUrls} theme={theme} />
        </div>
      </div>

      {/* Wordmark */}
      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-serif relative z-10 mt-14 text-center text-2xl italic sm:text-3xl"
        style={{ color: theme.dark ? "#e7ded0" : theme.ink }}
      >
        Spotify Plaque
      </motion.p>

      {playMusic && musicUrl ? <BackgroundMusic src={musicUrl} /> : null}
    </div>
  );
}
