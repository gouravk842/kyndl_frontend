"use client";

import { motion } from "framer-motion";

/**
 * Dark metal frame from the stage asset. The photo sits inside the gold
 * stroke, drops onto the podium, and a sheen crosses the glass as it settles.
 * Size comes from the stage slot so the last memory stays inside the room.
 */
export function HeroMemory({
  url,
  glow,
  caption,
  reducedMotion,
}: {
  url: string | null;
  glow: string;
  caption: string;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      className="relative z-20 aspect-[4/3] w-full max-h-[calc(100cqh-4.5rem)] max-w-full"
      variants={{
        initial: reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -36, scale: 0.94 },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: reducedMotion ? 0.2 : 0.85,
            ease: [0.16, 1, 0.3, 1],
          },
        },
        exit: {
          opacity: 0,
          y: reducedMotion ? 0 : 10,
          scale: reducedMotion ? 1 : 0.98,
          transition: { duration: reducedMotion ? 0.15 : 0.28, ease: "easeIn" },
        },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div
        className="absolute inset-[12%] overflow-hidden bg-[#1c120c]"
        style={{
          boxShadow: `0 18px 40px rgba(0,0,0,0.45), 0 0 32px ${glow}66`,
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned or object URL
          <img
            src={url}
            alt={caption || "A memory"}
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full" style={{ background: glow }} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15" />
        {reducedMotion ? null : (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{
              background:
                "linear-gradient(105deg, transparent, rgba(255,244,214,0.42), transparent)",
            }}
            initial={{ left: "-40%" }}
            animate={{ left: "120%" }}
            transition={{ duration: 0.9, delay: 0.35, ease: "easeInOut" }}
          />
        )}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- static stage asset */}
      <img
        src="/memory-lantern/frame.svg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </motion.div>
  );
}
