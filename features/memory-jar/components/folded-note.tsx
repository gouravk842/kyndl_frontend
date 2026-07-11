"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { JarNote } from "@/features/memory-jar/config";

type FoldedNoteProps = {
  note: JarNote;
  index: number;
  /** Where the scroll sits inside the jar (percentages within the notes layer). */
  position: { left: string; top: string; z: number };
  onOpen: () => void;
};

/**
 * A little rolled-up scroll resting in the jar. Drawn as a parchment tube with
 * spiral-rolled ends and a ribbon tied round the middle, tinted with the note's
 * own paper tone so the pile looks hand-filled. Lifts and wobbles on hover;
 * opens on click / Enter / Space. When opened it's removed from the jar, so its
 * AnimatePresence `exit` plays it rising up and out through the mouth.
 */
export function FoldedNote({ note, index, position, onOpen }: FoldedNoteProps) {
  const reduceMotion = useReducedMotion();
  const shadeId = `scroll-shade-${note.id}`;

  return (
    <motion.button
      type="button"
      aria-label={`Open note ${note.id}: ${note.title}`}
      onClick={onOpen}
      className="group absolute h-[13%] w-[32%] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A59] focus-visible:ring-offset-2"
      style={{
        left: position.left,
        top: position.top,
        zIndex: position.z,
        transformOrigin: "center",
      }}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: -14, rotate: note.rotation * 0.4 }
      }
      animate={{ opacity: 1, y: 0, rotate: note.rotation }}
      exit={
        reduceMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              y: "-130%",
              scale: 0.8,
              transition: { duration: 0.42, ease: "easeOut" },
            }
      }
      transition={{
        delay: reduceMotion ? 0 : 0.5 + index * 0.1,
        type: "spring",
        stiffness: 220,
        damping: 18,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -6, rotate: note.rotation, scale: 1.08, zIndex: 90 }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      <svg
        viewBox="0 0 120 44"
        className="h-full w-full overflow-visible drop-shadow-[1px_2px_4px_rgba(60,40,25,0.28)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* cylinder shading — light along the top, shadow along the bottom */}
          <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="0.42" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="1" stopColor="rgba(85,58,32,0.4)" />
          </linearGradient>
        </defs>

        {/* the rolled paper tube */}
        <rect x="8" y="9" width="104" height="26" rx="13" fill={note.paperTone} />
        <rect x="8" y="9" width="104" height="26" rx="13" fill={`url(#${shadeId})`} />

        {/* faint rolled-layer seams near each end */}
        <path
          d="M28 11 V33"
          stroke="rgba(85,58,32,0.16)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M92 11 V33"
          stroke="rgba(85,58,32,0.16)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* spiral-rolled ends (the cut edge of the coiled paper) */}
        {[16, 104].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="22" rx="9" ry="14" fill={note.paperTone} />
            <ellipse cx={cx} cy="22" rx="9" ry="14" fill="rgba(85,58,32,0.16)" />
            <ellipse
              cx={cx}
              cy="22"
              rx="9"
              ry="14"
              fill="none"
              stroke="rgba(85,58,32,0.3)"
              strokeWidth="1.1"
            />
            <ellipse
              cx={cx}
              cy="22"
              rx="4.4"
              ry="7.5"
              fill="none"
              stroke="rgba(85,58,32,0.32)"
              strokeWidth="1.1"
            />
            <ellipse
              cx={cx}
              cy="22"
              rx="1.4"
              ry="2.6"
              fill="rgba(85,58,32,0.4)"
            />
            <ellipse
              cx={cx - 2.6}
              cy="17"
              rx="2.2"
              ry="3.4"
              fill="rgba(255,255,255,0.45)"
            />
          </g>
        ))}

        {/* ribbon tied round the middle, with a little knot + tails */}
        <rect x="52" y="7" width="16" height="30" rx="2.5" fill="#c85447" />
        <rect x="52" y="7" width="16" height="30" fill={`url(#${shadeId})`} opacity="0.6" />
        <path
          d="M60 24 C57 30 52 33 49 40"
          fill="none"
          stroke="#b0453c"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M60 24 C63 30 68 33 71 40"
          fill="none"
          stroke="#b0453c"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="60" cy="22" r="4.2" fill="#9c3b34" />
        <circle cx="58.5" cy="20.5" r="1.4" fill="rgba(255,255,255,0.4)" />
      </svg>
    </motion.button>
  );
}
