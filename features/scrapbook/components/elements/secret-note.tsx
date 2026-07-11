"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type SecretNoteProps = {
  message: string;
  teaser?: string;
};

/**
 * A folded paper note. Click to unfold and reveal the hidden message; click
 * again to fold it back.
 */
export function SecretNote({ message, teaser = "Open me" }: SecretNoteProps) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="block w-56 cursor-pointer text-left [perspective:1200px]"
      aria-expanded={open}
      aria-label={open ? "Fold the note" : "Unfold the secret note"}
    >
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="open"
            initial={{ rotateX: -88, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -88, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "top center" }}
            className="kyndl-pinned rounded-[2px] bg-[#fffdf6] p-4"
          >
            <p className="mb-2 font-hand text-sm text-[#b08a5a]">
              just between us —
            </p>
            <p className="font-cursive text-xl leading-snug text-[#3a2a25]">
              {message}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="folded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ y: -3, rotate: -1 }}
            className="kyndl-pinned relative rounded-[2px] bg-[#f6ead3] p-4"
          >
            {/* fold crease */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[#d9c19a]"
            />
            <p className="font-hand text-lg text-[#7a5b3a]">✶ {teaser}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
