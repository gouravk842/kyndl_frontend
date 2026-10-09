"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  Drama,
  Eye,
  Flame,
  Heart,
  Lock,
  type LucideIcon,
  MessageCircleHeart,
  Pause,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import {
  createElement,
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { applyWheel } from "@/features/activity-bank/demo-content";
import { DemoGate } from "@/features/activity-bank/demo-gate";
import {
  type SpinCategory,
  WHEEL_CONFIG,
  type WheelConfig,
} from "@/features/naughty-spins/config";
import {
  playPegTick,
  primeTickAudio,
} from "@/features/naughty-spins/lib/tick-sound";

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

/**
 * ViewBox is taller than the circle so the rim stroke and the pointer both
 * live inside the stage. Ancestors (the product-page frame, the scaled embed)
 * clip overflow, so nothing important may hang outside this box.
 */
const VB_W = 400;
const VB_H = 468;
const CX = 200;
const CY = 256;
const WHEEL_R = 152;
const RIM_R = 160;
const RIM_STROKE = 8;
const BULB_R = 146; // pegs sit on the seam, inside the rim stroke
const RIM_OUTER = RIM_R + RIM_STROKE / 2;

/** Radial band the label may occupy, clear of the hub and the rim icon. */
const LABEL_INNER = 58;
const LABEL_OUTER = 136;

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
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
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

const INK_LIGHT = "#fffaf8";
const INK_DARK = "#1a0a10";

function relLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: number, b: number): number {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Light or dark ink, whichever keeps WCAG AA against the wedge face.
 * Samples the solid fill plus the highlight and the soft rim shade the
 * gradient actually paints under the label.
 */
function inkFor(fill: string): string {
  const samples = [fill, darken(fill, 0.1), lighten(fill, 0.22)].map(
    relLuminance,
  );
  const lightL = relLuminance(INK_LIGHT);
  const darkL = relLuminance(INK_DARK);
  const worst = (inkL: number) =>
    Math.min(...samples.map((sample) => contrastRatio(inkL, sample)));
  return worst(lightL) >= worst(darkL) ? INK_LIGHT : INK_DARK;
}

/** Sample-pack names, plus a few obvious aliases. Custom names fall back to Sparkles. */
const CATEGORY_ICONS: { test: RegExp; icon: LucideIcon }[] = [
  { test: /talk|question/i, icon: MessageCircleHeart },
  { test: /charade|mime|act/i, icon: Drama },
  { test: /wild|bonus/i, icon: Star },
  { test: /myster|secret|surprise/i, icon: Eye },
  { test: /dare/i, icon: Zap },
  { test: /heart|love|romance/i, icon: Heart },
  { test: /action|touch|kiss/i, icon: Flame },
];

function iconForLabel(label: string): LucideIcon {
  return (
    CATEGORY_ICONS.find((entry) => entry.test.test(label))?.icon ?? Sparkles
  );
}

/** Render a category Lucide icon without assigning a component during render. */
function categoryIcon(
  label: string,
  props: { className?: string; style?: CSSProperties; strokeWidth?: number },
) {
  return createElement(iconForLabel(label), { ...props, "aria-hidden": true });
}

type WedgeMark = {
  text: string;
  fontSize: number;
  showLabel: boolean;
  /** Radius the label is centred on. */
  textR: number;
  /** Icon centre, as a radius and a clockwise tangent offset (viewBox units). */
  iconR: number;
  iconTangent: number;
};

/**
 * Fit a radial label inside its wedge. The string runs along the bisector;
 * the font shrinks until it fits, then ellipsizes. Very thin wedges drop the
 * word and keep the icon — the legend still has the full name.
 */
function layoutWedge(label: string, segAngle: number): WedgeMark {
  const iconOnly: WedgeMark = {
    text: "",
    fontSize: 14,
    showLabel: false,
    textR: WHEEL_R * 0.64,
    iconR: WHEEL_R * 0.64,
    iconTangent: 0,
  };
  if (segAngle < 16 || label.length === 0) return iconOnly;

  const midR = (LABEL_INNER + LABEL_OUTER) / 2;
  const halfW = midR * Math.sin((segAngle * Math.PI) / 360);
  const icon = 13;
  const gap = 3;
  const sideFont = Math.min(17, (halfW - icon - gap) * 2 * 0.92);
  const beside = sideFont >= 13;

  let font = beside ? sideFont : Math.min(16, halfW * 1.55);
  const textOuter = beside ? LABEL_OUTER : WHEEL_R - 34;
  const maxLen = textOuter - LABEL_INNER;
  const textR = (LABEL_INNER + textOuter) / 2;
  if (font < 12 || maxLen < 28) return iconOnly;

  const width = (text: string, size: number) => text.length * size * 0.58;
  while (font - 0.5 >= 12 && width(label, font) > maxLen) font -= 0.5;

  const iconR = beside
    ? textR + (textOuter - LABEL_INNER) * 0.18
    : WHEEL_R - 22;
  const iconTangent = beside ? font / 2 + gap + icon / 2 : 0;
  const placed = { fontSize: font, showLabel: true, textR, iconR, iconTangent };

  if (width(label, font) <= maxLen) {
    return { text: label, ...placed };
  }

  const maxChars = Math.floor(maxLen / (font * 0.58));
  if (maxChars < 3) return iconOnly;
  return {
    text: `${label.slice(0, maxChars - 1).trimEnd()}…`,
    ...placed,
  };
}

function formatShare(probability: number): string {
  const rounded = Math.round(probability * 1000) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

/** A short tap when the wheel settles. Missing or blocked vibrate is ignored. */
function landingBuzz() {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  ) {
    return;
  }
  navigator.vibrate(18);
}

/** Do-overs from the open card. A normal spin after Done or Skip is separate. */
const RE_SPINS = 3;
/** Gentle countdown on the card. Off until the player turns the timer on. */
const TIMER_SECONDS = 60;
const EMPTY_PROMPT = "No more prompts here, spin again.";

// A few fixed ember positions (% of the stage) so SSR and the client agree.
const EMBERS = [
  { left: "12%", delay: 0, dur: 7, drift: 14 },
  { left: "28%", delay: 1.4, dur: 8.5, drift: -10 },
  { left: "47%", delay: 3.1, dur: 7.8, drift: 8 },
  { left: "63%", delay: 0.7, dur: 9.2, drift: -16 },
  { left: "78%", delay: 2.3, dur: 8, drift: 12 },
  { left: "90%", delay: 4, dur: 7.4, drift: -8 },
];

export function NaughtySpinsExperience(props: NaughtySpinsExperienceProps) {
  return (
    <DemoGate
      authored={props.config}
      fallback={WHEEL_CONFIG}
      includeAdult
      apply={applyWheel}
    >
      {(config) => <NaughtySpinsPlay {...props} config={config} />}
    </DemoGate>
  );
}

function NaughtySpinsPlay({
  config,
  skipGate = false,
}: NaughtySpinsExperienceProps & { config: WheelConfig }) {
  const reduceMotion = useReducedMotion();

  const [entered, setEntered] = useState(skipGate);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [spun, setSpun] = useState(false);
  // The landed segment index, so we can light up exactly the wedge that won.
  const [highlight, setHighlight] = useState<number | null>(null);
  // Peg ticks stay off until the player asks for them.
  const [soundOn, setSoundOn] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reSpinsLeft, setReSpinsLeft] = useState(RE_SPINS);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);

  // The wheel's rotation, driven imperatively so we can sequence wind-back →
  // spin and read it live to bounce the ticker.
  const rotation = useMotionValue(0);

  // The segment chosen for the in-flight spin, revealed when the wheel settles.
  const pendingRef = useRef<{ seg: Segment; index: number } | null>(null);
  // Bumped when the player pauses, so an in-flight spin does not reveal a card.
  const spinGen = useRef(0);
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
    return kick * 18;
  });
  // Icons are painted on the wheel, then counter-rotated so the glyph stays upright.
  const iconUpright = useTransform(rotation, (r) => -r);
  const uid = useId().replace(/:/g, "");

  // Chances mirror spin(): a uniform pick among segments whose category still
  // has prompts. Repeats are equal, so each playable category shares the wheel.
  const legend = useMemo(() => {
    const prompted = segments.filter(
      (s) =>
        (config.categories.find((c) => c.id === s.categoryId)?.prompts.length ??
          0) > 0,
    );
    const pool = prompted.length > 0 ? prompted : segments;
    const total = pool.length || 1;
    return config.categories.map((category) => ({
      category,
      probability:
        pool.filter((s) => s.categoryId === category.id).length / total,
    }));
  }, [segments, config.categories]);

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
      // A prompt is not dealt again in this session once the stack is spent.
      if (used.size >= cat.prompts.length) {
        setResult({ category: cat, prompt: null });
        return;
      }
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

  const finishSpin = useCallback(
    (winnerIndex: number, winner: Segment) => {
      setSpinning(false);
      setHighlight(winnerIndex);
      if (!reduceMotion) landingBuzz();
      reveal(winner);
    },
    [reduceMotion, reveal],
  );

  const spin = useCallback(() => {
    if (spinning || segCount < 2) return;
    setResult(null);
    setSpun(true);
    setHighlight(null);
    if (soundOn) primeTickAudio();
    const gen = spinGen.current;

    // Prefer landing on a category that actually has prompts to deal.
    const withPrompts = segments.filter(
      (s) => (categoryById(s.categoryId)?.prompts.length ?? 0) > 0,
    );
    const pool = withPrompts.length > 0 ? withPrompts : segments;
    const winner = pool[Math.floor(Math.random() * pool.length)]!;
    const winnerIndex = segments.indexOf(winner);
    pendingRef.current = { seg: winner, index: winnerIndex };

    // Land the winning wedge's centre under the top pointer. Extra full turns
    // only lengthen the spin — they do not change which wedge was chosen.
    const segCenter = winnerIndex * segAngle + segAngle / 2;
    const jitter = (Math.random() - 0.5) * segAngle * 0.6;
    const current = rotation.get();
    const base = current - (current % 360);
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const target = base + 360 * extraTurns + (360 - segCenter) + jitter;

    if (reduceMotion) {
      setSpinning(true);
      const run = animate(rotation, target, {
        duration: 0.4,
        ease: "easeOut",
      });
      animsRef.current.push(run);
      run.then(() => {
        if (spinGen.current !== gen) return;
        finishSpin(winnerIndex, winner);
      });
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
        // Rock past the landing, then rest on the chosen wedge. The amplitude
        // stays inside that wedge so the highlight matches where it stops.
        const amp = Math.min(6, segAngle * 0.16);
        const settle = animate(rotation, [target, target + amp, target], {
          duration: 0.42,
          times: [0, 0.42, 1],
          ease: "easeOut",
        });
        animsRef.current.push(settle);
        settle.then(() => {
          if (spinGen.current !== gen) return;
          finishSpin(winnerIndex, winner);
        });
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
    soundOn,
    finishSpin,
  ]);

  // A tick each time a peg boundary passes. Off unless the player turns it on.
  useEffect(() => {
    if (!soundOn || !spinning || reduceMotion || segAngle <= 0) return;
    let lastPeg = Math.floor(rotation.get() / segAngle);
    return rotation.on("change", (value) => {
      const peg = Math.floor(value / segAngle);
      if (peg === lastPeg) return;
      lastPeg = peg;
      playPegTick();
    });
  }, [soundOn, spinning, reduceMotion, rotation, segAngle]);

  // Reset the countdown when a new card is dealt. Pausing does not reset it.
  useEffect(() => {
    if (!timerOn || !result) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restart the countdown for a new card
    setSecondsLeft(TIMER_SECONDS);
  }, [timerOn, result]);

  useEffect(() => {
    if (!timerOn || !result || paused) return;
    const id = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerOn, result, paused]);

  const closeCard = useCallback(() => setResult(null), []);

  const spinAgain = useCallback(() => {
    if (reSpinsLeft <= 0 || spinning) return;
    setReSpinsLeft((n) => n - 1);
    spin();
  }, [reSpinsLeft, spinning, spin]);

  const pauseGame = useCallback(() => {
    spinGen.current += 1;
    for (const anim of animsRef.current) anim.stop();
    animsRef.current = [];
    setSpinning(false);
    setPaused(true);
  }, []);

  const resume = useCallback(() => setPaused(false), []);

  const endSession = useCallback(() => {
    spinGen.current += 1;
    for (const anim of animsRef.current) anim.stop();
    animsRef.current = [];
    setSpinning(false);
    setPaused(false);
    setResult(null);
    setHighlight(null);
  }, []);

  // ── Act 1: the 18+ gate ───────────────────────────────────────────
  if (!entered) {
    return <AgeGate onEnter={() => setEntered(true)} />;
  }

  const empty = segCount < 2;
  const marks = segments.map((seg) => layoutWedge(seg.label, segAngle));
  const hubLeft = `${(CX / VB_W) * 100}%`;
  const hubTop = `${(CY / VB_H) * 100}%`;
  const cardOpen = result !== null;
  const idle = !spinning && !empty && !cardOpen;

  return (
    <div className="relative flex w-full max-w-[34rem] flex-col items-center gap-5">
      <p className="sr-only" aria-live="polite">
        {spinning
          ? "Spinning…"
          : result
            ? `${result.category.label}. ${result.prompt ?? EMPTY_PROMPT}`
            : ""}
      </p>
      {/* The wheel stage — padding in the viewBox keeps the rim and pointer inside. */}
      <div
        className="@container relative w-full overflow-visible"
        style={{
          width: "min(100%, calc(100svh - 12rem), 34rem)",
          aspectRatio: `${VB_W} / ${VB_H}`,
        }}
      >
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

        {/* ambient glow, tinted to the last result, centred on the hub */}
        <div
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: hubLeft,
            top: hubTop,
            width: `${((WHEEL_R * 2) / VB_W) * 100}%`,
          }}
        >
          <motion.div
            className="aspect-square w-full rounded-full blur-3xl"
            animate={{
              background: result
                ? `${result.category.color}66`
                : "rgba(255,77,109,0.28)",
              scale: highlight !== null ? [1, 1.12, 1] : 1,
            }}
            transition={{ duration: 0.7 }}
          />
        </div>

        {/* pointer, pinned just outside the rim; the ticker flicks it as pegs pass */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-30 flex origin-top flex-col items-center"
          style={{
            left: hubLeft,
            top: `${((CY - RIM_OUTER) / VB_H) * 100}%`,
            x: "-50%",
            y: "-100%",
            rotate: ticker,
          }}
        >
          <span className="relative z-10 size-[18px] rounded-full bg-gradient-to-br from-white to-[#ffb3c4] shadow-[0_2px_8px_rgba(0,0,0,0.55)]" />
          <div
            className="-mt-1.5"
            style={{
              width: 0,
              height: 0,
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              borderTop: "40px solid #ffe9ee",
              filter: "drop-shadow(0 8px 8px rgba(0,0,0,0.6))",
            }}
          />
        </motion.div>

        {/* soft drop shadow under the wheel */}
        <div
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: hubLeft,
            top: hubTop,
            width: `${((WHEEL_R * 2) / VB_W) * 100}%`,
            aspectRatio: "1",
            boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          }}
        />

        {/* the spinning wheel */}
        <motion.div className="relative size-full" style={{ rotate: rotation }}>
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="size-full overflow-visible"
            aria-hidden
          >
            <defs>
              {/* a depth gradient per wedge */}
              {segments.map((seg, i) => (
                <radialGradient
                  key={i}
                  id={`${uid}-wedge-${i}`}
                  cx="50%"
                  cy="50%"
                  r="75%"
                >
                  <stop offset="0%" stopColor={lighten(seg.color, 0.22)} />
                  <stop offset="52%" stopColor={seg.color} />
                  <stop offset="100%" stopColor={darken(seg.color, 0.1)} />
                </radialGradient>
              ))}
              {segments.map((_, i) => {
                const start = i * segAngle;
                const end = (i + 1) * segAngle;
                const inset = Math.min(1.1, segAngle * 0.07);
                return (
                  <clipPath key={i} id={`${uid}-clip-${i}`}>
                    <path
                      d={wedgePath(start + inset, end - inset, WHEEL_R - 3)}
                    />
                  </clipPath>
                );
              })}
              {/* metallic bezel */}
              <linearGradient id={`${uid}-bezel`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd9e0" />
                <stop offset="45%" stopColor="#c81d4e" />
                <stop offset="100%" stopColor="#5a0a1f" />
              </linearGradient>
              <radialGradient id={`${uid}-gloss`} cx="40%" cy="28%" r="60%">
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
              stroke={`url(#${uid}-bezel)`}
              strokeWidth={RIM_STROKE}
            />

            {/* wedges */}
            {segments.map((seg, i) => {
              const start = i * segAngle;
              const end = (i + 1) * segAngle;
              const mid = start + segAngle / 2;
              const mark = marks[i] ?? layoutWedge(seg.label, segAngle);
              const ink = inkFor(seg.color);
              const textRot = mid > 180 ? 90 : -90;
              return (
                <g key={i}>
                  <path
                    d={wedgePath(start, end)}
                    fill={`url(#${uid}-wedge-${i})`}
                    stroke="rgba(13,4,10,0.55)"
                    strokeWidth={1.25}
                  />
                  {mark.showLabel && (
                    <g clipPath={`url(#${uid}-clip-${i})`}>
                      <title>{seg.label}</title>
                      <g transform={`rotate(${mid} ${CX} ${CY})`}>
                        <text
                          x={CX}
                          y={CY - mark.textR}
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textRot} ${CX} ${CY - mark.textR})`}
                          className="font-display"
                          style={{
                            fontSize: mark.fontSize,
                            fontWeight: 700,
                            fill: ink,
                          }}
                        >
                          {mark.text}
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}

            {/* glossy specular sheen */}
            <circle
              cx={CX}
              cy={CY}
              r={WHEEL_R}
              fill={`url(#${uid}-gloss)`}
              pointerEvents="none"
            />

            {/* losing wedges dim once the wheel has settled */}
            {highlight !== null &&
              segments.map((_, i) => {
                if (i === highlight) return null;
                const start = i * segAngle;
                return (
                  <path
                    key={`dim-${i}`}
                    d={wedgePath(start, start + segAngle)}
                    fill="rgba(13,4,10,0.62)"
                    pointerEvents="none"
                  />
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
                transition={{
                  duration: reduceMotion ? 0 : 1.6,
                  repeat: reduceMotion ? 0 : Infinity,
                }}
              />
            )}

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

          {!empty &&
            segments.map((seg, i) => {
              const mark = marks[i] ?? layoutWedge(seg.label, segAngle);
              const mid = i * segAngle + segAngle / 2;
              const [ix, iy] = ringPoint(mid, mark.iconR);
              const rad = (mid * Math.PI) / 180;
              const x = ix + mark.iconTangent * Math.cos(rad);
              const y = iy + mark.iconTangent * Math.sin(rad);
              const ink = inkFor(seg.color);
              const iconSize = mark.showLabel
                ? "clamp(14px, 4cqi, 20px)"
                : "clamp(18px, 5.5cqi, 28px)";
              return (
                <span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(x / VB_W) * 100}%`,
                    top: `${(y / VB_H) * 100}%`,
                    opacity: highlight !== null && highlight !== i ? 0.35 : 1,
                    transition: reduceMotion ? "none" : "opacity 0.4s ease",
                  }}
                >
                  <motion.span
                    className="grid place-items-center"
                    style={{ rotate: iconUpright }}
                  >
                    {categoryIcon(seg.label, {
                      strokeWidth: 2.25,
                      style: { color: ink, width: iconSize, height: iconSize },
                    })}
                  </motion.span>
                </span>
              );
            })}
        </motion.div>

        {/* centre hub — the spin trigger */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: hubLeft, top: hubTop }}
        >
          <div className="relative grid place-items-center">
            {idle && !reduceMotion && (
              <motion.span
                aria-hidden
                className="absolute size-[4.5rem] rounded-full bg-[#ff4d6d] sm:size-20"
                animate={{ scale: [1, 1.12, 1], opacity: [0.38, 0, 0.38] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <motion.button
              type="button"
              onClick={spin}
              disabled={spinning || empty || cardOpen}
              aria-label="Spin the wheel"
              whileTap={{ scale: 0.94 }}
              className="relative z-10 grid size-[4.5rem] place-items-center rounded-full bg-gradient-to-br from-[#ff6f8b] via-[#ff4d6d] to-[#a8163f] text-white shadow-[0_8px_30px_rgba(200,29,78,0.55)] ring-4 ring-[#160913] transition-transform hover:scale-105 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-90 sm:size-20"
            >
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
                  <Sparkles className="size-5 sm:size-6" />
                </motion.span>
                <span className="mt-1 text-xs font-bold tracking-[0.16em] uppercase">
                  {spinning ? "…" : "Spin"}
                </span>
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {!empty && (
        <ul
          aria-label="Categories and their chances"
          className="flex w-full flex-wrap items-center justify-center gap-2"
        >
          {legend.map(({ category, probability }) => {
            return (
              <li key={category.id}>
                <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-base text-white">
                  {categoryIcon(category.label, {
                    className: "size-4 shrink-0",
                    style: { color: category.color },
                  })}
                  <span
                    className="max-w-[12rem] truncate font-medium"
                    title={category.label}
                  >
                    {category.label}
                  </span>
                  <span className="tabular-nums text-white/70">
                    {formatShare(probability)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!empty && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((on) => !on)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-base text-white/80 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {soundOn ? (
              <Volume2 className="size-4" aria-hidden />
            ) : (
              <VolumeX className="size-4" aria-hidden />
            )}
            {soundOn ? "Sound on" : "Sound off"}
          </button>
          <button
            type="button"
            aria-pressed={timerOn}
            onClick={() => setTimerOn((on) => !on)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-base text-white/80 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {timerOn ? "Timer on" : "Timer off"}
          </button>
          <button
            type="button"
            onClick={pauseGame}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-base text-white/80 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Pause className="size-4" aria-hidden />
            Pause
          </button>
        </div>
      )}

      {/* Cover copy — only before the first spin. */}
      <AnimatePresence>
        {!spun && !result && (
          <motion.div
            key="cover-copy"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-sm text-center"
          >
            <h2 className="font-display text-2xl text-white">
              {config.wheelTitle || "Naughty Spins"}
            </h2>
            {config.intro && (
              <p className="mt-2 text-base leading-relaxed text-white/80">
                {config.intro}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <ResultCard
            key={`${result.category.id}-${result.prompt ?? "empty"}`}
            result={result}
            reSpinsLeft={reSpinsLeft}
            secondsLeft={timerOn ? secondsLeft : null}
            reduceMotion={!!reduceMotion}
            onDone={closeCard}
            onSkip={closeCard}
            onSpinAgain={spinAgain}
            onPause={pauseGame}
            suspended={paused}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paused && (
          <PauseScreen
            reduceMotion={!!reduceMotion}
            onResume={resume}
            onEnd={endSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── The reveal card ──────────────────────────────────────────────────
function ResultCard({
  result,
  reSpinsLeft,
  secondsLeft,
  reduceMotion,
  onDone,
  onSkip,
  onSpinAgain,
  onPause,
  suspended,
}: {
  result: Result;
  reSpinsLeft: number;
  /** Null hides the countdown. */
  secondsLeft: number | null;
  reduceMotion: boolean;
  onDone: () => void;
  onSkip: () => void;
  onSpinAgain: () => void;
  onPause: () => void;
  /** Pause sits on top, so this card should ignore keys until it returns. */
  suspended: boolean;
}) {
  const { category, prompt } = result;
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suspended) return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone, suspended]);

  const clock =
    secondsLeft === null
      ? null
      : secondsLeft <= 0
        ? "Time's up"
        : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-end justify-center sm:items-center"
      inert={suspended ? true : undefined}
      aria-hidden={suspended}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.25 }}
    >
      <button
        type="button"
        aria-label="Close the card"
        className="absolute inset-0 bg-[#0d040a]/75"
        onClick={onDone}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
        transition={
          reduceMotion
            ? { duration: 0.15 }
            : { type: "spring", stiffness: 280, damping: 28 }
        }
        className="relative z-10 m-0 w-full rounded-t-[1.6rem] border border-white/10 bg-[#160910]/95 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_24px_70px_rgba(0,0,0,0.55)] outline-none backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:m-4 sm:max-w-md sm:rounded-[1.6rem] sm:pb-6"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 rounded-t-[1.6rem] sm:rounded-t-[1.6rem]"
          style={{ background: category.color }}
        />
        <div className="flex items-start justify-between gap-3">
          <span
            id={titleId}
            className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-white"
          >
            {categoryIcon(category.label, {
              className: "size-5 shrink-0",
              style: { color: category.color },
            })}
            {category.label}
          </span>
          {clock && (
            <span className="pt-2 text-base tabular-nums text-white/70">
              {clock}
            </span>
          )}
        </div>
        <p className="mt-4 font-display text-2xl leading-snug text-white sm:text-[1.75rem]">
          {prompt ?? EMPTY_PROMPT}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDone}
            className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-5 text-base font-semibold text-white shadow-[0_8px_30px_rgba(200,29,78,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onSpinAgain}
            disabled={reSpinsLeft <= 0}
            className="col-span-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 text-base font-medium text-white/85 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="size-4" aria-hidden />
            {reSpinsLeft > 0
              ? `Spin again · ${reSpinsLeft} left`
              : "No re-spins left"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-3 text-base font-medium text-white/85 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onPause}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 text-base font-medium text-white/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Pause className="size-4" aria-hidden />
            Pause
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PauseScreen({
  reduceMotion,
  onResume,
  onEnd,
}: {
  reduceMotion: boolean;
  onResume: () => void;
  onEnd: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onResume();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onResume]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.25 }}
    >
      <div aria-hidden className="absolute inset-0 bg-[#0d040a]/88" />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ns-pause-title"
        tabIndex={-1}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-[#14080e] px-7 py-10 text-center outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <h2 id="ns-pause-title" className="font-display text-3xl text-white">
          Paused
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/75">
          Take a breath. The wheel will wait until you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#7e1426] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onEnd}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-7 text-base font-medium text-white/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            End
          </button>
        </div>
      </motion.div>
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
