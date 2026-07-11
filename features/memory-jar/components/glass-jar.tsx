"use client";

import { motion, useAnimationControls } from "framer-motion";
import type { ReactNode } from "react";

type LidControls = ReturnType<typeof useAnimationControls>;

/**
 * A layered-SVG mason jar that reads like real glass.
 *
 * The silhouette is drawn twice: a back layer (glass body, tint, soft inner
 * shadow) and a front layer (refraction highlights, reflections, a full-body
 * glass film, twine bow + charm) rendered with `pointer-events: none`. Note
 * slips are slotted between the two layers via {@link GlassJarProps.notesSlot},
 * so they sit *inside* the glass — visible through the film yet still clickable.
 *
 * The lid is a natural cork stopper on its own animated layer so it can lift
 * off the rim when a note is taken out; drive it with {@link GlassJarProps.lidControls}.
 */
type GlassJarProps = {
  /** Folded notes, positioned to fall in the jar's interior. */
  notesSlot?: ReactNode;
  jarLabel?: string;
  /** Framer controls that lift/settle the lid during extraction. */
  lidControls?: LidControls;
};

// Jar silhouette shared by the back fill and the front clip.
const JAR_PATH =
  "M98 78 L202 78 L202 100 C202 114 248 116 250 156 L250 344 Q250 374 218 374 L82 374 Q50 374 50 344 L50 156 C52 116 98 114 98 100 Z";

/** A small filled heart, used to dress the vintage label. */
function HeartMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21s-7-4.6-9.3-9.1C1.2 8.7 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.3 0 4.8 3.2 3.3 6.4C19 16.4 12 21 12 21Z"
        fill="#cf8f97"
      />
    </svg>
  );
}

/** A little laurel sprig that underlines the label text. */
function LeafSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 12"
      className={className}
      aria-hidden
      fill="none"
      stroke="#a98a5c"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M32 1 V10" />
      <path d="M32 4 C26 2 22 3 19 6" />
      <path d="M32 7 C27 6 23 7 21 10" />
      <path d="M32 4 C38 2 42 3 45 6" />
      <path d="M32 7 C37 6 41 7 43 10" />
    </svg>
  );
}

