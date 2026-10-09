"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

import type { HiddenMessage, PlaqueTheme } from "../config";

/**
 * A sealed glass whisper — a slim frosted card with a silk ribbon tied across
 * it. Tap to untie: the ribbon parts, the card blooms into a matching glass
 * letter. Replaces the old 3D wax-seal envelope.
 */
export function Envelope({
  hidden,
  theme,
}: {
  hidden: HiddenMessage;
  theme: PlaqueTheme;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const hasMessage = hidden.heading.trim() || hidden.body.trim();

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the sealed note"
        className="relative block cursor-pointer outline-none"
        whileHover={reduceMotion ? undefined : { y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        {/* soft ambient bloom — still, not orbiting */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 -z-10 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${theme.accent}55 0%, transparent 70%)`,
            opacity: open ? 0.9 : 0.45,
          }}
        />

        <div
          className="relative overflow-hidden rounded-[22px] backdrop-blur-2xl"
          style={{
            width: 168,
            height: 220,
            background: theme.noteGlass,
            boxShadow: `
              0 28px 60px -24px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.5),
              inset 0 0 0 1px ${theme.noteBorder}
            `,
          }}
        >
          {/* glass sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.42) 0%, transparent 42%, transparent 68%, rgba(255,255,255,0.08) 100%)",
            }}
          />

          {/* faint handwritten cue behind the ribbon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 pt-2">
            <p
              className="font-serif text-center text-[15px] leading-snug italic"
              style={{ color: theme.inkSoft }}
            >
              a note
              <br />
              for you
            </p>
            <span
              className="mt-4 block h-px w-10"
              style={{ background: theme.inkSoft, opacity: 0.35 }}
            />
          </div>

          {/* silk ribbon band */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-[46%] z-20 h-[34px] -translate-y-1/2"
            animate={
              open ? { opacity: 0, scaleX: 1.15 } : { opacity: 1, scaleX: 1 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="absolute inset-y-0 -left-3 -right-3"
              style={{
                background: `linear-gradient(180deg, ${theme.ribbon} 0%, ${theme.ribbonDeep} 100%)`,
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            />
            {/* soft fold crease on ribbon */}
            <div
              className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
              style={{ background: "rgba(0,0,0,0.12)" }}
            />
          </motion.div>

          {/* ribbon knot / bow */}
          <motion.div
            className="absolute top-[46%] left-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            animate={
              open
                ? { scale: 0.4, opacity: 0, rotate: 18 }
                : { scale: 1, opacity: 1, rotate: 0 }
            }
            transition={{ duration: 0.4 }}
          >
            <RibbonKnot theme={theme} />
          </motion.div>

          {/* opening: letter peek rising inside the glass */}
          <AnimatePresence>
            {open && (
              <motion.div
                aria-hidden
                className="absolute inset-x-4 top-6 bottom-6 rounded-[14px]"
                style={{
                  background: theme.dark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.35)",
                  boxShadow: `inset 0 0 0 1px ${theme.noteBorder}`,
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {!open && (
        <motion.p
          className="text-sm tracking-wide"
          style={{ color: theme.dark ? "#e9e2d8" : theme.ink }}
          animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          Untie to read
        </motion.p>
      )}

      {/* The reveal — matching glass letter */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close message"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-md"
            />

            <motion.div
              className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] p-8 text-center backdrop-blur-2xl"
              style={{
                background: theme.noteGlass,
                boxShadow: `
                  0 40px 90px -20px rgba(0,0,0,0.55),
                  inset 0 1px 0 rgba(255,255,255,0.45),
                  inset 0 0 0 1px ${theme.noteBorder}
                `,
                color: theme.ink,
              }}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 48, scale: 0.92 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 170,
                damping: 20,
                delay: reduceMotion ? 0 : 0.28,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.35) 0%, transparent 45%)",
                }}
              />

              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full transition-colors"
                style={{
                  color: theme.inkSoft,
                  background: theme.dark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.35)",
                }}
              >
                <X className="size-4" />
              </button>

              <div className="relative z-10">
                <span
                  className="mx-auto mb-5 block h-px w-12"
                  style={{ background: theme.accent }}
                />

                {hasMessage ? (
                  <>
                    {hidden.heading.trim() && (
                      <h2
                        className="font-serif text-2xl italic sm:text-3xl"
                        style={{ color: theme.ink }}
                      >
                        {hidden.heading}
                      </h2>
                    )}
                    {hidden.body.trim() && (
                      <p
                        className="mt-4 text-base leading-relaxed whitespace-pre-line"
                        style={{ color: theme.inkSoft }}
                      >
                        {hidden.body}
                      </p>
                    )}
                  </>
                ) : (
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: theme.inkSoft }}
                  >
                    A little something is waiting here — the sender will write
                    it before they share.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RibbonKnot({ theme }: { theme: PlaqueTheme }) {
  return (
    <div className="relative size-14">
      <span
        className="absolute top-1/2 left-0 h-7 w-8 -translate-y-1/2 -rotate-[28deg] rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${theme.ribbon}, ${theme.ribbonDeep})`,
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35)",
        }}
      />
      <span
        className="absolute top-1/2 right-0 h-7 w-8 -translate-y-1/2 rotate-[28deg] rounded-full"
        style={{
          background: `radial-gradient(circle at 70% 30%, ${theme.ribbon}, ${theme.ribbonDeep})`,
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35)",
        }}
      />
      <span
        className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${theme.ribbon}, ${theme.ribbonDeep})`,
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.4)",
        }}
      />
      <span
        className="absolute top-[58%] left-[28%] h-7 w-3 origin-top -rotate-[18deg] rounded-b-sm"
        style={{
          background: `linear-gradient(180deg, ${theme.ribbon}, ${theme.ribbonDeep})`,
        }}
      />
      <span
        className="absolute top-[58%] right-[28%] h-7 w-3 origin-top rotate-[18deg] rounded-b-sm"
        style={{
          background: `linear-gradient(180deg, ${theme.ribbon}, ${theme.ribbonDeep})`,
        }}
      />
    </div>
  );
}
