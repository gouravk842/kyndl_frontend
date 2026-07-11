"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Music2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { PlaqueConfig, PlaqueTheme } from "../config";
import { ScanCode } from "./scan-code";

/** How long each slide holds before cross-fading to the next. */
const SLIDE_MS = 4200;

/**
 * The plaque: a frosted-glass block on the studio wall, holding a vintage
 * parchment card. The card carries the script title/date, a cross-fading photo
 * slideshow, the caption, and a "Now Playing" Spotify-style scan strip. With no
 * photos it shows a soft placeholder so it still reads on the marketing page.
 */
export function PlaqueFrame({
  config,
  photoUrls,
  theme,
}: {
  config: PlaqueConfig;
  /** Resolved, in-order photo URLs (already filtered to those that exist). */
  photoUrls: string[];
  theme: PlaqueTheme;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const count = photoUrls.length;

  // Advance the slideshow while there's more than one photo.
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearInterval(id);
  }, [count]);

  // `index` is always read modulo `count`, so it stays valid even when photos
  // are removed in the builder — no clamping effect needed.
  const current = count > 0 ? photoUrls[index % count] : null;
  const songLabel = config.songLabel.trim() || "Our song";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: 1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[320px] rounded-[26px] p-3.5 backdrop-blur-md sm:max-w-[360px]"
      style={{
        background: theme.glassTint,
        boxShadow: `0 40px 80px -28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 0 1px ${theme.glassBorder}`,
      }}
    >
      {/* glassy top sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-[26px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)",
        }}
      />

      {/* The parchment card */}
      <div
        className="relative overflow-hidden rounded-[16px] px-5 pt-6 pb-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)]"
        style={{ background: theme.paper }}
      >
        {/* aged-paper vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(120,90,50,0.18) 100%)",
          }}
        />

        {/* Title + date */}
        <div className="relative z-10 mb-4 text-center">
          <p
            className="font-serif text-2xl leading-tight italic sm:text-[26px]"
            style={{ color: theme.ink }}
          >
            {config.title || "Your title"}
          </p>
          {config.date.trim() && (
            <p
              className="mt-1 text-xs tracking-wide"
              style={{ color: theme.inkSoft }}
            >
              {config.date}
            </p>
          )}
        </div>

        {/* Photo well */}
        <div
          className="relative mx-auto aspect-[4/5] w-[86%] overflow-hidden rounded-[12px] p-1.5"
          style={{
            background: "rgba(255,255,255,0.5)",
            boxShadow: "inset 0 0 0 1px rgba(120,90,50,0.18)",
          }}
        >
          <div
            className="relative h-full w-full overflow-hidden rounded-[9px]"
            style={{ background: "#e9dec9" }}
          >
            <AnimatePresence mode="popLayout">
              {current ? (
                <motion.img
                  key={current}
                  src={current}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                />
              ) : (
                <div
                  key="placeholder"
                  className="absolute inset-0 grid place-items-center"
                  style={{ color: theme.inkSoft }}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Music2 className="size-7 opacity-60" />
                    <span className="px-6 text-xs">
                      Your photos will play here
                    </span>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Slide dots */}
            {count > 1 && (
              <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
                {photoUrls.map((_, i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full transition-all"
                    style={{
                      backgroundColor:
                        i === index % count
                          ? "#ffffff"
                          : "rgba(255,255,255,0.55)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        {config.caption.trim() && (
          <p
            className="font-serif relative z-10 mt-5 text-center text-2xl italic"
            style={{ color: theme.ink }}
          >
            {config.caption}
          </p>
        )}

        {/* Now playing + scan strip */}
        <div className="relative z-10 mt-4 flex flex-col items-center gap-2">
          <p
            className="text-[11px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: theme.inkSoft }}
          >
            Now Playing
          </p>
          <ScanCode seed={songLabel} barColor={theme.scanBar} />
          <p
            className="text-xs font-medium tracking-wide"
            style={{ color: theme.ink }}
          >
            {songLabel}
            {config.artist.trim() ? ` · ${config.artist}` : ""}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
