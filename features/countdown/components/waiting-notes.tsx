"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type { CountdownNote, CountdownTheme } from "../config";

/**
 * Little notes left to keep the recipient company while the clock runs. Shown as
 * a row of small "sealed" cards; tapping one opens it in a centred overlay. A
 * gentle way to make the waiting itself part of the gift.
 */
export function WaitingNotes({
  notes,
  theme,
}: {
  notes: CountdownNote[];
  theme: CountdownTheme;
}) {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<number | null>(null);
  const open = notes.find((n) => n.id === openId) ?? null;

  if (notes.length === 0) return null;

  return (
    <>
      <div className="mt-9 flex flex-col items-center">
        <p
          className="mb-3 text-[0.65rem] font-semibold tracking-[0.24em] uppercase opacity-80"
          style={{ color: theme.label }}
        >
          a little something while you wait
        </p>
        <ul className="flex max-w-2xl flex-wrap justify-center gap-2.5">
          {notes.map((n, i) => (
            <li key={n.id}>
              <motion.button
                type="button"
                onClick={() => setOpenId(n.id)}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
                className="rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-colors"
                style={{
                  background: theme.card,
                  borderColor: theme.cardBorder,
                  color: theme.digit,
                }}
              >
                {n.label || `note ${i + 1}`}
              </motion.button>
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenId(null)}
          >
            <NoteCard
              note={open}
              theme={theme}
              onClose={() => setOpenId(null)}
              reduceMotion={!!reduceMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NoteCard({
  note,
  theme,
  onClose,
  reduceMotion,
}: {
  note: CountdownNote;
  theme: CountdownTheme;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-md rounded-2xl bg-[#fffdf8] px-7 py-8 text-center shadow-2xl"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-[#9b8576] hover:bg-black/5"
      >
        <X className="size-4" />
      </button>
      {note.label && (
        <p
          className="mb-3 text-xs font-semibold tracking-[0.22em] uppercase"
          style={{ color: theme.accent }}
        >
          {note.label}
        </p>
      )}
      <p className="font-hand text-xl leading-relaxed text-[#4a3a32] sm:text-2xl">
        {note.message}
      </p>
    </motion.div>
  );
}
