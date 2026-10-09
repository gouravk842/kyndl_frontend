"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import type { Occasion } from "../config";

/** Warm boudoir stage — candlelight, glass glare, soft vignette. */
export const MIRROR_STAGE_BG =
  "radial-gradient(ellipse 90% 70% at 50% 18%, #fff9f4 0%, #f8e6d8 38%, #edd5c4 72%, #e2c4b0 100%)";

/**
 * Shared atmosphere for Mirror Match surfaces. Decorative only — children sit
 * in a relative stacking context above the lights and grain.
 */
export function MirrorStage({
  children,
  className = "",
  occasion = "none",
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  occasion?: Occasion;
  /** Tighter padding for builder preview panes. */
  compact?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={[
        "relative isolate overflow-hidden",
        compact ? "min-h-0" : "min-h-[inherit]",
        className,
      ].join(" ")}
      style={{ background: MIRROR_STAGE_BG }}
    >
      {/* Warm key light */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[36rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,210,0.95) 0%, rgba(212,163,115,0.25) 45%, transparent 70%)",
        }}
      />
      {/* Soft rose wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[22rem] w-[22rem] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(177,18,38,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10%] left-[-8%] h-[18rem] w-[18rem] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,163,115,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Drifting glass reflections */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-[12%] top-[18%] h-40 w-16 -rotate-12 rounded-full bg-white/25 blur-2xl"
            animate={{ y: [0, 18, 0], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute right-[14%] top-[32%] h-28 w-12 rotate-12 rounded-full bg-[#D4A373]/30 blur-2xl"
            animate={{ y: [0, -22, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
          />
        </>
      )}

      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 40%, rgba(90,50,35,0.18) 100%)",
        }}
      />

      {occasion === "girlfriend-day" && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 sm:top-6">
          <GirlfriendDayRibbon />
        </div>
      )}

      <div
        className={[
          "relative z-[1] flex w-full flex-col items-center",
          compact ? "px-3 py-4" : "px-4 py-10 sm:px-6 sm:py-14",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function GirlfriendDayRibbon() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-full border border-[#B11226]/25 bg-[#B11226]/08 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(177,18,38,0.12)] backdrop-blur-sm"
    >
      <span className="size-1.5 rounded-full bg-[#B11226]" />
      <span className="font-cursive text-sm text-[#8E1020]">
        Girlfriend Day · Aug 1
      </span>
    </motion.div>
  );
}

/**
 * Ornate oval looking-glass frame. Children sit in the glass pane.
 */
export function LookingGlass({
  children,
  className = "",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg"
      ? "h-[28rem] w-[20rem] sm:h-[30rem] sm:w-[22rem]"
      : size === "sm"
        ? "h-[18rem] w-[13rem]"
        : "h-[24rem] w-[17rem] sm:h-[26rem] sm:w-[18.5rem]";

  return (
    <div className={["relative mx-auto", dims, className].join(" ")}>
      {/* Soft floor shadow */}
      <div
        aria-hidden
        className="absolute -bottom-6 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-[100%] bg-[#5a3223]/25 blur-xl"
      />
      {/* Outer gilt rim */}
      <div
        className="absolute inset-0 rounded-[50%] p-[10px] shadow-[0_24px_60px_rgba(90,50,35,0.28)]"
        style={{
          background:
            "conic-gradient(from 210deg, #c9a06a, #f0d9b0, #a67c4a, #e8c892, #8a6238, #f0d9b0, #c9a06a)",
        }}
      >
        {/* Inner dark bevel */}
        <div className="h-full w-full rounded-[50%] bg-[#3d2618] p-[5px]">
          {/* Glass */}
          <div className="relative h-full w-full overflow-hidden rounded-[50%] bg-gradient-to-b from-[#fffaf5] via-[#f7ebe1] to-[#edd9c8]">
            {/* Specular sweep */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/3 skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: ["-20%", "220%"] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 2.5,
              }}
            />
            {/* Top highlight arc */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-[18%] top-[8%] h-[28%] rounded-[50%] bg-gradient-to-b from-white/55 to-transparent"
            />
            <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center px-7 py-10 text-center">
              {children}
            </div>
          </div>
        </div>
      </div>
      {/* Decorative crest at top */}
      <div
        aria-hidden
        className="absolute -top-3 left-1/2 z-10 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-[#f0d9b0] shadow-md"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #f5e0b8, #b8860b 70%)",
        }}
      >
        <span className="font-cursive text-sm leading-none text-[#5a3223]">
          ♡
        </span>
      </div>
    </div>
  );
}

/** Progress drawn as light filling around an oval track. */
export function MirrorProgress({
  index,
  total,
}: {
  index: number;
  total: number;
}) {
  const pct = total <= 0 ? 0 : Math.min(index / total, 1);
  const r = 46;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  return (
    <div className="relative mx-auto size-14">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <ellipse
          cx="50"
          cy="50"
          rx={r}
          ry={r}
          fill="none"
          stroke="rgba(90,50,35,0.12)"
          strokeWidth="4"
        />
        <motion.ellipse
          cx="50"
          cy="50"
          rx={r}
          ry={r}
          fill="none"
          stroke="#B11226"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          initial={false}
          animate={{ strokeDasharray: `${dash} ${c}` }}
          transition={{ duration: 0.35 }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-hand text-sm text-[#5a3223]/70">
        {Math.min(index + 1, total)}/{total}
      </span>
    </div>
  );
}
