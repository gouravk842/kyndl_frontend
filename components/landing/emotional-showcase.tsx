"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

// Tiny deterministic starfield for the constellation keepsake — no Math.random
// so server and client render identically.
const stars = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 8) % 92}%`,
  top: `${(i * 53 + 11) % 80}%`,
  size: 1 + (i % 3),
  delay: (i % 5) * 0.4,
}));

export function EmotionalShowcase() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden lg:max-w-none lg:overflow-visible">
      {/* warm halo */}
      <div
        className="absolute inset-4 rounded-[3rem] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(255,160,120,0.55) 0%, rgba(242,89,111,0.28) 45%, transparent 72%)",
        }}
        aria-hidden
      />

      {/* ── Scrapbook page (the anchor keepsake) ───────────────────── */}
      <motion.div
        className="kyndl-card-soft absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-[#F0DAC9] bg-[#FFFDF6] p-5 shadow-[0_30px_70px_-30px_rgba(58,42,37,0.5)]"
        initial={{ rotate: -4 }}
        animate={{ y: [0, -10, 0], rotate: [-4, -3, -4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="kyndl-tape absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rounded-[3px] bg-white/40" />
        {/* polaroid */}
        <div className="mx-auto w-[82%] rounded-[6px] bg-white p-2 pb-7 shadow-[0_8px_20px_-12px_rgba(58,42,37,0.5)]">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[3px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/scrapbook.png"
              alt=""
              className="size-full object-cover"
              draggable={false}
            />
          </div>
        </div>
        <p className="mt-3 text-center font-hand text-2xl leading-tight text-[#5b4138]">
          the day everything
          <br />
          felt easy ♡
        </p>
      </motion.div>

      {/* ── Constellation keepsake (cool contrast, top-right) ───────── */}
      <motion.div
        className="absolute top-4 right-1 w-[min(10rem,38%)] overflow-hidden rounded-2xl border border-white/10 p-3 shadow-[0_24px_50px_-22px_rgba(20,16,40,0.7)] sm:right-0 sm:w-40 sm:p-4 lg:-right-4"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, #2a2350 0%, #161033 60%, #0d0a22 100%)",
        }}
        animate={{ y: [0, -12, 0], rotate: [3, 5, 3] }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      >
        {stars.map((s) => (
          <motion.span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: s.delay,
            }}
          />
        ))}
        <p className="relative font-serif text-sm italic text-[#dcd6ff]">
          us, in stars
        </p>
        <p className="relative mt-1 text-[10px] tracking-wide text-[#9b93d6]">
          tap a moment to open it
        </p>
      </motion.div>

      {/* ── Memory-jar note (warm, bottom-left) ────────────────────── */}
      <motion.div
        className="kyndl-card-soft absolute bottom-6 left-1 w-[min(11rem,42%)] rounded-2xl border border-[#F0DAC9] bg-white/95 p-3 sm:left-0 sm:w-44 sm:p-4 lg:-left-5"
        animate={{ y: [0, 11, 0], rotate: [-2, -4, -2] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.9,
        }}
      >
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#C75B39]">
          <Sparkles className="size-3" /> Memory jar
        </p>
        <p className="mt-1.5 font-hand text-xl leading-snug text-[#3A2A25]">
          &ldquo;still my favorite person.&rdquo;
        </p>
      </motion.div>

      {/* heartbeat accent */}
      <motion.div
        className="kyndl-glow-warm absolute right-6 bottom-2 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7A59] to-[#F2596F]"
        animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="size-5 fill-white text-white" aria-hidden />
      </motion.div>
    </div>
  );
}
