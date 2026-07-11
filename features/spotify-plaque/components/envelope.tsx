"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

import type { HiddenMessage, PlaqueTheme } from "../config";
import { KyndlSealMark } from "./kyndl-seal-mark";

// A faint damask flourish embossed across the envelope paper.
const DAMASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.5'%3E%3Cpath d='M24 8c6 4 6 12 0 16-6-4-6-12 0-16zM24 40c-6-4-6-12 0-16 6 4 6 12 0 16zM8 24c4-6 12-6 16 0-4 6-12 6-16 0zM40 24c-4 6-12 6-16 0 4-6 12-6 16 0z'/%3E%3Ccircle cx='24' cy='24' r='2'/%3E%3C/g%3E%3C/svg%3E\")";

/**
 * A wax-sealed envelope the recipient taps to unwrap. Light streaks orbit it;
 * on tap the seal breaks, the flap lifts and tips back, a letter rises out, and
 * the private {@link HiddenMessage} settles into a centred card over a dimmed
 * backdrop. The seal is stamped with the Kyndl mark. Tapping the backdrop (or
 * the close button) folds it back.
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
        aria-label="Unwrap the envelope"
        className="relative block cursor-pointer outline-none"
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Orbiting light streaks */}
        {!reduceMotion && (
          <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
            {[0, 32].map((tilt, i) => (
              <motion.div
                key={i}
                className="absolute rounded-[50%] border border-white/30 blur-[1px]"
                style={{
                  width: 380,
                  height: 150,
                  transform: `rotate(${tilt}deg)`,
                }}
                animate={{ rotate: [tilt, tilt + 360] }}
                transition={{
                  duration: 14 - i * 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        )}

        {/* opening glow */}
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
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* Envelope */}
        <div
          className="relative"
          style={{ width: 300, height: 200, perspective: 1100 }}
        >
          {/* back / inside */}
          <div
            className="absolute inset-0 rounded-[10px]"
            style={{
              background: theme.envelope,
              backgroundImage: DAMASK,
              backgroundSize: "52px 52px",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.45)",
            }}
          />

          {/* letter that rises out */}
          <motion.div
            className="absolute left-1/2 z-[15] w-[82%] -translate-x-1/2 rounded-[6px] bg-[#f6ecd7] shadow-lg"
            style={{ top: 18, height: 150 }}
            initial={false}
            animate={
              open ? { y: -104, opacity: 1 } : { y: 0, opacity: 0 }
            }
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: open ? 0.15 : 0 }}
          >
            <div className="space-y-2 p-4">
              <div className="h-2 w-1/2 rounded-full bg-[#d8c7a4]" />
              <div className="h-1.5 w-full rounded-full bg-[#e4d7bb]" />
              <div className="h-1.5 w-5/6 rounded-full bg-[#e4d7bb]" />
              <div className="h-1.5 w-2/3 rounded-full bg-[#e4d7bb]" />
            </div>
          </motion.div>

          {/* front pocket (bottom flap) — keeps the letter tucked */}
          <div
            className="absolute inset-0 z-20 rounded-[10px]"
            style={{
              background: `linear-gradient(180deg, ${theme.envelopeFlap} 0%, ${theme.envelope} 100%)`,
              clipPath: "polygon(0 100%, 100% 100%, 50% 34%)",
              boxShadow: "inset 0 2px 6px rgba(255,255,255,0.06)",
            }}
          />
          {/* side fold lines */}
          <svg
            aria-hidden
            viewBox="0 0 300 200"
            className="absolute inset-0 z-20 h-full w-full"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          >
            <path d="M0 8 L150 116 L300 8 M0 196 L150 116 L300 196" />
          </svg>

          {/* flap */}
          <motion.div
            className="absolute inset-0 origin-top rounded-[10px]"
            style={{
              background: `linear-gradient(180deg, ${theme.envelopeFlap} 0%, ${theme.envelope} 100%)`,
              backgroundImage: DAMASK,
              backgroundSize: "52px 52px",
              clipPath: "polygon(0 0, 100% 0, 50% 70%)",
              transformStyle: "preserve-3d",
              zIndex: open ? 5 : 30,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
            animate={{ rotateX: open ? -168 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* wax seal */}
          <motion.div
            className="absolute top-1/2 left-1/2 z-40 grid size-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{
              background: `radial-gradient(circle at 36% 30%, ${theme.seal} 0%, ${theme.seal} 32%, ${theme.sealDeep} 78%, ${theme.sealDeep} 100%)`,
              color: theme.sealDeep,
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.35)",
            }}
            animate={
              open
                ? { scale: 0.6, opacity: 0, y: 8 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            transition={{ duration: 0.35 }}
          >
            {/* scalloped rim */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `inset 0 0 0 2px ${theme.sealDeep}` }}
            />
            {/* embossed Kyndl mark (inherits the seal's deep-gold colour) */}
            <KyndlSealMark className="w-8 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]" />
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
          Unwrap to Reveal
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
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-black/5 bg-[#f8efdd] p-8 text-center shadow-2xl"
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.85 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 18,
                delay: reduceMotion ? 0 : 0.45,
              }}
            >
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-[#a9906a] transition-colors hover:bg-black/5 hover:text-[#6f5a3a]"
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
                    <h2
                      className="font-serif text-2xl italic sm:text-3xl"
                      style={{ color: theme.ink }}
                    >
                      {hidden.heading}
                    </h2>
                  )}
                  {hidden.body.trim() && (
                    <p
                      className="mt-3 text-base leading-relaxed whitespace-pre-line"
                      style={{ color: theme.inkSoft }}
                    >
                      {hidden.body}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-base leading-relaxed" style={{ color: theme.inkSoft }}>
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
