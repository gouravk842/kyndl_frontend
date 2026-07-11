"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { Flame, Lock, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type SpinCategory,
  WHEEL_CONFIG,
  type WheelConfig,
} from "@/features/naughty-spins/config";

/**
 * The interactive Naughty Spins wheel. Reads its content from
 * {@link NaughtySpinsExperienceProps.config}, defaulting to the bundled sample so
 * the marketing page renders without wiring; the builder passes its live draft
 * for an in-place preview, and the public viewer passes a published wheel.
 *
 * Acts: an 18+ consent gate → a spinnable wheel of category wedges → a card that
 * deals a random prompt from whichever category the pointer lands on. Prompts
 * within a category don't repeat until that category's stack is used up.
 *
 * The wheel is driven by an imperative framer-motion value so we can wind it back
 * for anticipation, ease it down over several seconds, and bounce the pointer's
 * ticker each time a peg passes — the signature feel of a real prize wheel.
 */
type NaughtySpinsExperienceProps = {
  config?: WheelConfig;
  /** Skip the 18+ gate (used inside the authenticated builder preview). */
  skipGate?: boolean;
};

type Result = { category: SpinCategory; prompt: string | null };

/** Geometry of the SVG wheel (a 0–320 viewBox, centred). */
const CX = 160;
const CY = 160;
const WHEEL_R = 150; // wedge radius
const RIM_R = 158; // metallic bezel
const BULB_R = 150; // peg/bulb ring (sits on the rim seam)

// ── tiny colour helpers (lighten / darken for wedge depth) ───────────
type RGB = { r: number; g: number; b: number };
const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };

