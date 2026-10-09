"use client";

import { ExperienceIcon } from "@/components/shared/experience-icon";
import { cn } from "@/lib/utils";

/**
 * A small, bespoke "scene" that previews what an experience actually is —
 * mini polaroids for the scrapbook, a star map for the constellation, a jar of
 * folded notes, map pins on a route, and so on. These are pure CSS/SVG motifs
 * (no assets, no data) keyed by slug, with a graceful icon fallback so any new
 * or unknown experience still renders. The card overlays its own icon + status.
 */

type SceneExp = {
  slug: string;
  icon: string;
  name: string;
  previewGradient: string;
};

const DARK_SLUGS = new Set(["constellation", "proposal"]);

export function ExperienceScene({ exp }: { exp: SceneExp }) {
  return (
    <div
      className="relative h-44 w-full overflow-hidden"
      style={{ background: exp.previewGradient }}
      aria-hidden
    >
      {/* soft top sheen so motifs read against the gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: DARK_SLUGS.has(exp.slug)
            ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)"
            : "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(255,255,255,0.45) 0%, transparent 65%)",
        }}
      />
      <Motif exp={exp} />
      {/* gentle bottom fade into the card body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/35 to-transparent" />
    </div>
  );
}

/* ── per-experience motifs ─────────────────────────────────────────── */

function Motif({ exp }: { exp: SceneExp }) {
  switch (exp.slug) {
    case "scrapbook":
      return <ScrapbookMotif />;
    case "memory-pages":
      return <MemoryPagesMotif />;
    case "constellation":
      return <ConstellationMotif />;
    case "memory-jar":
      return <MemoryJarMotif />;
    case "our-places":
      return <OurPlacesMotif />;
    case "relationship-calendar":
      return <RelationshipCalendarMotif />;
    case "ludo":
      return <LudoMotif />;
    case "whack-a-mole":
      return <WhackAMoleMotif />;
    case "countdown":
      return <CountdownMotif />;
    case "proposal":
      return <ProposalMotif />;
    case "date-ask":
      return <DateAskMotif />;
    case "time-capsule":
      return <TimeCapsuleMotif />;
    default:
      return <FallbackMotif exp={exp} />;
  }
}

/* ── shared bits ───────────────────────────────────────────────────── */

function Polaroid({
  className,
  rotate,
  photo,
  lines = 1,
}: {
  className?: string;
  rotate: number;
  photo: string;
  lines?: number;
}) {
  return (
    <div
      className={cn(
        "absolute rounded-[4px] bg-white p-1.5 pb-3 shadow-[0_10px_22px_-10px_rgba(58,42,37,0.55)]",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="h-full w-full rounded-[2px]"
        style={{ background: photo }}
      />
      <div className="mt-1 space-y-0.5">
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className="block h-[2px] rounded-full bg-[#E3CDBE]"
            style={{ width: i === 0 ? "80%" : "55%" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Scrapbook — overlapping polaroids + washi tape ────────────────── */

function ScrapbookMotif() {
  return (
    <div className="absolute inset-0">
      <Polaroid
        className="left-[14%] top-[26%] h-[5.5rem] w-[4.5rem]"
        rotate={-9}
        photo="linear-gradient(150deg,#ffd9b8,#f6a98a)"
      />
      <Polaroid
        className="left-[38%] top-[18%] h-[6rem] w-[5rem]"
        rotate={5}
        photo="linear-gradient(150deg,#ffe3c4,#f2a0a8)"
      />
      {/* washi tape on the top polaroid */}
      <span
        className="kyndl-tape absolute left-[50%] top-[15%] h-4 w-12 -translate-x-1/2 rotate-[6deg] rounded-[1px] bg-[#ff9a7b]/55"
        aria-hidden
      />
      <Polaroid
        className="right-[12%] top-[30%] h-[5rem] w-[4.25rem]"
        rotate={11}
        photo="linear-gradient(150deg,#ffe9cf,#e8a06f)"
      />
    </div>
  );
}

/* ── Memory Pages — an open, page-turning album ────────────────────── */

function MemoryPagesMotif() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[7.5rem] w-[12rem] rounded-[6px] bg-[#f7f0e1] shadow-[0_16px_34px_-16px_rgba(74,52,42,0.6)]">
        {/* center spine */}
        <span className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[#d9c4a3]" />
        {/* left leaf — ruled lines */}
        <div className="absolute inset-y-3 left-3 right-[52%] space-y-[6px] pt-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="block h-[2px] rounded-full bg-[#dcc7a6]"
              style={{ width: `${85 - i * 8}%` }}
            />
          ))}
        </div>
        {/* right leaf — a polaroid */}
        <div className="absolute right-4 top-4 h-[4.25rem] w-[3.5rem] rotate-[4deg] rounded-[3px] bg-white p-1 pb-2 shadow-[0_8px_18px_-9px_rgba(58,42,37,0.5)]">
          <div className="h-full w-full rounded-[2px] bg-[linear-gradient(150deg,#ffd9b3,#f0a87f)]" />
        </div>
        {/* turning page corner */}
        <span className="absolute bottom-0 right-0 size-6 rounded-tl-[10px] bg-[#efe1c8] shadow-[-4px_-4px_8px_-4px_rgba(74,52,42,0.4)]" />
      </div>
    </div>
  );
}

/* ── Constellation — stars joined into a hidden shape ──────────────── */

function ConstellationMotif() {
  // a loose heart traced from star to star
  const stars = [
    { x: 30, y: 42 },
    { x: 38, y: 30 },
    { x: 50, y: 38 },
    { x: 62, y: 30 },
    { x: 70, y: 42 },
    { x: 50, y: 64 },
  ];
  const path = "M30,42 L38,30 L50,38 L62,30 L70,42 L50,64 Z";
  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 100 88"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* scattered faint stars */}
        {[
          [12, 20],
          [86, 18],
          [20, 70],
          [82, 66],
          [46, 14],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.7" fill="#ffffff" opacity="0.5" />
        ))}
        <path
          d={path}
          fill="none"
          stroke="#ffd9a8"
          strokeWidth="0.7"
          opacity="0.75"
        />
        {stars.map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r="2.6" fill="#ffe9c4" opacity="0.25" />
            <circle cx={s.x} cy={s.y} r="1.2" fill="#fff6e6" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Memory Jar — a glass jar of folded notes ──────────────────────── */

function MemoryJarMotif() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-3">
      <div className="relative h-[8.5rem] w-[6.5rem]">
        {/* lid */}
        <span className="absolute left-1/2 top-0 h-3 w-[3.25rem] -translate-x-1/2 rounded-[4px] bg-[#cfa06a]" />
        <span className="absolute left-1/2 top-[10px] h-2 w-[3.75rem] -translate-x-1/2 rounded-[3px] bg-[#b9874f]" />
        {/* glass body */}
        <div className="absolute inset-x-1 bottom-0 top-[18px] overflow-hidden rounded-[10px] rounded-t-[18px] border border-white/70 bg-white/35 shadow-[inset_0_2px_8px_rgba(255,255,255,0.6),0_12px_26px_-14px_rgba(120,82,46,0.5)] backdrop-blur-[1px]">
          {/* folded notes */}
          {[
            { l: "8%", b: "6%", r: -12, bg: "#fff3e6" },
            { l: "40%", b: "4%", r: 8, bg: "#ffe9d2" },
            { l: "60%", b: "16%", r: -6, bg: "#fff" },
            { l: "20%", b: "30%", r: 14, bg: "#ffeede" },
            { l: "46%", b: "40%", r: -10, bg: "#fff6ec" },
          ].map((n, i) => (
            <span
              key={i}
              className="absolute h-4 w-6 rounded-[2px] shadow-[0_4px_8px_-4px_rgba(58,42,37,0.4)]"
              style={{
                left: n.l,
                bottom: n.b,
                background: n.bg,
                transform: `rotate(${n.r}deg)`,
              }}
            />
          ))}
          {/* glass highlight */}
          <span className="absolute left-2 top-2 h-12 w-2 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}

/* ── Our Places — map pins along a dotted route ────────────────────── */

function OurPlacesMotif() {
  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 100 88"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M16,64 C34,64 30,30 50,32 C70,34 64,20 84,22"
          fill="none"
          stroke="#C75B39"
          strokeWidth="1.1"
          strokeDasharray="3 3"
          opacity="0.55"
        />
      </svg>
      <Pin className="left-[14%] top-[60%]" size="sm" />
      <Pin className="left-[46%] top-[26%]" size="lg" glow />
      <Pin className="left-[80%] top-[16%]" size="sm" />
    </div>
  );
}

function Pin({
  className,
  size = "sm",
  glow = false,
}: {
  className?: string;
  size?: "sm" | "lg";
  glow?: boolean;
}) {
  const dim = size === "lg" ? "size-7" : "size-5";
  return (
    <span
      className={cn("absolute -translate-x-1/2 -translate-y-full", className)}
    >
      {glow && (
        <span className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF7A59]/35 blur-md" />
      )}
      <span
        className={cn(
          "relative flex items-center justify-center rounded-full rounded-bl-none bg-gradient-to-br from-[#FF7A59] to-[#F2596F] shadow-[0_6px_12px_-5px_rgba(242,89,111,0.7)]",
          dim,
        )}
        style={{ transform: "rotate(45deg)" }}
      >
        <span
          className="size-1.5 rounded-full bg-white"
          style={{ transform: "rotate(-45deg)" }}
        />
      </span>
    </span>
  );
}

/* ── Relationship Calendar — mini ornate month grid ───────────────── */

function RelationshipCalendarMotif() {
  const days = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="relative w-[11.5rem] rounded-[4px] border border-[#D4A373]/70 bg-[#fbf6ee] p-2 shadow-[0_14px_28px_-16px_rgba(58,42,37,0.55)]">
        <div className="mb-1.5 text-center font-serif text-[10px] tracking-wide text-[#8B6B4A]">
          AUGUST
        </div>
        <div className="grid grid-cols-7 gap-px">
          {days.map((d, i) => (
            <span
              key={i}
              className="relative flex aspect-square items-start justify-start rounded-[1px] bg-[#f3e8d8]/80 p-[2px] text-[7px] text-[#5c4033]"
            >
              {d ?? ""}
              {(d === 2 || d === 15 || d === 28) && (
                <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#B11226]/70" />
              )}
            </span>
          ))}
        </div>
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-[#D4A373]/80" />
      </div>
    </div>
  );
}

/* ── Ludo for Two — a die + four tokens ────────────────────────────── */

function LudoMotif() {
  const tokens = [
    { c: "#F2596F", cls: "left-[16%] top-[26%]" },
    { c: "#F0A13D", cls: "right-[18%] top-[24%]" },
    { c: "#2fb672", cls: "left-[20%] bottom-[22%]" },
    { c: "#5b9bd5", cls: "right-[20%] bottom-[24%]" },
  ];
  return (
    <div className="absolute inset-0">
      {tokens.map((t, i) => (
        <span
          key={i}
          className={cn(
            "absolute size-5 rounded-full border-2 border-white/80",
            t.cls,
          )}
          style={{
            background: t.c,
            boxShadow: "0 6px 12px -6px rgba(58,42,37,0.5)",
          }}
        />
      ))}
      {/* die */}
      <div className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 grid-cols-3 grid-rows-3 gap-0.5 rounded-[10px] bg-white p-2 shadow-[0_12px_26px_-12px_rgba(58,42,37,0.55)]">
        {[0, 2, 4, 6, 8].map((i) => (
          <span
            key={i}
            className="size-1.5 self-center justify-self-center rounded-full bg-[#3A2A25]"
            style={{ gridArea: pip(i) }}
          />
        ))}
      </div>
    </div>
  );
}

function WhackAMoleMotif() {
  return (
    <div className="absolute inset-0">
      {[
        { cls: "left-[22%] top-[28%]", delay: "0s" },
        { cls: "right-[24%] top-[32%]", delay: "0.15s" },
        { cls: "left-[40%] bottom-[26%]", delay: "0.3s" },
      ].map((h, i) => (
        <span
          key={i}
          className={cn(
            "absolute size-10 overflow-hidden rounded-full border-2 border-white/70 bg-[#c75b39]",
            h.cls,
          )}
          style={{
            boxShadow: "0 10px 18px -10px rgba(58,42,37,0.55)",
            animation: `kyndl-mole-bob 1.6s ease-in-out ${h.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes kyndl-mole-bob {
          0%, 100% { transform: translateY(6px) scale(0.92); }
          50% { transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// place 5 pips (corners + center) on a 3×3 grid
function pip(i: number): string {
  const map: Record<number, string> = {
    0: "1 / 1",
    2: "1 / 3",
    4: "2 / 2",
    6: "3 / 1",
    8: "3 / 3",
  };
  return map[i] ?? "2 / 2";
}

/* ── Countdown — digit tiles ticking down ──────────────────────────── */

function CountdownMotif() {
  const tiles = ["0", "2", "1", "9"];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-1.5">
      {tiles.map((d, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="relative flex h-12 w-9 items-center justify-center rounded-[7px] bg-white font-display text-2xl text-[#C75B39] shadow-[0_10px_22px_-12px_rgba(58,42,37,0.5)]">
            {d}
            <span className="absolute inset-x-0 top-1/2 h-px bg-[#F2DACE]" />
          </span>
          {i === 1 && (
            <span className="flex flex-col gap-1.5">
              <span className="size-1 rounded-full bg-[#C75B39]" />
              <span className="size-1 rounded-full bg-[#C75B39]" />
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/* ── The Big Question — a sealed letter under a night sky ──────────── */

function ProposalMotif() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* faint sparkles */}
      {[
        [18, 24],
        [80, 22],
        [26, 70],
        [78, 66],
      ].map(([l, t], i) => (
        <span
          key={i}
          className="absolute size-1 rounded-full bg-white/60"
          style={{ left: `${l}%`, top: `${t}%` }}
        />
      ))}
      <div className="relative h-[5.5rem] w-[8.5rem] rounded-[6px] bg-[#f7ece6] shadow-[0_18px_34px_-16px_rgba(0,0,0,0.7)]">
        {/* flap */}
        <span
          className="absolute inset-x-0 top-0 h-[55%]"
          style={{
            background: "linear-gradient(180deg,#fff5ee,#ecdcd2)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
        {/* wax-seal heart */}
        <span className="absolute left-1/2 top-[46%] flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#f4768e] to-[#c81d4e] shadow-[0_6px_12px_-5px_rgba(200,29,78,0.8)]">
          <span
            className="block size-2.5 bg-white/90"
            style={{
              clipPath:
                "path('M5 9 C2 6 0 4 0 2.2 A2.2 2.2 0 0 1 5 1 A2.2 2.2 0 0 1 10 2.2 C10 4 8 6 5 9 Z')",
            }}
          />
        </span>
      </div>
    </div>
  );
}

/* ── Will You Go Out With Me? — a soft letter with a question ──────── */

function DateAskMotif() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[5.5rem] w-[8.5rem] rotate-[-3deg] rounded-[6px] bg-white shadow-[0_16px_30px_-16px_rgba(214,80,110,0.6)]">
        <span
          className="absolute inset-x-0 top-0 h-[52%]"
          style={{
            background: "linear-gradient(180deg,#ffe1e6,#ffc5cf)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
        <span className="absolute left-1/2 top-[58%] flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb3c1] to-[#f4768e] font-display text-base text-white shadow-[0_6px_12px_-5px_rgba(244,118,142,0.7)]">
          ?
        </span>
      </div>
    </div>
  );
}

/* ── Time Capsule — an hourglass sealed for later ──────────────────── */

function TimeCapsuleMotif() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex h-24 w-16 flex-col items-center">
        <span className="h-2 w-14 rounded-full bg-[#cfa06a]" />
        <div className="relative flex-1">
          <svg viewBox="0 0 60 80" className="h-full w-auto">
            <path
              d="M8 4 H52 L32 40 L52 76 H8 L28 40 Z"
              fill="rgba(255,255,255,0.45)"
              stroke="#C9925A"
              strokeWidth="2.5"
            />
            {/* top sand */}
            <path d="M14 10 H46 L31 36 Z" fill="#f0b06a" opacity="0.85" />
            {/* bottom sand */}
            <path d="M16 72 H44 L30 50 Z" fill="#e89f5a" opacity="0.9" />
            <line
              x1="30"
              y1="38"
              x2="30"
              y2="50"
              stroke="#f0b06a"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <span className="h-2 w-14 rounded-full bg-[#cfa06a]" />
      </div>
    </div>
  );
}

/* ── Fallback — a large centered icon medallion ────────────────────── */

function FallbackMotif({ exp }: { exp: SceneExp }) {
  const dark = DARK_SLUGS.has(exp.slug);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        className={cn(
          "flex size-20 items-center justify-center rounded-3xl border backdrop-blur-sm",
          dark
            ? "border-white/20 bg-white/10 text-white"
            : "border-white/60 bg-white/75 text-[#FF7A59]",
        )}
      >
        <ExperienceIcon name={exp.icon} className="size-9" />
      </span>
    </div>
  );
}
