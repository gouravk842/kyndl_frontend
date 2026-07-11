"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

import { themeTokens } from "../lib/themes";
import type { MomentTheme } from "../types";

/**
 * The breathing, full-screen backdrop every phase sits on. A theme gradient plus
 * a field of slowly drifting particles (stars for midnight, petals/embers for
 * blush). Positions are derived from a fixed seed so server and client render
 * the same field — no hydration flicker, no `Math.random` at render.
 */

const COUNT = 28;

// Deterministic pseudo-random in [0,1) from an integer — stable across SSR.
function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function AmbientBg({
  theme,
  className,
}: {
  theme: MomentTheme;
  className?: string;
}) {
  const t = themeTokens(theme);
  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        left: seeded(i, 1) * 100,
        top: seeded(i, 2) * 100,
        size: 1.5 + seeded(i, 3) * 3.5,
        delay: seeded(i, 4) * 6,
        duration: 5 + seeded(i, 5) * 7,
        drift: (seeded(i, 6) - 0.5) * 40,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        t.background,
        className,
      )}
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: `rgb(${t.particle})`,
            boxShadow: `0 0 ${p.size * 3}px rgb(${t.particle} / 0.8)`,
          }}
          initial={{ opacity: 0.2, y: 0, x: 0 }}
          animate={{
            opacity: [0.15, 0.9, 0.15],
            y: [0, -28, 0],
            x: [0, p.drift, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
