"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { CountdownConfig, CountdownTheme } from "../config";

/**
 * The surprise that lands at zero. Springs up out of the dissolving clock with a
 * headline, an optional photo, and the message written for this moment — over a
 * confetti rain the parent supplies.
 */
export function Reveal({
  config,
  theme,
  imageUrl,
}: {
  config: CountdownConfig;
  theme: CountdownTheme;
  imageUrl: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const { reveal, recipientName } = config;

  return (
    <motion.div
      className="relative z-40 mx-auto w-full max-w-xl text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <motion.p
        className="mb-3 text-xs font-semibold tracking-[0.3em] uppercase"
        style={{ color: theme.accent }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        for {recipientName}
      </motion.p>

      <motion.h2
        className="font-display text-4xl leading-tight font-semibold sm:text-5xl"
        style={{ color: theme.digit }}
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
      >
        {reveal.headline}
      </motion.h2>

      {imageUrl && (
        <motion.div
          className="mx-auto mt-7 w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl"
          style={{ borderColor: theme.cardBorder }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 140, damping: 16 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
          <img src={imageUrl} alt="" className="h-auto w-full object-cover" />
        </motion.div>
      )}

      {reveal.message.trim() && (
        <motion.p
          className="mx-auto mt-7 max-w-md text-base leading-relaxed sm:text-lg"
          style={{ color: theme.label }}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {reveal.message}
        </motion.p>
      )}
    </motion.div>
  );
}
