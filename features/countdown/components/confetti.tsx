"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/** A pure, deterministic pseudo-random in [0, 1) from a seed — stable across
 *  renders (so it never trips the purity lint, and SSR/CSR agree). */
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * A lightweight celebratory confetti rain, drawn with framer-motion (no canvas,
 * no extra dependency). Rendered only once the reveal opens. Respects reduced
 * motion by rendering nothing.
 */
export function Confetti({ colors }: { colors: string[] }) {
  const reduceMotion = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        left: rand(i + 1) * 100,
        size: 6 + rand(i + 2) * 8,
        color: colors[i % colors.length] ?? "#fff",
        delay: rand(i + 3) * 3.5,
        duration: 3 + rand(i + 4) * 2.5,
        drift: (rand(i + 5) - 0.5) * 140,
        spin: 180 + rand(i + 6) * 540,
        round: rand(i + 7) > 0.55,
      })),
    [colors],
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 1.6),
            background: p.color,
            borderRadius: p.round ? "9999px" : "2px",
          }}
          initial={{ y: "-12vh", x: 0, rotate: 0, opacity: 0 }}
          animate={{
            y: "112vh",
            x: p.drift,
            rotate: p.spin,
            opacity: [0, 1, 1, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
