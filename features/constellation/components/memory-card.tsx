"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

import type { Star } from "@/features/constellation/config";

type MemoryCardProps = {
  star: Star;
  imageUrl?: string | null;
  onClose: () => void;
};

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
 * The opened memory, still inside the night. The camera has leaned into the
 * star; the photo blooms from that point and the words sit in starlight, with
 * the meadow left visible behind a light veil.
 */
export function MemoryCard({ star, imageUrl, onClose }: MemoryCardProps) {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const formatted = formatMemoryDate(star.timestamp);
  const kicker = formatted || star.date;
  const subtitle = formatted && star.date ? star.date : "";

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center px-5 pt-16 pb-[22%] sm:items-center sm:pb-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "rgba(2, 4, 12, 0.28)" }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={star.label}
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close memory"
          onClick={onClose}
          className="absolute -top-10 right-0 text-sm tracking-[0.18em] text-[#c4cad8] uppercase outline-none hover:text-white"
        >
          close
        </button>

        {imageUrl ? (
          <div className="mb-5 flex justify-center">
            <div
              className="relative size-36 overflow-hidden rounded-full sm:size-44"
              style={{
                boxShadow:
                  "0 0 40px 12px rgba(255, 236, 210, 0.35), 0 0 0 1px rgba(255,255,255,0.35)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded/presigned or /public URL */}
              <img
                src={imageUrl}
                alt={star.label}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="max-h-[46dvh] overflow-y-auto text-center">
          {kicker ? (
            <p className="font-serif mb-1 text-sm text-[#d7c4a2] italic [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
              {kicker}
            </p>
          ) : null}
          <h2 className="font-serif text-3xl leading-tight text-[#f7f4ee] [text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
            {star.label}
          </h2>
          {subtitle ? (
            <p className="font-serif mt-1 text-sm text-[#c4cad8] italic [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
              {subtitle}
            </p>
          ) : null}
          <p className="font-serif mt-4 text-[17px] leading-relaxed whitespace-pre-line text-[#f0f2f7] [text-shadow:0_1px_12px_rgba(0,0,0,0.95)]">
            {star.memory}
          </p>
          {star.author ? (
            <p className="font-serif mt-5 text-sm text-[#d7c4a2] italic [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
              — {star.author}
            </p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
