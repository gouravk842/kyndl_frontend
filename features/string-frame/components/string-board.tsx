"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ImagePlus } from "lucide-react";

import type { FrameTheme, StringFrameConfig } from "../config";

/** How many photo-leaves hang from one branch before a new row starts. */
const PER_ROW = 3;

/** A small deterministic tilt (deg) for a hung photo, by its position. */
const TILTS = [-5, 4, -3, 5, -4, 3, 6, -6];
/** Deterministic twine lengths (px) so hung leaves stagger like the real thing. */
const DROPS = [26, 40, 30, 44, 22, 36, 28, 42];

/** The autumn/evergreen palette the leaf cluster behind the name fans through. */
const LEAF_COLORS = [
  "#5f8f3a",
  "#8bad3f",
  "#c99a2e",
  "#d97a2b",
  "#a8531f",
  "#6f9a44",
];

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

/**
 * The "Nature Unfolding" Rodrick Frame: a weathered driftwood branch strung with
 * fine twine, from which a fan of preserved leaves hangs cradling the big
 * hand-drawn name (with little leaf-emblems tucked among them), and the
 * recipient's photos hang below as leaf-clasped prints — all shown at once. With
 * no photos it hangs soft leaf placeholders so the frame still reads on the
 * marketing page. Colours are driven by the theme, so all four palettes work.
 */
