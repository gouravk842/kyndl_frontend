"use client";

import { motion } from "framer-motion";

/**
 * A hand-drawn "scratched out" scribble that animates across a grid cell once
 * the dice land on it. Three quick strokes, drawn left-to-right; with reduced
 * motion they simply appear.
 */
const STROKES = [
  "M8,30 C30,18 70,42 92,26",
  "M10,60 C34,72 66,48 90,62",
  "M12,86 C32,74 70,96 90,80",
];

export function Scratch({
  color = "#c81d4e",
  animate = true,
}: {
  color?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      {STROKES.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{ duration: 0.28, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}
