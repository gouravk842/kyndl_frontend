"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * A one-shot burst of hearts that erupts from the centre on "yes". Pure motion,
 * no confetti dependency. Deterministic spread (fixed seed) so it's stable, with
 * each heart given its own angle, distance, and spin.
 */

const COUNT = 22;

function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 24.17 + salt * 13.91) * 91801.13;
  return x - Math.floor(x);
}

export function HeartsBurst() {
  const hearts = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2 + seeded(i, 1) * 0.6;
        const dist = 120 + seeded(i, 2) * 220;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 60, // bias upward — hearts float up
          rotate: (seeded(i, 3) - 0.5) * 120,
          scale: 0.7 + seeded(i, 4) * 1.1,
          delay: seeded(i, 5) * 0.25,
          hue: seeded(i, 6) > 0.5 ? "#f4768e" : "#ffd166",
        };
      }),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          style={{ color: h.hue }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: h.x,
            y: h.y,
            scale: h.scale,
            rotate: h.rotate,
          }}
          transition={{
            duration: 2.2,
            delay: h.delay,
            ease: "easeOut",
          }}
        >
          ❤
        </motion.span>
      ))}
    </div>
  );
}