export function StringBoard({
  config,
  photoUrls,
  theme,
}: {
  config: StringFrameConfig;
  /** Resolved, in-order photo URLs (already filtered to those that exist). */
  photoUrls: string[];
  theme: FrameTheme;
}) {
  const reduceMotion = useReducedMotion();

  // Real photos when present, else three placeholder leaves so the frame reads.
  const slots: (string | null)[] =
    photoUrls.length > 0 ? photoUrls : [null, null, null];
  const rows = chunk(slots, PER_ROW);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[430px] px-4 pt-2 pb-6"
    >
      {/* The driftwood branch the whole frame hangs from */}
      <Branch />

      {/* Name cluster — a fan of leaves cradling the big colourful name, hung
          from the branch by two twines. */}
      <div className="relative z-10 flex flex-col items-center">
        <TwinePair />
        <NameCluster
          name={config.name || "Name"}
          palette={theme.namePalette}
          sway={!reduceMotion}
        />
      </div>

      {/* The hanging photo-leaves */}
      <div className="relative z-10 mt-2 space-y-8">
        {rows.map((row, r) => (
          <div key={r} className="flex items-start justify-center gap-4 sm:gap-6">
            {row.map((url, i) => {
              const idx = r * PER_ROW + i;
              return (
                <HangingPhoto
                  key={`${r}-${i}`}
                  url={url}
                  twine={theme.twine}
                  clip={theme.clip}
                  leaf={LEAF_COLORS[idx % LEAF_COLORS.length]!}
                  tilt={TILTS[idx % TILTS.length] ?? 0}
                  drop={DROPS[idx % DROPS.length] ?? 30}
                  delay={reduceMotion ? 0 : 0.15 + idx * 0.12}
                  sway={!reduceMotion}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Caption — a small carved wooden tag */}
      {config.caption.trim() && (
        <div className="relative z-10 mt-8 flex justify-center">
          <WoodTag>{config.caption}</WoodTag>
        </div>
      )}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Branch & twine                                                            */
/* -------------------------------------------------------------------------- */

/** A weathered driftwood branch spanning the top, with a leafy sprig. */
function Branch() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0">
      <svg viewBox="0 0 430 46" className="h-auto w-full" fill="none">
        <defs>
          <linearGradient id="sf-bark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c5a3a" />
            <stop offset="0.5" stopColor="#5e4126" />
            <stop offset="1" stopColor="#3f2b16" />
          </linearGradient>
        </defs>
        {/* the branch itself, gently tapering */}
        <path
          d="M2 18 C90 8 180 10 250 16 C320 22 380 20 428 12 L428 26 C380 33 320 35 250 30 C180 24 90 22 6 30 Z"
          fill="url(#sf-bark)"
        />
        {/* wood-grain streaks */}
        <path
          d="M20 20 C120 14 240 18 410 18"
          stroke="rgba(0,0,0,0.22)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M30 25 C140 21 260 24 405 22"
          stroke="rgba(255,240,220,0.18)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* a small leafy sprig off the right end */}
        <g transform="translate(392 6)">
          <path
            d="M0 8 C10 -4 24 -6 34 2 C22 6 10 10 0 8 Z"
            fill="#6f9a44"
          />
          <path
            d="M4 12 C12 4 26 4 34 12 C24 16 12 18 4 12 Z"
            fill="#8bad3f"
          />
        </g>
      </svg>
    </div>
  );
}

/** Two short twines that suspend the name cluster from the branch. */
function TwinePair() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 34"
      className="h-[30px] w-[120px]"
      fill="none"
    >
      <path
        d="M28 0 C24 14 30 24 34 33"
        stroke="rgba(120,92,50,0.85)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M92 0 C96 14 90 24 86 33"
        stroke="rgba(120,92,50,0.85)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Name cluster                                                              */
/* -------------------------------------------------------------------------- */

/** The leaf fan + big colourful name + tucked-in emblems. */
function NameCluster({
  name,
  palette,
  sway,
}: {
  name: string;
  palette: string[];
  sway: boolean;
}) {
  return (
    <motion.div
      className="relative -mt-1 origin-top"
      style={{ filter: "drop-shadow(0 14px 22px rgba(30,22,10,0.45))" }}
      animate={sway ? { rotate: [-1.2, 1.2, -1.2] } : undefined}
      transition={
        sway ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined
      }
    >
      {/* the fan of leaves behind the name */}
      <div className="absolute inset-0 -z-10">
        {LEAF_FAN.map((l, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(-50%,-50%) translate(${l.x}px, ${l.y}px) rotate(${l.rot}deg)`,
            }}
          >
            <Leaf color={LEAF_COLORS[i % LEAF_COLORS.length]!} width={l.w} />
          </div>
        ))}
      </div>

      {/* emblems tucked among the leaves */}
      <Emblem className="absolute -top-2 -left-3 w-6" kind="heart" color="#e0574f" />
      <Emblem className="absolute -top-3 right-2 w-8" kind="glasses" color="#3f2b16" />
      <Emblem className="absolute -bottom-1 -left-4 w-7" kind="infinity" color="#3f2b16" />

      {/* the name */}
      <div className="relative px-5 py-3">
        <ColorfulName name={name} palette={palette} />
      </div>
    </motion.div>
  );
}

/** Positions/sizes of the leaves fanned behind the name (deterministic). */
const LEAF_FAN = [
  { x: -74, y: 2, rot: -46, w: 56 },
  { x: -44, y: -14, rot: -22, w: 62 },
  { x: -8, y: -20, rot: -4, w: 66 },
  { x: 30, y: -16, rot: 16, w: 62 },
  { x: 66, y: 0, rot: 40, w: 58 },
  { x: 12, y: 16, rot: 8, w: 60 },
  { x: -34, y: 16, rot: -14, w: 56 },
];

/** The big name, each letter drawn in the next colour of the palette. */
function ColorfulName({
  name,
  palette,
}: {
  name: string;
  palette: string[];
}) {
  const chars = [...name];
  let colorIdx = 0;
  return (
    <h1 className="font-hand text-5xl leading-none font-bold sm:text-6xl">
      {chars.map((ch, i) => {
        if (ch === " ") return <span key={i}>&nbsp;</span>;
        const color = palette[colorIdx % palette.length];
        colorIdx += 1;
        // A gentle per-letter lift so the word reads hand-drawn, not typeset.
        const dy = i % 2 === 0 ? "-0.04em" : "0.05em";
        return (
          <span
            key={i}
            className="inline-block"
            style={{
              color,
              transform: `translateY(${dy}) rotate(${i % 2 === 0 ? -3 : 2}deg)`,
              textShadow:
                "0 1px 0 rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.25)",
            }}
          >
            {ch}
          </span>
        );
      })}
    </h1>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hanging photo                                                             */
/* -------------------------------------------------------------------------- */

/** One photo hung from the branch on twine, clasped by a little metal leaf. */
function HangingPhoto({
  url,
  twine,
  clip,
  leaf,
  tilt,
  drop,
  delay,
  sway,
}: {
  url: string | null;
  twine: string;
  clip: string;
  leaf: string;
  tilt: number;
  drop: number;
  delay: number;
  sway: boolean;
}) {
  return (
    <motion.div
      className="relative flex w-[84px] flex-col items-center sm:w-[96px]"
      initial={sway ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* twine drop from the branch */}
      <div
        className="w-[1.6px] rounded-full"
        style={{ height: drop, background: twine }}
      />

      <motion.div
        className="relative origin-top"
        style={{ rotate: tilt }}
        animate={
          sway ? { rotate: [tilt - 1.5, tilt + 1.5, tilt - 1.5] } : undefined
        }
        transition={
          sway
            ? { duration: 5 + (drop % 3), repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        {/* a little leaf tucked behind the print */}
        <div
          className="absolute -top-1 -right-2 z-0"
          style={{ transform: "rotate(24deg)" }}
        >
          <Leaf color={leaf} width={30} />
        </div>

        {/* metal leaf clasp */}
        <div className="absolute -top-2 left-1/2 z-20 -translate-x-1/2">
          <Clasp color={clip} />
        </div>

        {/* the print */}
        <div className="relative z-10 mt-1 w-full overflow-hidden rounded-[4px] border-[3px] border-[#faf6ee] bg-[#faf6ee] shadow-[0_10px_18px_-8px_rgba(30,22,10,0.6)]">
          <div className="aspect-[3/4] w-full" style={{ background: "#e7ded2" }}>
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-[#b6a998]">
                <ImagePlus className="size-5" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                */
/* -------------------------------------------------------------------------- */

/** A single veined leaf, sized by width. */
function Leaf({ color, width }: { color: string; width: number }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={width}
      height={(width * 120) / 100}
      fill="none"
      aria-hidden
    >
      <path
        d="M50 3 C20 26 18 74 50 117 C82 74 80 26 50 3 Z"
        fill={color}
      />
      {/* a soft highlight down one side */}
      <path
        d="M50 8 C26 30 25 70 50 110 C50 70 50 40 50 8 Z"
        fill="rgba(255,255,255,0.12)"
      />
      {/* midrib + veins */}
      <path
        d="M50 12 L50 108"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {[26, 44, 62, 80].map((y, i) => (
        <g key={i} stroke="rgba(0,0,0,0.2)" strokeWidth="1.4" strokeLinecap="round">
          <path d={`M50 ${y} C40 ${y + 2} 34 ${y + 8} 30 ${y + 14}`} />
          <path d={`M50 ${y} C60 ${y + 2} 66 ${y + 8} 70 ${y + 14}`} />
        </g>
      ))}
    </svg>
  );
}

/** A small metal leaf-shaped clasp that pinches the top of a print. */
function Clasp({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 20" className="h-4 w-5" fill="none" aria-hidden>
      <path
        d="M12 1 C4 5 4 13 12 19 C20 13 20 5 12 1 Z"
        fill={color}
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="1"
      />
      <path d="M12 4 L12 16" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    </svg>
  );
}

/** Small decorative emblems tucked among the cluster leaves. */
function Emblem({
  kind,
  color,
  className,
}: {
  kind: "heart" | "glasses" | "infinity";
  color: string;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <div
      aria-hidden
      className={`z-20 drop-shadow-sm ${className ?? ""}`}
      style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))" }}
    >
      {kind === "heart" && (
        <svg viewBox="0 0 24 22" className="w-full">
          <path
            {...common}
            fill={color}
            d="M12 20S3 14 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 6-9 12-9 12Z"
          />
        </svg>
      )}
      {kind === "glasses" && (
        <svg viewBox="0 0 44 18" className="w-full">
          <circle {...common} cx="10" cy="9" r="6" />
          <circle {...common} cx="30" cy="9" r="6" />
          <path {...common} d="M16 9h8M36 7l5-3M4 7L1 5" />
        </svg>
      )}
      {kind === "infinity" && (
        <svg viewBox="0 0 44 20" className="w-full">
          <path {...common} d="M12 10c0-4-6-4-6 0s6 4 8 0c2-4 8-4 8 0s-6 4-8 0" />
        </svg>
      )}
    </div>
  );
}

/** A small carved-wood tag the caption is burned into. */
function WoodTag({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-hand rounded-md px-4 py-1.5 text-lg"
      style={{
        background: "linear-gradient(150deg, #7c5a3a 0%, #4f371f 100%)",
        color: "#f4e8d6",
        boxShadow:
          "0 8px 16px -8px rgba(30,22,10,0.6), inset 0 1px 0 rgba(255,240,220,0.25), inset 0 -2px 4px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}
