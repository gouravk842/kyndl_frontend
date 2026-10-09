"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Sparkles, Star } from "lucide-react";

const ORBS = [
  { label: "Maya", x: "74%", y: "24%", fill: "#FF7A59" },
  { label: "Us", x: "20%", y: "62%", fill: "#F0A13D" },
  { label: "Home", x: "78%", y: "72%", fill: "#F2596F" },
] as const;

const BLOOMS = [
  { icon: BookOpen, label: "Scrapbook" },
  { icon: Sparkles, label: "Memory jar" },
  { icon: Star, label: "Night sky" },
] as const;

export function AuthBrandPanel() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="kyndl-card-soft relative hidden min-h-0 overflow-hidden rounded-[1.75rem] border border-[#F4DDD0] bg-white lg:block">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 78% 18%, rgba(255,160,120,0.36) 0%, transparent 62%), radial-gradient(ellipse 55% 45% at 12% 88%, rgba(242,89,111,0.18) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative flex h-full min-h-0 flex-col px-8 py-7 xl:px-9 xl:py-8">
        <p className="text-[11px] font-medium tracking-[0.2em] text-[#C75B39] uppercase">
          The Memory Bank
        </p>
        <h2 className="mt-2 font-display text-[1.85rem] leading-[1.1] tracking-tight text-[#3A2A25] xl:text-[2.15rem]">
          Keep once.
          <br />
          <span className="kyndl-text-warm">Gift a hundred ways.</span>
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#7A6258]">
          Drop the days into one place. Grow them into a scrapbook, a jar, a
          night sky — or start any keepsake on its own.
        </p>

        <div className="relative mx-auto mt-5 min-h-0 w-full max-w-[17rem] flex-1 xl:max-w-[19rem]">
          <svg
            className="absolute inset-0 size-full text-[#FF7A59]/30"
            aria-hidden
          >
            <ellipse
              cx="50%"
              cy="50%"
              rx="34%"
              ry="26%"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <ellipse
              cx="50%"
              cy="50%"
              rx="46%"
              ry="38%"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="3 9"
              opacity="0.75"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#3A2A25] text-sm font-medium text-[#FFF7F1] shadow-[0_12px_32px_rgba(58,42,37,0.28)]">
              You
            </span>
          </div>
          {ORBS.map((orb, i) => (
            <motion.span
              key={orb.label}
              className="absolute z-10 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-medium text-white shadow-[0_10px_24px_rgba(58,42,37,0.2)]"
              style={{ left: orb.x, top: orb.y, background: orb.fill }}
              animate={
                reduceMotion ? undefined : { y: [0, i % 2 === 0 ? -6 : 6, 0] }
              }
              transition={{
                duration: 5.2 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.25,
              }}
            >
              {orb.label}
            </motion.span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {BLOOMS.map((bloom) => (
            <span
              key={bloom.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#F2DACE] bg-[#FFF7F1] px-2.5 py-1 text-[11px] font-medium text-[#C75B39]"
            >
              <bloom.icon className="size-3" />
              {bloom.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
