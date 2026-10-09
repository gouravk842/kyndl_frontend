"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

import type { ModuleInteractionProps } from "@/features/unlocks";

import { MOOD_COLORS } from "../../types";
import type { MysteryBoxConfig } from "./index";

/** Deterministic pseudo-random in [0,1). */
function frand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Mystery-box reward — DOM/CSS shatter (single WebGL context for the city).
 */
export default function MysteryBoxInteraction({
  config,
  onClose,
}: ModuleInteractionProps<MysteryBoxConfig>) {
  const [opened, setOpened] = useState(false);
  const accent = MOOD_COLORS[config.mood];

  const fragments = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: (frand(i * 3) - 0.5) * 180,
        y: -40 - frand(i * 3 + 1) * 120,
        rot: (frand(i + 7) - 0.5) * 240,
        size: 18 + frand(i + 53) * 16,
        delay: frand(i + 11) * 0.08,
      })),
    [],
  );

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex w-full max-w-md flex-col items-center"
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex h-72 w-full items-center justify-center overflow-hidden">
          {!opened ? (
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="relative size-28 transition-transform hover:scale-105"
              aria-label="Open mystery box"
            >
              <span
                className="absolute inset-0 rounded-md"
                style={{
                  background: "#1a1730",
                  boxShadow: `0 0 24px ${accent}66`,
                }}
              />
              <span
                className="absolute top-1/2 left-0 h-3 w-full -translate-y-1/2"
                style={{ background: accent }}
              />
              <span
                className="absolute top-0 left-1/2 h-full w-3 -translate-x-1/2"
                style={{ background: accent }}
              />
            </button>
          ) : (
            <>
              {fragments.map((f) => (
                <motion.span
                  key={f.id}
                  className="absolute rounded-sm"
                  style={{
                    width: f.size,
                    height: f.size,
                    background: "#1a1730",
                    boxShadow: `0 0 8px ${accent}88`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    x: f.x,
                    y: f.y,
                    opacity: 0,
                    rotate: f.rot,
                  }}
                  transition={{
                    duration: 0.9,
                    delay: f.delay,
                    ease: "easeOut",
                  }}
                />
              ))}
              <motion.span
                className="absolute size-10 rounded-full"
                style={{
                  background: accent,
                  boxShadow: `0 0 28px ${accent}`,
                }}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: -20 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 220 }}
              />
            </>
          )}
        </div>

        {!opened ? (
          <p className="mt-1 text-center text-sm text-white/70">
            {config.teaser ?? "Tap the box to open it"}
          </p>
        ) : (
          <motion.div
            className="mt-1 w-full rounded-3xl border border-white/10 bg-[#15122a] p-6 text-center text-white shadow-2xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <h2 className="font-display text-2xl leading-snug">
              {config.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {config.body}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm text-white/85 transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Keep exploring
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
