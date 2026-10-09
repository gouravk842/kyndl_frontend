"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import type { Occasion } from "../config";

export const DAY_STAGE_BG =
  "radial-gradient(ellipse 95% 75% at 50% 12%, #fff9f2 0%, #f6e6d6 40%, #e8d0bc 78%, #d9bda8 100%)";

/**
 * Candlelit parchment stage for 24 Reasons — grain, warm lights, soft vignette.
 */
export function DayStage({
  children,
  occasion = "none",
  className = "",
}: {
  children: ReactNode;
  occasion?: Occasion;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className={["relative isolate overflow-hidden", className].join(" ")}
      style={{ background: DAY_STAGE_BG }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,210,0.95) 0%, rgba(212,163,115,0.28) 48%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-[-8%] h-[22rem] w-[22rem] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(177,18,38,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-12%] left-[-6%] h-[18rem] w-[18rem] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,163,115,0.4) 0%, transparent 70%)",
        }}
      />

      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-[10%] top-[22%] h-24 w-10 -rotate-12 rounded-full bg-white/30 blur-2xl"
            animate={{ y: [0, 16, 0], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute right-[12%] top-[40%] h-20 w-8 rotate-12 rounded-full bg-[#D4A373]/35 blur-2xl"
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.4,
            }}
          />
        </>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 42%, transparent 35%, rgba(90,50,35,0.2) 100%)",
        }}
      />

      {occasion === "girlfriend-day" && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 sm:top-6">
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
        </div>
      )}

      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
