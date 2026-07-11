"use client";

import { motion, useReducedMotion } from "framer-motion";

type ConstellationEntranceProps = {
  recipientName: string;
  onBegin: () => void;
};

/**
 * The one-time ceremony gate. Before the sky assembles, she sees only her name
 * and an invitation to open it — a held breath. The tap does triple duty: it
 * starts the dramatic entrance, unlocks audio, and (on iOS) requests the
 * device-tilt permission, all from the one gesture the browser requires.
 */
export function ConstellationEntrance({
  recipientName,
  onBegin,
}: ConstellationEntranceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onBegin}
      aria-label={`Open your sky, ${recipientName}`}
      className="absolute inset-0 z-[70] flex cursor-pointer flex-col items-center justify-center px-6 text-center outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      transition={{ duration: 1.4 }}
    >
      <motion.p
        className="font-serif mb-3 text-sm tracking-[0.3em] text-[#9a96b8] uppercase"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        For {recipientName}
      </motion.p>

      <motion.h1
        className="font-serif text-3xl leading-tight text-[#f6efdd] sm:text-4xl"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1.2 }}
      >
        There{"’"}s a sky with your name on it.
      </motion.h1>

      <motion.span
        className="mt-8 inline-flex items-center gap-2 text-sm tracking-[0.2em] text-[#c8b88a] uppercase"
        initial={{ opacity: 0 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
        transition={
          reduceMotion
            ? { delay: 1.6, duration: 0.6 }
            : { delay: 1.6, duration: 2.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        tap to open it
      </motion.span>
    </motion.button>
  );
}
