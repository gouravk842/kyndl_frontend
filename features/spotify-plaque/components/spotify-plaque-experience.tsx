"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  PLAQUE_CONFIG,
  type PlaqueConfig,
  themeFor,
} from "@/features/spotify-plaque/config";
import { cn } from "@/lib/utils";

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
 * Live plaque scene: a sealed glass whisper beside a classic acrylic Spotify
 * plaque. Cover art, message, track, transport, and scan code live on the slab.
 */
export function SpotifyPlaqueExperience({
  config = PLAQUE_CONFIG,
  assets = {},
  playMusic = true,
  className = "min-h-dvh",
}: PlaqueExperienceProps) {
  const reduceMotion = useReducedMotion();
  const theme = themeFor(config.theme);

  const photoUrls = config.photos
    .map((p) => assets[p.fileId])
    .filter((url): url is string => Boolean(url));

  const musicUrl = config.music ? (assets[config.music.fileId] ?? null) : null;

  return (
    <div
      className={cn(
        "relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-4 py-16",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{ background: theme.background }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-14 sm:flex-row sm:items-center sm:justify-center sm:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="order-2 sm:order-1"
        >
          <Envelope hidden={config.hidden} theme={theme} />
        </motion.div>

        <div className="order-1 sm:order-2">
          {/* subtle wood-base cue under the acrylic slab */}
          <div className="relative">
            <PlaqueFrame
              config={config}
              photoUrls={photoUrls}
              theme={theme}
              musicUrl={musicUrl}
              playMusic={playMusic}
            />
            <div
              aria-hidden
              className="mx-auto mt-0 h-2.5 w-[72%] rounded-b-sm"
              style={{
                background: theme.dark
                  ? "linear-gradient(180deg, #3a3228 0%, #1e1914 100%)"
                  : "linear-gradient(180deg, #c4a882 0%, #8a6e4e 100%)",
                boxShadow: "0 10px 22px -8px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        </div>
      </div>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-12 text-center text-sm tracking-[0.28em] uppercase"
        style={{
          color: theme.dark ? "rgba(231,222,208,0.7)" : theme.inkSoft,
        }}
      >
        Spotify Plaque
      </motion.p>
    </div>
  );
}
