"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Feather } from "lucide-react";
import { useState } from "react";

import type { Letter, TreasureTheme } from "../config";

/**
 * The folded note tucked in the box. It rests folded with a little wax seal;
 * tapping it unfolds the paper (a downward reveal) into the full letter. Empty
 * letters render a gentle placeholder so the marketing/preview still reads.
 */
export function KeepsakeLetter({
  letter,
  theme,
}: {
  letter: Letter;
  theme: TreasureTheme;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const heading = letter.heading.trim();
  const body = letter.body.trim();
  const hasLetter = heading || body;

  return (
    <div className="mx-auto w-full max-w-md">
      {/* The folded note — tap to unfold */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group relative block w-full cursor-pointer rounded-2xl px-6 py-5 text-left outline-none transition-transform hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(160deg, #fffaf1 0%, #f6ecda 100%)",
          boxShadow:
            "0 14px 30px -18px rgba(60,44,20,0.55), inset 0 1px 0 rgba(255,255,255,0.7)",
          border: "1px solid rgba(120,90,50,0.15)",
          transform: "rotate(-0.6deg)",
        }}
      >
        {/* strip of tape holding the note into the album */}
        <span
          aria-hidden
          className="absolute -top-2.5 left-8 h-5 w-16 rotate-2 rounded-[1px]"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.55), rgba(230,222,205,0.4))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          }}
        />
        {/* fold crease */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px"
          style={{ background: "rgba(120,90,50,0.18)" }}
        />
        <div className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full"
            style={{ background: `${theme.accent}22`, color: theme.accent }}
          >
            <Feather className="size-4" />
          </span>
          <div className="min-w-0">
            <p
              className="font-display text-lg font-semibold"
              style={{ color: theme.ink }}
            >
              {heading || "A letter for you"}
            </p>
            <p className="text-xs" style={{ color: theme.ink, opacity: 0.65 }}>
              {open ? "Tap to fold it back" : "Tap to unfold the note"}
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="letter-body"
              initial={
                reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
              }
              animate={
                reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }
              }
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mt-4 border-t pt-4"
                style={{ borderColor: "rgba(120,90,50,0.15)" }}
              >
                {hasLetter ? (
                  <p
                    className="font-hand text-lg leading-relaxed whitespace-pre-line"
                    style={{ color: theme.ink }}
                  >
                    {body ||
                      "A little something is waiting here — the sender will write it before they share."}
                  </p>
                ) : (
                  <p
                    className="font-hand text-lg leading-relaxed"
                    style={{ color: theme.ink, opacity: 0.7 }}
                  >
                    A little something is waiting here — the sender will write
                    it before they share.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
