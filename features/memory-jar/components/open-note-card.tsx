"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

import type { JarNote } from "@/features/memory-jar/config";

type OpenNoteCardProps = {
  note: JarNote;
  /** Resolved URL for the note's photo, if it has one. */
  imageUrl?: string | null;
  onClose: () => void;
  /** 1-based position of this scroll and the total, for the "3 / 8" hint. */
  position?: number;
  total?: number;
  /** Step to the previous / next scroll; omitted at the ends. */
  onPrev?: () => void;
  onNext?: () => void;
};

/**
 * The opened note, shown as a centred scroll over a dim backdrop. It starts as a
 * tightly rolled coil and unrolls downward from the top — the paper drops open
 * along its length, the coiled bars at top and bottom relax, and the message
 * fades in once it's unfurled. Closes on ×, backdrop click, or Esc.
 */
export function OpenNoteCard({
  note,
  imageUrl,
  onClose,
  position,
  total,
  onPrev,
  onNext,
}: OpenNoteCardProps) {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button so the dialog is immediately keyboard-operable, and
  // wire up Escape to dismiss plus ← / → to walk between scrolls.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  // The unroll: from a squashed coil at the top down to the full open sheet.
  const unroll = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scaleY: 0.05, y: -12 },
        animate: {
          opacity: 1,
          scaleY: 1,
          y: 0,
          transition: {
            opacity: { duration: 0.18 },
            y: { duration: 0.5, ease: "easeOut" as const },
            scaleY: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const },
          },
        },
        exit: {
          opacity: 0,
          scaleY: 0.05,
          y: -8,
          transition: { duration: 0.3, ease: "easeIn" as const },
        },
      };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // a beat of delay so the lid-open + slip-out reads before the dim falls
      transition={{ duration: 0.25, delay: reduceMotion ? 0 : 0.18 }}
      onClick={onClose}
    >
      {/* dim backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "rgba(40,25,15,0.5)", backdropFilter: "blur(2px)" }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Note ${note.id}: ${note.title}`}
        className="relative w-full max-w-[340px]"
        style={{ transformOrigin: "50% 0%" }}
        onClick={(e) => e.stopPropagation()}
        {...unroll}
      >
        {/* top coil — the roll the paper unfurls from */}
        <ScrollRoll />

        {/* the unfurled parchment sheet */}
        <div
          className="relative -my-1 px-8 pt-7 pb-7"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, #fffdf6 0%, #f8eed6 55%, #efdfbe 100%)",
            boxShadow:
              "0 22px 55px rgba(40,25,15,0.42), inset 0 0 0 1px rgba(150,112,74,0.12)",
            // faint deckle wobble down the long sides
            clipPath:
              "polygon(1% 0, 99% 0, 100% 12%, 99% 25%, 100% 38%, 99% 52%, 100% 66%, 99% 80%, 100% 92%, 99% 100%, 1% 100%, 0 92%, 1% 80%, 0 66%, 1% 52%, 0 38%, 1% 25%, 0 12%)",
          }}
        >
          {/* aged fibre + soft edge vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent 0 6px, rgba(150,112,74,0.03) 6px 7px), radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(120,90,55,0.14) 100%)",
            }}
          />

          {/* close, written-in-pen style */}
          <button
            ref={closeRef}
            type="button"
            aria-label={`Close note ${note.id}`}
            onClick={onClose}
            className="font-hand absolute right-3 top-1 z-10 text-2xl leading-none text-[#b0987a] outline-none transition-colors hover:text-[#7a6a55] focus-visible:text-[#7a6a55]"
          >
            ×
          </button>

          <motion.div
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.5, duration: 0.4 }}
          >
            <p className="font-hand mb-3 text-center text-base lowercase tracking-wide text-[#c1502f]">
              {note.title}
            </p>
            {imageUrl ? (
              <div className="mx-auto mb-3 max-w-[80%] overflow-hidden rounded-sm shadow-[0_4px_14px_rgba(40,25,15,0.25)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
                <img
                  src={imageUrl}
                  alt={note.title}
                  className="max-h-56 w-full object-cover"
                />
              </div>
            ) : null}
            <p
              className="font-hand text-center text-xl leading-relaxed"
              style={{ color: "#3a2e1e" }}
            >
              {note.message}
            </p>
          </motion.div>
        </div>

        {/* bottom coil */}
        <ScrollRoll />
      </motion.div>

      {/* prev / next arrows — siblings of the scroll so they don't get scaled
          by the unroll; they sit at the viewport edges and stop the backdrop
          from closing when tapped. */}
      {(onPrev || onNext) && (
        <>
          <NavArrow side="left" onClick={onPrev} />
          <NavArrow side="right" onClick={onNext} />
          {position && total ? (
            <div
              className="font-hand pointer-events-none fixed inset-x-0 bottom-6 z-10 text-center text-sm tracking-[0.2em] text-[#f4e3c9]"
              style={{ textShadow: "0 1px 6px rgba(40,25,15,0.6)" }}
            >
              {position} / {total}
            </div>
          ) : null}
        </>
      )}
    </motion.div>
  );
}

/**
 * A round arrow pinned to a viewport edge for stepping between scrolls. Dimmed
 * and inert at the ends (when its handler is absent). Stops propagation so it
 * never closes the dialog via the backdrop.
 */
function NavArrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick?: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  const disabled = !onClick;
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={side === "left" ? "Previous scroll" : "Next scroll"}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`fixed top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#e6d2ba] bg-[#fdf7ee]/90 text-[#8a5a3c] shadow-[0_10px_24px_-10px_rgba(58,42,37,0.6)] backdrop-blur-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#FF7A59] ${
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
      } ${
        disabled
          ? "cursor-default opacity-30"
          : "hover:scale-105 hover:bg-white hover:text-[#c1502f] active:scale-95"
      }`}
    >
      <Icon className="size-5" />
    </button>
  );
}

/**
 * A coiled bar of parchment for the top and bottom of the scroll. Rendered
 * slightly wider than the sheet so the roll reads as the paper wound around
 * itself; a highlight and a seam line give it a cylindrical curl.
 */
function ScrollRoll() {
  return (
    <div className="relative -mx-1.5 h-4">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, #ecd9b1 0%, #ddc596 46%, #c6a875 100%)",
          boxShadow:
            "0 4px 10px rgba(60,40,25,0.32), inset 0 1px 0 rgba(255,250,235,0.65), inset 0 -2px 3px rgba(120,88,52,0.3)",
        }}
      />
      {/* the coil seam */}
      <div
        aria-hidden
        className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2"
        style={{ background: "rgba(120,88,52,0.35)" }}
      />
      {/* rounded end caps, a touch darker like the cut edge of the roll */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-4 rounded-full"
        style={{ background: "radial-gradient(circle at 60% 40%, #d8bf90, #b7965f)" }}
      />
      <span
        aria-hidden
        className="absolute right-0 top-0 h-full w-4 rounded-full"
        style={{ background: "radial-gradient(circle at 40% 40%, #d8bf90, #b7965f)" }}
      />
    </div>
  );
}
