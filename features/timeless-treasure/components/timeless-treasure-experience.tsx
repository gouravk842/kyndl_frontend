"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import {
  type ReelFrame,
  themeFor,
  TIMELESS_TREASURE_CONFIG,
  type TimelessTreasureConfig,
} from "@/features/timeless-treasure/config";

import { BackgroundMusic } from "./background-music";
import { KeepsakeLetter } from "./keepsake-letter";
import { KeepsakeTag } from "./keepsake-tag";
import { TreasureScene } from "./treasure-scene";

type TimelessTreasureExperienceProps = {
  config?: TimelessTreasureConfig;
  /** Resolved media URLs keyed by fileId (frames + music). */
  assets?: Record<string, string>;
  /** Whether to mount the looping music (off in the side-by-side builder). */
  playMusic?: boolean;
  /** Root min-height utility — overridden per host (page vs. builder pane). */
  className?: string;
  /** Start already opened (used by the builder so edits are always visible). */
  startOpen?: boolean;
};

/**
 * The live Timeless Treasure scene: a keepsake box the recipient opens once.
 * Tapping it lifts the lid to the top and extrudes a continuous accordion ribbon
 * of cardstock photo panels up out of the box — the centre panel locking flat as
 * the hero — then a folded letter and the engraved keepsake tag below. Self-
 * themed from `config.theme`, so the public viewer renders it with nothing but
 * content + assets.
 */
export function TimelessTreasureExperience({
  config = TIMELESS_TREASURE_CONFIG,
  assets = {},
  playMusic = true,
  className = "min-h-dvh",
  startOpen = false,
}: TimelessTreasureExperienceProps) {
  const reduceMotion = useReducedMotion();
  const theme = themeFor(config.theme);
  const [open, setOpen] = useState(startOpen);

  const urlFor = (frame: ReelFrame): string | null =>
    frame.fileId ? (assets[frame.fileId] ?? null) : null;

  const musicUrl = config.music ? (assets[config.music.fileId] ?? null) : null;
  const recipient = config.recipientName.trim();

  return (
    <div
      className={`relative isolate flex w-full flex-col items-center overflow-hidden ${className}`}
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

      {/* Box + fixed reel stage — always centred; the stage never grows the page. */}
      <div className="flex w-full max-w-2xl grow flex-col items-center justify-center px-4 py-12">
        {!open && recipient && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
            style={{ color: theme.ink }}
          >
            <span className="block text-xs font-semibold tracking-[0.34em] uppercase opacity-70">
              A treasure for
            </span>
            <span className="font-display mt-1 block text-3xl font-semibold sm:text-4xl">
              {recipient}
            </span>
          </motion.p>
        )}

        <TreasureScene
          open={open}
          onOpen={() => setOpen(true)}
          theme={theme}
          tag={config.tag}
          senderName={config.senderName}
          recipientName={config.recipientName}
          frames={config.frames}
          urlFor={urlFor}
        />
      </div>

      {/* The letter + tag, below the extended ribbon. */}
      {open && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex w-full max-w-2xl flex-col items-center gap-14 px-4 pb-28"
        >
          <KeepsakeLetter letter={config.letter} theme={theme} />

          <div className="w-full max-w-md">
            <KeepsakeTag
              tag={config.tag}
              senderName={config.senderName}
              recipientName={config.recipientName}
              theme={theme}
            />
          </div>
        </motion.div>
      )}

      {open && playMusic && musicUrl ? <BackgroundMusic src={musicUrl} /> : null}
    </div>
  );
}
