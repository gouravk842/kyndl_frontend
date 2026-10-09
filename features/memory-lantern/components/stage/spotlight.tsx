"use client";

import { motion } from "framer-motion";

import type { StagePhase } from "../../hooks/use-stage-show";
import { DecoWall } from "./deco-wall";
import { withAlpha } from "./tint";

const SPECKS = [
  { left: "18%", top: "28%", delay: 0 },
  { left: "30%", top: "62%", delay: 1.1 },
  { left: "46%", top: "22%", delay: 0.6 },
  { left: "62%", top: "34%", delay: 1.8 },
  { left: "74%", top: "58%", delay: 0.4 },
  { left: "84%", top: "26%", delay: 1.4 },
];

const ORBS = [
  {
    left: "8%",
    top: "22%",
    size: 220,
    color: "rgba(214, 150, 150, 0.16)",
    delay: 0,
  },
  {
    left: "72%",
    top: "14%",
    size: 180,
    color: "rgba(168, 120, 186, 0.14)",
    delay: 1.2,
  },
  {
    left: "64%",
    top: "68%",
    size: 240,
    color: "rgba(196, 150, 96, 0.12)",
    delay: 0.5,
  },
  {
    left: "16%",
    top: "72%",
    size: 160,
    color: "rgba(140, 70, 90, 0.14)",
    delay: 1.8,
  },
];

/**
 * A quiet evening room: warm plum, soft blooms of light, and a slow gold
 * dust. The wash still takes the memory's colour.
 */
export function Spotlight({
  phase,
  color,
  intensity,
  flare,
  reducedMotion,
}: {
  phase: StagePhase;
  color: string;
  intensity: number;
  flare: boolean;
  reducedMotion: boolean;
}) {
  const parted = phase !== "closed";
  const blackout = phase === "blackout";
  const searching = phase === "search" && !reducedMotion;
  const wide = phase === "finale" || phase === "dedication";
  const alive = (phase === "onstage" || phase === "finale") && !reducedMotion;
  const wash = 0.42 * intensity * (flare ? 1.25 : 1);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#160910",
          backgroundImage: `
            radial-gradient(ellipse 62% 48% at 50% 36%, rgba(92, 36, 58, 0.42), transparent 70%),
            radial-gradient(ellipse 40% 32% at 18% 78%, rgba(176, 112, 72, 0.16), transparent 72%),
            radial-gradient(ellipse 36% 30% at 84% 18%, rgba(96, 52, 88, 0.2), transparent 74%),
            radial-gradient(ellipse 90% 55% at 50% 108%, rgba(48, 16, 24, 0.55), transparent 62%)
          `,
        }}
      />
      <div className="absolute inset-0 opacity-90">
        <DecoWall />
      </div>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: parted ? 1 : 0.2 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.7 }}
        style={{
          background: `radial-gradient(ellipse 80% 62% at 50% 58%, ${withAlpha(color, wash)} 0%, transparent 70%)`,
        }}
      />
      <motion.div
        className="absolute top-[4%] left-0 right-0 mx-auto h-[78%] w-[min(70%,520px)]"
        initial={false}
        animate={{
          opacity: !parted ? 0 : blackout ? [1, 0.12, 0.9] : 1,
          x: searching ? ["-14vw", "12vw", "0vw"] : "0vw",
          scale: wide ? 1.12 : flare ? 1.06 : 1,
        }}
        transition={
          searching
            ? { duration: 2.1, ease: "easeInOut", times: [0, 0.55, 1] }
            : { duration: reducedMotion ? 0.01 : blackout ? 0.7 : 0.55 }
        }
        style={{
          background: `radial-gradient(ellipse at 50% 38%, rgba(255, 246, 220, ${flare ? 0.62 : 0.42}) 0%, ${withAlpha(color, 0.4)} 24%, transparent 64%)`,
        }}
      />
      {ORBS.map((orb) => (
        <motion.span
          key={`${orb.left}-${orb.top}`}
          className="absolute rounded-full blur-2xl"
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            background: orb.color,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.7 }
              : { y: [0, -18, 0], x: [0, 10, 0], opacity: [0.55, 0.9, 0.55] }
          }
          transition={{
            duration: 11,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      {alive
        ? SPECKS.map((speck) => (
            <motion.span
              key={`${speck.left}-${speck.top}`}
              className="absolute size-1 rounded-full bg-[#f3d48a]"
              style={{ left: speck.left, top: speck.top }}
              animate={{ y: [0, -10, 0], opacity: [0.12, 0.55, 0.12] }}
              transition={{
                duration: 5.4,
                repeat: Infinity,
                delay: speck.delay,
                ease: "easeInOut",
              }}
            />
          ))
        : null}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 46%, transparent 28%, rgba(12, 4, 10, 0.55) 100%)",
        }}
      />
    </div>
  );
}
