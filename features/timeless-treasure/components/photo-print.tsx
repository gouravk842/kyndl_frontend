"use client";

import { motion, type Variants } from "framer-motion";

import type { TreasureTheme } from "../config";

/**
 * One print pulled from the pocket — a photo mounted on heavy cream cardstock,
 * held with a strip of tape. If the sender wrote a line for this memory it sits
 * *beside* the photo in their hand (as if pencilled in the album margin), not
 * underneath; with no caption the print stands on its own, a touch wider.
 *
 * As the card swings out of the pocket the photo *develops* — arriving sepia and
 * soft, blooming to sharp full colour — driven off the `hidden`/`visible`
 * variant labels the stage propagates, so landing on a memory always re-develops
 * it and folding it away un-develops it.
 */

const developVariants: Variants = {
  hidden: {
    filter: "sepia(0.9) saturate(0.6) contrast(0.92) blur(6px)",
    scale: 1.06,
  },
  visible: {
    filter: "sepia(0) saturate(1) contrast(1) blur(0px)",
    scale: 1,
    transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
};

export function PhotoPrint({
  url,
  caption,
  date,
  theme,
  tilt,
  reduceMotion,
}: {
  url: string | null;
  caption: string;
  date: string;
  theme: TreasureTheme;
  tilt: number;
  reduceMotion: boolean | null;
}) {
  const note = caption.trim();
  const stamp = date.trim();
  const hasSide = Boolean(note || stamp);

  return (
    <div
      className="relative flex items-stretch gap-3 rounded-[4px] p-3"
      style={{
        background: theme.paper,
        transform: `rotate(${tilt}deg)`,
        boxShadow:
          "0 26px 40px -22px rgba(0,0,0,0.55), 0 3px 8px -3px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    >
      {/* paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[4px] opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* strip of tape */}
      <span
        aria-hidden
        className="absolute -top-2.5 left-8 h-5 w-16 -rotate-2 rounded-[1px]"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.55), rgba(230,222,205,0.4))",
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          backdropFilter: "blur(1px)",
        }}
      />

      {/* the photo */}
      <div
        className="relative shrink-0 overflow-hidden rounded-[2px] bg-black/[0.06]"
        style={{ width: hasSide ? 184 : 224, aspectRatio: "4 / 5" }}
      >
        {url ? (
          <motion.img
            src={url}
            alt={note || ""}
            className="h-full w-full object-cover"
            variants={reduceMotion ? undefined : developVariants}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-black/[0.05]">
            <span className="text-[10px] tracking-[0.34em] text-black/30 uppercase">
              photo
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 26px rgba(0,0,0,0.16)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 34%)",
          }}
        />
      </div>

      {/* the sender's lines, pencilled in the margin beside the photo */}
      {hasSide && (
        <div className="relative flex w-[128px] flex-col py-1">
          {stamp && (
            <p
              className="mb-2 text-[10px] font-semibold tracking-[0.22em] uppercase"
              style={{ color: theme.ink, opacity: 0.5 }}
            >
              {stamp}
            </p>
          )}
          {note && (
            <p
              className="font-hand text-[19px] leading-snug break-words whitespace-pre-line"
              style={{ color: theme.ink }}
            >
              {note}
            </p>
          )}
          {/* faint ruled margin line */}
          <span
            aria-hidden
            className="absolute top-1 bottom-1 -left-1.5 w-px"
            style={{ background: theme.paperEdge }}
          />
        </div>
      )}
    </div>
  );
}
