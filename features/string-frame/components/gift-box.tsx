"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

import type { FrameTheme, HiddenMessage } from "../config";

/**
 * A wrapped gift box the recipient taps to open. The lid lifts and tips away,
 * a glow blooms from inside, and the private {@link HiddenMessage} rises into a
 * centred card over a dimmed backdrop. Tapping the backdrop (or the close
 * button) settles the lid back down.
 */
export function GiftBox({
  hidden,
  label,
  theme,
}: {
  hidden: HiddenMessage;
  /** The emblem struck on the wax seal (a number or short glyph). */
  label: string;
  theme: FrameTheme;
}) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const hasMessage = hidden.heading.trim() || hidden.body.trim();

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the gift"
        className="relative block cursor-pointer outline-none"
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        animate={
          reduceMotion || open
            ? undefined
            : { y: [0, -5, 0], rotate: [0, -1, 1, 0] }
        }
        transition={
          reduceMotion || open
            ? undefined
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div
          className="relative"
          style={{ width: 184, height: 176, perspective: 900 }}
        >
          {/* glow that blooms the instant it opens */}
          <AnimatePresence>
            {open && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,238,200,0.95) 0%, rgba(255,210,120,0.4) 45%, transparent 70%)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          {/* Box base */}
          <div
            className="absolute inset-x-0 bottom-0 h-[122px] rounded-b-xl rounded-t-sm shadow-inner"
            style={{ background: theme.giftBox }}
          >
            {/* vertical ribbon strap */}
            <div
              className="absolute inset-y-0 left-1/2 w-7 -translate-x-1/2"
              style={{ background: theme.ribbon }}
            />
            {/* wax-seal medallion */}
            <div className="absolute top-1/2 left-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-md ring-1 ring-black/10">
              <span
                className="font-display text-2xl font-bold"
                style={{ color: theme.seal }}
              >
                {label || "♥"}
              </span>
            </div>
          </div>

          {/* Lid (lifts + tips away on open) */}
          <motion.div
            className="absolute inset-x-[-8px] top-[26px] h-12 rounded-md shadow-lg"
            style={{
              background: theme.giftLid,
              transformOrigin: "center bottom",
              transformStyle: "preserve-3d",
            }}
            animate={
              open
                ? { y: -104, rotateX: -52, opacity: 0 }
                : { y: 0, rotateX: 0, opacity: 1 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* lid ribbon strap */}
            <div
              className="absolute inset-y-0 left-1/2 w-7 -translate-x-1/2"
              style={{ background: theme.ribbon }}
            />
            {/* bow */}
            <Bow color={theme.ribbon} />
          </motion.div>
        </div>
      </motion.button>

      {!open && (
        <motion.p
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: theme.dark ? "#e9e2d8" : theme.ink }}
          animate={reduceMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="size-4" style={{ color: theme.seal }} />
          Tap to open
        </motion.p>
      )}

      {/* The reveal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* backdrop */}
            <button
              type="button"
              aria-label="Close message"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-black/5 bg-[#fffaf3] p-8 text-center shadow-2xl"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 60, scale: 0.85 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 18,
                delay: reduceMotion ? 0 : 0.15,
              }}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-[#b29a89] transition-colors hover:bg-black/5 hover:text-[#7a6258]"
              >
                <X className="size-4" />
              </button>

              <span
                className="mx-auto mb-4 grid size-11 place-items-center rounded-full"
                style={{ background: `${theme.accent}22`, color: theme.accent }}
              >
                <Sparkles className="size-5" />
              </span>

              {hasMessage ? (
                <>
                  {hidden.heading.trim() && (
                    <h2 className="font-display text-2xl font-semibold text-[#3a2a25] sm:text-3xl">
                      {hidden.heading}
                    </h2>
                  )}
                  {hidden.body.trim() && (
                    <p className="mt-3 text-base leading-relaxed whitespace-pre-line text-[#6b564c]">
                      {hidden.body}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-base leading-relaxed text-[#6b564c]">
                  A little something is waiting here — the sender will write it
                  before they share.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A small stylised ribbon bow sitting on the lid. */
function Bow({ color }: { color: string }) {
  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
      <div className="relative h-8 w-16">
        {/* left loop */}
        <span
          className="absolute top-0 left-0 h-8 w-8 rounded-full"
          style={{
            background: color,
            transform: "rotate(-28deg)",
            clipPath: "ellipse(42% 50% at 50% 50%)",
          }}
        />
        {/* right loop */}
        <span
          className="absolute top-0 right-0 h-8 w-8 rounded-full"
          style={{
            background: color,
            transform: "rotate(28deg)",
            clipPath: "ellipse(42% 50% at 50% 50%)",
          }}
        />
        {/* knot */}
        <span
          className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow"
          style={{ background: color, filter: "brightness(1.15)" }}
        />
      </div>
    </div>
  );
}
