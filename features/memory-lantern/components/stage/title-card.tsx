"use client";

import { motion } from "framer-motion";

/**
 * The line the evening opens on, once the curtains have parted and the light
 * has found the empty podium. It reads like a title card, then leaves before
 * the first memory is lowered.
 */
export function TitleCard({
  recipient,
  title,
  subtitle,
  reducedMotion,
}: {
  recipient: string;
  title: string;
  subtitle: string;
  reducedMotion: boolean;
}) {
  const name = recipient.trim();
  const heading = title.trim();
  const line = subtitle.trim();
  const d = (delay: number) =>
    reducedMotion
      ? { duration: 0.15 }
      : { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-8 pb-[22%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.45 }}
    >
      <div className="max-w-md text-center">
        {name ? (
          <motion.p
            className="font-hand text-2xl text-[#f0d7a8] [text-shadow:0_2px_16px_rgba(0,0,0,0.8)]"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={d(0.15)}
          >
            for {name}
          </motion.p>
        ) : null}
        {heading ? (
          <motion.h2
            className="mt-2 font-serif text-[2rem] leading-tight tracking-wide text-[#f8f1e4] sm:text-5xl [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={d(0.4)}
          >
            {heading}
          </motion.h2>
        ) : null}
        <motion.span
          aria-hidden
          className="mx-auto mt-4 block h-px w-28 origin-center bg-gradient-to-r from-transparent via-[#e8c872] to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={d(0.85)}
        />
        {line ? (
          <motion.p
            className="mt-3 font-serif text-sm tracking-[0.18em] text-[#e7d8c4] uppercase [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={d(1.15)}
          >
            {line}
          </motion.p>
        ) : null}
      </div>
    </motion.div>
  );
}
