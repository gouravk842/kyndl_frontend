"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import {
  HeartLocket,
  SparkStar,
  Stopwatch,
  WaxSeal,
} from "@/features/auth/components/keepsake-props";

const ease = [0.22, 1, 0.36, 1] as const;

/** Taped paper scraps pinned onto the journal page — the value props. */
const SCRAPS = [
  {
    title: "Keepsakes, not messages",
    tone: "#FBF1E2",
    tape: "left-6",
    rotate: "-1.4deg",
    icon: (
      <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
        <rect
          x="4"
          y="5"
          width="24"
          height="22"
          rx="2"
          fill="none"
          stroke="#8a5a3c"
          strokeWidth="2"
        />
        <rect x="9" y="10" width="14" height="9" rx="1" fill="#e7c9a8" />
        <circle cx="13" cy="14" r="1.6" fill="#8a5a3c" />
        <path
          d="M9 19 l4-4 3 3 3-3 4 4"
          fill="none"
          stroke="#8a5a3c"
          strokeWidth="1.6"
        />
        <line
          x1="9"
          y1="23"
          x2="23"
          y2="23"
          stroke="#8a5a3c"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    title: "Made in minutes",
    tone: "#FCF4E1",
    tape: "right-8",
    rotate: "1.1deg",
    icon: <Stopwatch className="size-6" />,
  },
  {
    title: "Sent with warmth",
    tone: "#FBEFEA",
    tape: "left-10",
    rotate: "-0.8deg",
    icon: (
      <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
        <path
          d="M16 27 C4 19 6 9 13 9 C16 9 16 12 16 13 C16 12 16 9 19 9 C26 9 28 19 16 27 Z"
          fill="#f2596f"
          stroke="#c22740"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
] as const;

/** A small polaroid with a warm gradient "photo" area. */
function Polaroid({
  className,
  rotate,
  from,
  to,
}: {
  className: string;
  rotate: string;
  from: string;
  to: string;
}) {
  return (
    <div
      className={`kyndl-pinned absolute w-24 rounded-[3px] bg-[#fffdf7] p-1.5 pb-5 ${className}`}
      style={{ transform: `rotate(${rotate})` }}
      aria-hidden
    >
      <div
        className="h-20 w-full rounded-[2px]"
        style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
      />
    </div>
  );
}

export function AuthBrandPanel() {
  return (
    <div className="kyndl-book-shadow relative hidden overflow-hidden rounded-[1.8rem] lg:block">
      {/* Leather cover board the page is bound into */}
      <div className="kyndl-cover-board relative h-full rounded-[1.8rem] bg-gradient-to-br from-[#6b4a3c] via-[#5a3c31] to-[#472e26] p-3">
        {/* The aged page */}
        <div className="kyndl-paper kyndl-page-gutter-left relative h-full overflow-hidden rounded-[1.2rem] px-9 py-10">
          <div
            className="kyndl-paper-grain pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
          />
          {/* stacked page-edge thickness down the outer side */}
          <div
            className="kyndl-page-edges pointer-events-none absolute inset-y-3 right-0 w-1.5 rounded-r-[1.2rem]"
            aria-hidden
          />

          {/* Wax seal at the head of the page */}
          <motion.div
            className="absolute right-8 top-7"
            initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
            aria-hidden
          >
            <WaxSeal className="size-14 drop-shadow-[0_6px_10px_rgba(58,42,37,0.4)]" />
          </motion.div>

          {/* Headline */}
          <motion.div
            className="relative max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <h2 className="font-serif text-[2.5rem] leading-[1.1] tracking-tight text-[#3A2A25]">
              Turn what you feel into something they can{" "}
              <span className="font-cursive text-[#C75B39]">hold.</span>
            </h2>
            <p className="mt-4 max-w-[22rem] text-[14.5px] leading-relaxed text-[#7A6258]">
              A scrapbook, a night sky of your moments, a jar of little notes —
              Kyndl helps you send keepsakes, not just messages.
            </p>
          </motion.div>

          {/* Taped value-prop scraps */}
          <div className="relative mt-8 space-y-3.5">
            {SCRAPS.map(({ title, tone, tape, rotate, icon }, i) => (
              <motion.div
                key={title}
                className="kyndl-pinned relative w-fit rounded-[4px] px-4 py-2.5 pr-6"
                style={{ background: tone, transform: `rotate(${rotate})` }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease, delay: 0.35 + i * 0.12 }}
              >
                {/* washi tape */}
                <span
                  className={`kyndl-tape absolute -top-2 h-4 w-12 rounded-[1px] bg-[#e8d3b0]/70 ${tape}`}
                  aria-hidden
                />
                <span className="flex items-center gap-2.5">
                  {icon}
                  <span className="font-hand text-[17px] text-[#4a382f]">
                    {title}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>

          {/* Polaroids stacked at the foot */}
          <Polaroid
            className="bottom-24 left-8"
            rotate="-7deg"
            from="#c9b8a6"
            to="#8a7563"
          />
          <Polaroid
            className="bottom-20 left-24"
            rotate="5deg"
            from="#f3c9b4"
            to="#e0917a"
          />

          {/* Heart-locket charm + spark star, clipped to the page */}
          <motion.div
            className="absolute right-10 top-40"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: [0, -6, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.6 },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
            aria-hidden
          >
            <HeartLocket className="h-28 w-20 drop-shadow-[0_8px_14px_rgba(58,42,37,0.35)]" />
            <SparkStar className="absolute -left-4 top-16 size-4" />
          </motion.div>

          {/* Leather review tag stamped at the foot */}
          <motion.div
            className="kyndl-leather-tag absolute bottom-8 right-9 flex items-center gap-2.5 rounded-lg px-4 py-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.85 }}
          >
            <span className="flex items-center gap-0.5 text-[#fbe3a1]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3 fill-current" />
              ))}
            </span>
            <span className="text-[12px] font-medium tracking-wide text-[#fdeede]">
              Loved by thoughtful gifters everywhere
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
