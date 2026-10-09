"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  STRING_FRAME_CONFIG,
  type StringFrameConfig,
  themeFor,
} from "@/features/string-frame/config";
import { cn } from "@/lib/utils";

import { BackgroundMusic } from "./background-music";
import { GiftBox } from "./gift-box";
import { StringBoard } from "./string-board";

type StringFrameExperienceProps = {
  config?: StringFrameConfig;
  /** Resolved media URLs keyed by fileId (photos + music). */
  assets?: Record<string, string>;
  /** Whether to mount the looping music (off in the side-by-side builder). */
  playMusic?: boolean;
  /** Root min-height utility — overridden per host (page vs. builder pane). */
  className?: string;
};

/**
 * The live String Frame scene: a wrapped gift box beside a chalkboard board
 * whose photos hang pinned across strings, on a warm satin surface. The track
 * loops behind it; tapping the gift box opens it to the private message.
 * Self-themed from `config.theme`, so the public viewer can render it with
 * nothing but content + assets.
 */
export function StringFrameExperience({
  config = STRING_FRAME_CONFIG,
  assets = {},
  playMusic = true,
  className = "min-h-dvh",
}: StringFrameExperienceProps) {
  const reduceMotion = useReducedMotion();
  const theme = themeFor(config.theme);

  // Resolve photos in order, dropping any whose asset hasn't loaded.
  const photoUrls = config.photos
    .map((p) => assets[p.fileId])
    .filter((url): url is string => Boolean(url));

  const musicUrl = config.music ? (assets[config.music.fileId] ?? null) : null;
  const gift = config.giftLabel.trim();

  return (
    <div
      className={cn(
        "relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-4 py-14",
        className,
      )}
    >
      {/* themed full-bleed background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{ background: theme.background }}
      />
      {/* soft grain for tactility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Gift-countdown eyebrow */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8 flex items-center gap-3"
        style={{ color: theme.ink }}
      >
        <span className="text-xs font-semibold tracking-[0.32em] uppercase opacity-80">
          Gift Countdown
        </span>
        {gift && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold"
            style={{ borderColor: `${theme.accent}55`, color: theme.accent }}
          >
            Gift {gift}
          </span>
        )}
      </motion.div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-12 sm:flex-row sm:items-center sm:justify-center sm:gap-14">
        {/* The gift box */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="order-2 sm:order-1"
        >
          <GiftBox
            hidden={config.hidden}
            label={config.giftLabel}
            theme={theme}
          />
        </motion.div>

        {/* The board */}
        <div className="order-1 sm:order-2">
          <StringBoard config={config} photoUrls={photoUrls} theme={theme} />
        </div>
      </div>

      {/* Title ribbon */}
      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-hand relative z-10 mt-12 rounded-lg px-6 py-2 text-center text-2xl sm:text-3xl"
        style={{
          background: "linear-gradient(150deg, #7c5a3a 0%, #4f371f 100%)",
          color: "#f4e8d6",
          boxShadow:
            "0 12px 22px -12px rgba(30,22,10,0.6), inset 0 1px 0 rgba(255,240,220,0.25), inset 0 -2px 5px rgba(0,0,0,0.35)",
        }}
      >
        Nature Unfolding
      </motion.p>

      {playMusic && musicUrl ? <BackgroundMusic src={musicUrl} /> : null}
    </div>
  );
}