function parseHex(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = Number.parseInt(h || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function toHex(c: RGB): string {
  const h = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}
function mix(hex: string, target: RGB, amt: number): string {
  const c = parseHex(hex);
  return toHex({
    r: c.r + (target.r - c.r) * amt,
    g: c.g + (target.g - c.g) * amt,
    b: c.b + (target.b - c.b) * amt,
  });
}
const lighten = (hex: string, amt: number) => mix(hex, WHITE, amt);
const darken = (hex: string, amt: number) => mix(hex, BLACK, amt);

/** Repeat each category this many times around the wheel for a fuller board —
 *  capped so we never draw a dizzying number of slices. */
function repsFor(count: number): number {
  if (count <= 0) return 0;
  if (count <= 3) return 3;
  if (count <= 6) return 2;
  return 1;
}

type Segment = { categoryId: number; label: string; color: string };

/** Lay the categories out round-robin so repeats land opposite, never adjacent. */
function buildSegments(categories: SpinCategory[]): Segment[] {
  const reps = repsFor(categories.length);
  const out: Segment[] = [];
  for (let r = 0; r < reps; r++) {
    for (const c of categories) {
      out.push({ categoryId: c.id, label: c.label, color: c.color });
    }
  }
  return out;
}

/** A wedge path from `startAngle`→`endAngle`, measured clockwise from the top. */
function wedgePath(startAngle: number, endAngle: number, r = WHEEL_R): string {
  const a0 = ((startAngle - 90) * Math.PI) / 180;
  const a1 = ((endAngle - 90) * Math.PI) / 180;
  const x0 = CX + r * Math.cos(a0);
  const y0 = CY + r * Math.sin(a0);
  const x1 = CX + r * Math.cos(a1);
  const y1 = CY + r * Math.sin(a1);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${CX},${CY} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
}

/** A point on a ring at `angle` degrees, clockwise from the top. */
function ringPoint(angle: number, r: number): [number, number] {
  const a = (angle * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
}

// A few fixed ember positions (% of the stage) so SSR and the client agree.
const EMBERS = [
  { left: "12%", delay: 0, dur: 7, drift: 14 },
  { left: "28%", delay: 1.4, dur: 8.5, drift: -10 },
  { left: "47%", delay: 3.1, dur: 7.8, drift: 8 },
  { left: "63%", delay: 0.7, dur: 9.2, drift: -16 },
  { left: "78%", delay: 2.3, dur: 8, drift: 12 },
  { left: "90%", delay: 4, dur: 7.4, drift: -8 },
];

export function NaughtySpinsExperience({
  config = WHEEL_CONFIG,
  skipGate = false,
}: NaughtySpinsExperienceProps) {
  const reduceMotion = useReducedMotion();

  const [entered, setEntered] = useState(skipGate);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [spun, setSpun] = useState(false);
  // The landed segment index, so we can light up exactly the wedge that won.
  const [highlight, setHighlight] = useState<number | null>(null);

  // The wheel's rotation, driven imperatively so we can sequence wind-back →
  // spin and read it live to bounce the ticker.
  const rotation = useMotionValue(0);

  // The segment chosen for the in-flight spin, revealed when the wheel settles.
  const pendingRef = useRef<{ seg: Segment; index: number } | null>(null);
  // Prompts already dealt per category this session, so we don't repeat until a
  // category's stack runs dry.
  const usedRef = useRef<Record<number, Set<number>>>({});
  // Live animation handles, stopped on unmount.
  const animsRef = useRef<{ stop: () => void }[]>([]);

  const segments = useMemo(
    () => buildSegments(config.categories),
    [config.categories],
  );
  const segCount = segments.length;
  const segAngle = segCount > 0 ? 360 / segCount : 0;

  // The pointer's ticker: a peg sits at every wedge boundary, so as the wheel
  // turns the ticker is flicked just after each one passes, then springs back.
  const ticker = useTransform(rotation, (r) => {
    if (segCount < 2) return 0;
    const phase = (((r % segAngle) + segAngle) % segAngle) / segAngle; // 0..1
    const kick = Math.max(0, 1 - phase * 5);
    return kick * 13;
  });

  useEffect(
    () => () => {
      for (const a of animsRef.current) a.stop();
    },
    [],
  );

  const categoryById = useCallback(
    (id: number) => config.categories.find((c) => c.id === id),
    [config.categories],
  );

  const reveal = useCallback(
    (seg: Segment) => {
      const cat = categoryById(seg.categoryId);
      if (!cat) return;
      if (cat.prompts.length === 0) {
        setResult({ category: cat, prompt: null });
        return;
      }
      const used = (usedRef.current[cat.id] ??= new Set());
      if (used.size >= cat.prompts.length) used.clear();
      let idx = Math.floor(Math.random() * cat.prompts.length);
      let guard = 0;
      while (used.has(idx) && guard < cat.prompts.length) {
        idx = (idx + 1) % cat.prompts.length;
        guard++;
      }
      used.add(idx);
      setResult({ category: cat, prompt: cat.prompts[idx] ?? null });
    },
    [categoryById],
  );

  const spin = useCallback(() => {
    if (spinning || segCount < 2) return;
    setResult(null);
    setSpun(true);
    setHighlight(null);

    // Prefer landing on a category that actually has prompts to deal.
    const withPrompts = segments.filter(
      (s) => (categoryById(s.categoryId)?.prompts.length ?? 0) > 0,
    );
    const pool = withPrompts.length > 0 ? withPrompts : segments;
    const winner = pool[Math.floor(Math.random() * pool.length)]!;
    const winnerIndex = segments.indexOf(winner);
    pendingRef.current = { seg: winner, index: winnerIndex };

    // Land the winning wedge's centre under the top pointer, plus full turns and
    // a little jitter so it doesn't always stop dead-centre.
    const segCenter = winnerIndex * segAngle + segAngle / 2;
    const jitter = (Math.random() - 0.5) * segAngle * 0.6;
    const current = rotation.get();
    const base = current - (current % 360);
    const target = base + 360 * 6 + (360 - segCenter) + jitter;

    if (reduceMotion) {
      rotation.set(target);
      setHighlight(winnerIndex);
      reveal(winner);
      return;
    }

    setSpinning(true);
    // A short anticipation wind-back, then the long decelerating spin.
    const windback = animate(rotation, current - 16, {
      duration: 0.32,
      ease: "easeOut",
    });
    animsRef.current.push(windback);
    windback.then(() => {
      const run = animate(rotation, target, {
        duration: 4.6,
        ease: [0.12, 0.66, 0.1, 1],
      });
      animsRef.current.push(run);
      run.then(() => {
        setSpinning(false);
        setHighlight(winnerIndex);
        if (pendingRef.current) reveal(pendingRef.current.seg);
      });
    });
  }, [
    spinning,
    segCount,
    segments,
    segAngle,
    rotation,
    reduceMotion,
    categoryById,
    reveal,
  ]);

  // ── Act 1: the 18+ gate ───────────────────────────────────────────
  if (!entered) {
    return <AgeGate onEnter={() => setEntered(true)} />;
  }

  const empty = segCount < 2;
  const inviteSpin = !spun && !spinning && !result && !empty;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-7">
      {/* The wheel stage */}
      <div className="relative grid aspect-square w-full max-w-[23rem] place-items-center">
        {/* drifting embers */}
        {!reduceMotion &&
          EMBERS.map((e, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="pointer-events-none absolute bottom-6 size-1.5 rounded-full bg-[#ff7a8f]"
              style={{ left: e.left, filter: "blur(1px)" }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.7, 0], y: -160, x: e.drift }}
              transition={{
                duration: e.dur,
                delay: e.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

        {/* ambient glow, tinted to the last result */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-2 rounded-full blur-3xl"
          animate={{
            background: result
              ? `${result.category.color}66`
              : "rgba(255,77,109,0.28)",
            scale: highlight !== null ? [1, 1.12, 1] : 1,
          }}
          transition={{ duration: 0.7 }}
        />

        {/* pointer + ticker, pivoting from the top */}
        <motion.div
          aria-hidden
          className="absolute -top-2 left-1/2 z-30 origin-top"
          style={{ x: "-50%", rotate: ticker }}
        >
          <div
            className="relative"
            style={{
              width: 0,
              height: 0,
              borderLeft: "13px solid transparent",
              borderRight: "13px solid transparent",
              borderTop: "26px solid #ffe9ee",
              filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.55))",
            }}
          />
          <span className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-gradient-to-br from-white to-[#ffb3c4] shadow" />
        </motion.div>

        {/* soft drop shadow under the wheel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-4 rounded-full"
          style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.55)" }}
        />

        {/* the spinning wheel */}
        <motion.div className="relative size-full" style={{ rotate: rotation }}>
          <svg viewBox="0 0 320 320" className="size-full">
            <defs>
              {/* a depth gradient per wedge */}
              {segments.map((seg, i) => (
                <radialGradient
                  key={i}
                  id={`ns-wedge-${i}`}
                  cx="50%"
                  cy="50%"
                  r="75%"
                >
                  <stop offset="0%" stopColor={lighten(seg.color, 0.26)} />
                  <stop offset="62%" stopColor={seg.color} />
                  <stop offset="100%" stopColor={darken(seg.color, 0.32)} />
                </radialGradient>
              ))}
              {/* metallic bezel */}
              <linearGradient id="ns-bezel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd9e0" />
                <stop offset="45%" stopColor="#c81d4e" />
                <stop offset="100%" stopColor="#5a0a1f" />
              </linearGradient>
              <radialGradient id="ns-gloss" cx="40%" cy="28%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* outer metallic ring */}
            <circle
              cx={CX}
              cy={CY}
              r={RIM_R}
              fill="none"
              stroke="url(#ns-bezel)"
              strokeWidth={9}
            />

            {/* wedges */}
            {segments.map((seg, i) => {
              const start = i * segAngle;
              const end = (i + 1) * segAngle;
              const mid = start + segAngle / 2;
              const flip = mid > 90 && mid < 270;
              const labelY = CY - WHEEL_R * 0.6;
              return (
                <g key={i}>
                  <path
                    d={wedgePath(start, end)}
                    fill={`url(#ns-wedge-${i})`}
                    stroke="rgba(13,4,10,0.55)"
                    strokeWidth={1.25}
                  />
                  <g transform={`rotate(${mid} ${CX} ${CY})`}>
                    <text
                      x={CX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={
                        flip ? `rotate(180 ${CX} ${labelY})` : undefined
                      }
                      className="font-display"
                      style={{
                        fontSize: segAngle < 30 ? 11 : 13.5,
                        fontWeight: 700,
                        fill: "#fff",
                        letterSpacing: "0.03em",
                        paintOrder: "stroke",
                        stroke: "rgba(13,4,10,0.45)",
                        strokeWidth: 2.5,
                      }}
                    >
                      {seg.label.length > 14
                        ? `${seg.label.slice(0, 13)}…`
                        : seg.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* the winning wedge lights up */}
            {highlight !== null && segCount > 0 && (
              <motion.path
                d={wedgePath(highlight * segAngle, (highlight + 1) * segAngle)}
                fill="#ffffff"
                style={{ mixBlendMode: "overlay" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.45, 0.18, 0.45] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}

            {/* glossy specular sheen */}
            <circle
              cx={CX}
              cy={CY}
              r={WHEEL_R}
              fill="url(#ns-gloss)"
              pointerEvents="none"
            />

            {/* peg "bulbs" around the seam */}
            {!empty &&
              segments.map((_, i) => {
                const [bx, by] = ringPoint(i * segAngle, BULB_R);
                return reduceMotion ? (
                  <circle key={i} cx={bx} cy={by} r={3} fill="#fff5d6" />
                ) : (
                  <motion.circle
                    key={i}
                    cx={bx}
                    cy={by}
                    r={3.2}
                    fill="#fff5d6"
                    style={{ filter: "drop-shadow(0 0 3px #ffd24d)" }}
                    animate={{ opacity: spinning ? 1 : [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: (i % segCount) * (1.6 / Math.max(segCount, 1)),
                    }}
                  />
                );
              })}

            {empty && (
              <text
                x={CX}
                y={CY}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 13, fill: "rgba(255,255,255,0.5)" }}
              >
                Add a few categories
              </text>
            )}
          </svg>
        </motion.div>

        {/* centre hub — the spin trigger */}
        <div className="absolute z-20 grid place-items-center">
          {/* inviting pulse before the first spin */}
          {inviteSpin && !reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute size-[4.5rem] rounded-full border-2 border-[#ff8fae]"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <motion.button
            type="button"
            onClick={spin}
            disabled={spinning || empty}
            aria-label="Spin the wheel"
            whileTap={{ scale: 0.9 }}
            className="relative grid size-[4.5rem] place-items-center rounded-full bg-gradient-to-br from-[#ff6f8b] via-[#ff4d6d] to-[#a8163f] text-white shadow-[0_8px_30px_rgba(200,29,78,0.55)] ring-4 ring-[#160913] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-90"
          >
            {/* glossy cap highlight */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 38% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)",
              }}
            />
            <span className="relative flex flex-col items-center leading-none">
              <motion.span
                animate={
                  spinning && !reduceMotion ? { rotate: 360 } : { rotate: 0 }
                }
                transition={
                  spinning
                    ? { duration: 1.1, repeat: Infinity, ease: "linear" }
                    : { duration: 0.3 }
                }
              >
                <Sparkles className="size-5" />
              </motion.span>
              <span className="mt-1 text-[0.6rem] font-bold tracking-[0.15em] uppercase">
                {spinning ? "…" : "Spin"}
              </span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* Cover copy — only before the first spin. */}
      <AnimatePresence>
        {!spun && !result && (
          <motion.div
            key="cover-copy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="-mt-1 max-w-sm text-center"
          >
            <h2 className="font-display text-2xl text-white">
              {config.wheelTitle || "Naughty Spins"}
            </h2>
            {config.intro && (
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {config.intro}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The reveal */}
      <div className="flex min-h-[9rem] w-full items-start justify-center">
        <AnimatePresence mode="wait">
          {result && (
            <ResultCard
              key={`${result.category.id}-${result.prompt}`}
              result={result}
              onSpinAgain={spin}
              canSpin={!spinning && !empty}
              reduceMotion={!!reduceMotion}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── The reveal card ──────────────────────────────────────────────────
function ResultCard({
  result,
  onSpinAgain,
  canSpin,
  reduceMotion,
}: {
  result: Result;
  onSpinAgain: () => void;
  canSpin: boolean;
  reduceMotion: boolean;
}) {
  const { category, prompt } = result;
  return (
    <motion.div
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 18, rotateX: -55, scale: 0.92 }
      }
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }
      }
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      style={{ transformPerspective: 900 }}
      className="relative w-full max-w-sm overflow-hidden rounded-3xl border p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur"
    >
      {/* card surface tinted to the category */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(160deg, ${category.color}22 0%, rgba(255,255,255,0.03) 55%)`,
        }}
      />
      {/* glow ring */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-3xl"
        style={{ boxShadow: `inset 0 0 0 1px ${category.color}55` }}
      />
      {/* shimmer sweep */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          }}
          initial={{ x: 0 }}
          animate={{ x: "420%" }}
          transition={{ duration: 1.1, ease: "easeInOut", delay: 0.25 }}
        />
      )}

      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-semibold tracking-wide uppercase"
        style={{ color: category.color, background: `${category.color}1f` }}
      >
        <Flame className="size-3.5" />
        {category.label}
      </span>
      <p className="mt-4 font-display text-xl leading-relaxed text-white">
        {prompt ?? "This one's a blank — add some prompts to this category."}
      </p>
      <button
        type="button"
        onClick={onSpinAgain}
        disabled={!canSpin}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
      >
        <RotateCcw className="size-3.5" /> Spin again
      </button>
    </motion.div>
  );
}

// ── The 18+ consent gate ─────────────────────────────────────────────
function AgeGate({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] px-7 py-10 text-center backdrop-blur"
    >
      <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#ff4d6d] to-[#c81d4e] text-white shadow-lg">
        <Lock className="size-6" />
      </span>
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">For grown-ups only</h2>
        <p className="text-sm leading-relaxed text-white/55">
          This wheel is for consenting adults sharing a private moment. By
          entering you confirm you{"'"}re 18 or older and you both want to be
          here.
        </p>
      </div>
      <button
        type="button"
        onClick={onEnter}
        className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#7e1426] transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Sparkles className="size-4" /> We{"'"}re in
      </button>
    </motion.div>
  );
}
