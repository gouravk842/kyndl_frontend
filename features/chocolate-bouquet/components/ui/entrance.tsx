"use client";

import { motion } from "framer-motion";

/**
 * The one-time wrapping ceremony: a warm gate that names who the bouquet is for
 * before it's revealed. Tapping "Unwrap" begins — the same gesture that starts
 * the scene.
 */
export function Entrance({
  recipientName,
  bouquetName,
  onBegin,
}: {
  recipientName: string;
  bouquetName: string;
  onBegin: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 50% 40%, #3a1622 0%, #240d16 60%, #160810 100%)",
      }}
    >
      <motion.p
        className="text-xs font-medium uppercase tracking-[0.3em] text-[#e6a4a4]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        For {recipientName || "you"}
      </motion.p>
      <motion.h1
        className="mt-3 font-serif text-3xl text-[#f7ead9] sm:text-4xl [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {bouquetName || "A bouquet of us"}
      </motion.h1>
      <motion.p
        className="mt-2 max-w-xs text-sm text-[#cdb3ad]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Someone gathered a bouquet where every chocolate holds a memory.
      </motion.p>
      <motion.button
        type="button"
        onClick={onBegin}
        className="mt-8 rounded-full bg-[#d6465a] px-8 py-3 text-sm font-semibold tracking-wide text-white shadow-lg transition-colors hover:bg-[#e75c70]"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.65 }}
      >
        Unwrap the bouquet
      </motion.button>
    </motion.div>
  );
}
