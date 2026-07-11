"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

import type { Star } from "@/features/constellation/config";

type MemoryCardProps = {
  star: Star;
  /** The star's resolved photo URL (uploaded image or legacy path), or null. */
  imageUrl?: string | null;
  onClose: () => void;
};

/** Format an ISO `YYYY-MM-DD` as a warm, readable date (e.g. "14 February 2024").
 * Returns "" for a missing/unparseable value so callers can fall back. */
function formatMemoryDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * The opened memory, shown as a centred card over a dimmed sky. It rises and
 * brightens from the star like the moment is being lifted down out of the night
 * to be read. Serif type and warm starlight tones keep it of-a-piece with the
 * sky rather than a generic dialog. Closes on ×, backdrop click, or Esc.
 */
export function MemoryCard({ star, imageUrl, onClose }: MemoryCardProps) {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Make the dialog immediately keyboard-operable and wire Escape to dismiss.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* dim the sky behind the memory */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "rgba(2, 6, 18, 0.62)",
          backdropFilter: "blur(3px)",
        }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={star.label}
        className="relative w-full max-w-[380px]"
        onClick={(e) => e.stopPropagation()}
        initial={
          reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 24 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }
        }
        transition={{ duration: 0.42, ease: "easeOut" }}
      >
        <div
          className="relative overflow-hidden rounded-2xl px-7 pt-9 pb-8"
          style={{
            background:
              "linear-gradient(165deg, rgba(20,16,48,0.96) 0%, rgba(8,10,30,0.97) 100%)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,232,180,0.14), 0 0 60px rgba(120,90,220,0.18)",
          }}
        >
          {/* a soft glow at the top, like the star this came from */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,226,168,0.4) 0%, transparent 70%)",
            }}
          />

          <button
            ref={closeRef}
            type="button"
            aria-label="Close memory"
            onClick={onClose}
            className="absolute right-3.5 top-3 text-2xl leading-none text-[#9a96b8] outline-none transition-colors hover:text-[#f3ead2] focus-visible:text-[#f3ead2]"
          >
            ×
          </button>

          {imageUrl ? (
            <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded/presigned or /public URL */}
              <img
                src={imageUrl}
                alt={star.label}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : null}

          {(() => {
            // Kicker line: the real date if set, otherwise the free-text caption.
            const formatted = formatMemoryDate(star.timestamp);
            const kicker = formatted || star.date;
            // Keep the caption as a subtitle only when a real date took the kicker.
            const subtitle = formatted && star.date ? star.date : "";
            return (
              <>
                {kicker ? (
                  <p className="mb-1 text-xs font-medium tracking-[0.22em] text-[#c8b88a] uppercase">
                    {kicker}
                  </p>
                ) : null}
                <h2 className="font-serif mb-1 text-2xl leading-tight text-[#f6efdd]">
                  {star.label}
                </h2>
                {subtitle ? (
                  <p className="font-serif mb-3 text-sm text-[#b9b2d0] italic">
                    {subtitle}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
              </>
            );
          })()}

          <p className="font-serif whitespace-pre-line text-[15px] leading-relaxed text-[#d8d3e8]">
            {star.memory}
          </p>

          {star.author ? (
            <p className="font-serif mt-5 text-right text-sm text-[#9a96b8]">
              — {star.author}
            </p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