export function GlassJar({ notesSlot, jarLabel, lidControls }: GlassJarProps) {
  return (
    <div className="relative aspect-[3/4] w-full">
      {/* Ground shadow under the jar */}
      <div
        aria-hidden
        className="absolute bottom-[3%] left-1/2 h-[6%] w-[66%] -translate-x-1/2 rounded-[50%] blur-md"
        style={{ background: "rgba(80,55,40,0.3)" }}
      />

      {/* BACK: glass body + tint + inner shadow */}
      <svg
        aria-hidden
        viewBox="0 0 300 400"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(245,236,224,0.16)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="1" stopColor="rgba(180,150,120,0.14)" />
          </linearGradient>
          <radialGradient id="jarInner" cx="0.5" cy="0.32" r="0.85">
            <stop offset="0" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="0.7" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="1" stopColor="rgba(120,95,70,0.18)" />
          </radialGradient>
        </defs>
        <path d={JAR_PATH} fill="url(#jarGlass)" />
        <path d={JAR_PATH} fill="url(#jarInner)" />
        {/* crisp glass edge so the container reads as solid */}
        <path
          d={JAR_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />
      </svg>

      {/* NOTES — slotted between the glass back and the highlights */}
      {notesSlot}

      {/* FRONT: refraction, reflections, glass film, twine (never blocks clicks) */}
      <svg
        aria-hidden
        viewBox="0 0 300 400"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="jarRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          <linearGradient id="bodyFilm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.14)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          <filter id="soften" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* clip everything glassy to the jar body */}
        <clipPath id="jarClip">
          <path d={JAR_PATH} />
        </clipPath>
        <g clipPath="url(#jarClip)">
          {/* full-body glass film so notes read as behind glass */}
          <rect x="40" y="90" width="220" height="292" fill="url(#bodyFilm)" />
          {/* bright left refraction strip */}
          <rect
            x="72"
            y="150"
            width="16"
            height="190"
            rx="8"
            fill="rgba(255,255,255,0.6)"
            filter="url(#soften)"
          />
          {/* secondary faint left line */}
          <rect
            x="96"
            y="170"
            width="6"
            height="150"
            rx="3"
            fill="rgba(255,255,255,0.3)"
            filter="url(#soften)"
          />
          {/* narrower, darker right reflection */}
          <rect
            x="222"
            y="160"
            width="10"
            height="170"
            rx="5"
            fill="rgba(255,255,255,0.14)"
            filter="url(#soften)"
          />
          {/* top sheen across the shoulders */}
          <ellipse
            cx="150"
            cy="150"
            rx="92"
            ry="22"
            fill="rgba(255,255,255,0.26)"
            filter="url(#soften)"
          />
        </g>

        {/* rim / mouth of the jar */}
        <rect
          x="92"
          y="74"
          width="116"
          height="16"
          rx="8"
          fill="url(#jarRim)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />
        {/* the dark opening, revealed when the lid lifts */}
        <ellipse cx="150" cy="78" rx="56" ry="7" fill="rgba(60,40,28,0.28)" />

        {/* twine wrapped at the neck, tied in a bow with a wooden heart charm */}
        <g>
          {/* wrap strands around the neck */}
          <path
            d="M99 108 Q150 113 201 108"
            fill="none"
            stroke="#a98a5c"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M99 115 Q150 120 201 115"
            fill="none"
            stroke="#c1a26e"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M101 121 Q150 125 199 121"
            fill="none"
            stroke="#8f7248"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* dangling string + pink wooden heart charm */}
          <path d="M150 112 L150 129" stroke="#a98a5c" strokeWidth="1.5" />
          <path
            d="M150 150 C144 143 136 140 136 134 C136 130 139 127 143 128 C146 129 148 131 150 134 C152 131 154 129 157 128 C161 127 164 130 164 134 C164 140 156 143 150 150 Z"
            fill="#e3a3ab"
            stroke="#c9848d"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <ellipse cx="146" cy="134" rx="2.6" ry="1.8" fill="rgba(255,255,255,0.45)" />

          {/* the bow — two loops, a knot, two tails */}
          <path
            d="M150 110 C136 101 122 104 124 112 C125 118 139 117 150 110 Z"
            fill="#c8ab77"
            stroke="#9c8050"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <path
            d="M150 110 C164 101 178 104 176 112 C175 118 161 117 150 110 Z"
            fill="#c8ab77"
            stroke="#9c8050"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <path
            d="M150 111 C147 119 143 125 139 131"
            fill="none"
            stroke="#b0925f"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M150 111 C153 119 157 125 161 131"
            fill="none"
            stroke="#b0925f"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <ellipse
            cx="150"
            cy="110"
            rx="4.5"
            ry="4"
            fill="#b0925f"
            stroke="#8c7043"
            strokeWidth="0.8"
          />
        </g>
      </svg>

      {/* LID — a natural cork stopper, its own layer so it can unseal */}
      <motion.div
        aria-hidden
        className="absolute left-[28%] top-[6.5%] w-[44%]"
        style={{ aspectRatio: "132 / 54", transformOrigin: "50% 92%" }}
        initial={{ y: "0%", rotate: 0 }}
        animate={lidControls}
      >
        <svg viewBox="0 0 132 54" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="corkBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d8b784" />
              <stop offset="0.45" stopColor="#c49f6b" />
              <stop offset="1" stopColor="#a5824f" />
            </linearGradient>
            <radialGradient id="corkTop" cx="0.5" cy="0.4" r="0.75">
              <stop offset="0" stopColor="#e5cb99" />
              <stop offset="1" stopColor="#c2a06a" />
            </radialGradient>
          </defs>
          {/* stopper body, tapering slightly into the neck */}
          <path
            d="M12 22 Q12 14 22 14 L110 14 Q120 14 120 22 L116 44 Q116 52 106 52 L26 52 Q16 52 16 44 Z"
            fill="url(#corkBody)"
          />
          {/* domed cork top */}
          <ellipse cx="66" cy="14" rx="50" ry="11" fill="url(#corkTop)" />
          {/* stippled cork grain — darker flecks */}
          <g fill="rgba(120,88,52,0.3)">
            <ellipse cx="40" cy="30" rx="3" ry="2" />
            <ellipse cx="58" cy="40" rx="2.5" ry="1.8" />
            <ellipse cx="80" cy="28" rx="3.2" ry="2.2" />
            <ellipse cx="95" cy="38" rx="2.4" ry="1.6" />
            <ellipse cx="70" cy="46" rx="2.6" ry="1.8" />
            <ellipse cx="48" cy="22" rx="2.2" ry="1.6" />
            <ellipse cx="104" cy="30" rx="2" ry="1.5" />
          </g>
          {/* lighter flecks */}
          <g fill="rgba(245,228,198,0.55)">
            <ellipse cx="52" cy="34" rx="2" ry="1.4" />
            <ellipse cx="86" cy="44" rx="1.8" ry="1.3" />
            <ellipse cx="66" cy="26" rx="2" ry="1.4" />
          </g>
          {/* soft edge highlight + shadow so it reads as round */}
          <path
            d="M24 20 Q20 34 26 48"
            fill="none"
            stroke="rgba(255,246,228,0.45)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M112 20 Q116 34 108 48"
            fill="none"
            stroke="rgba(120,88,52,0.3)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* etched vintage label plaque on the glass */}
      {jarLabel ? (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[13%] left-1/2 w-[54%] -translate-x-1/2"
        >
          <div
            className="relative rounded-[16px] px-4 py-3 text-center"
            style={{
              background: "linear-gradient(160deg, #fdf6e8 0%, #f2e5cd 100%)",
              boxShadow:
                "0 2px 5px rgba(60,40,25,0.18), inset 0 0 0 1.5px rgba(150,112,74,0.4), inset 0 0 0 5px rgba(253,246,232,0.7), inset 0 0 0 6.5px rgba(150,112,74,0.2)",
            }}
          >
            <div className="mb-0.5 flex items-center justify-center gap-1.5">
              <HeartMark className="h-2 w-2" />
              <HeartMark className="h-2.5 w-2.5" />
              <HeartMark className="h-2 w-2" />
            </div>
            <span
              className="font-hand block leading-tight text-[clamp(0.8rem,2.5vw,1.1rem)]"
              style={{ color: "#9a5f5f" }}
            >
              {jarLabel}
            </span>
            <LeafSprig className="mx-auto mt-1 h-2.5 w-16" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
