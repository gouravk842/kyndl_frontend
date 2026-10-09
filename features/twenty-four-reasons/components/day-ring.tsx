"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import type { Reason } from "../config";

export type RingReason = Reason & {
  open: boolean;
  isNew: boolean;
  isNext: boolean;
};

export type DayRingHandle = {
  /** Spin the wheel to land on this reason, then reveal. */
  spinTo: (id: string) => void;
  /** Spin to a random open reason (prefers unseen/new). */
  spinOpen: () => void;
};

const SEG_OPEN = ["#fff6ec", "#f7e4d0", "#ffe8d6", "#f3dcc6"];
const SEG_LOCKED = ["#c4a07a", "#b89068", "#a87c58", "#c9a882"];

function wedgePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  a0: number,
  a1: number,
): string {
  const toXY = (r: number, a: number) => [
    cx + r * Math.cos(a),
    cy + r * Math.sin(a),
  ];
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = toXY(rOuter, a0);
  const [x1, y1] = toXY(rOuter, a1);
  const [x2, y2] = toXY(rInner, a1);
  const [x3, y3] = toXY(rInner, a0);
  return [
    `M ${x0} ${y0}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x3} ${y3}`,
    "Z",
  ].join(" ");
}

/**
 * Casino-style prize ring — spins under a fixed pointer and reveals the landed reason.
 */
export const DayRing = forwardRef<
  DayRingHandle,
  {
    reasons: RingReason[];
    nextLabel?: string;
    countdown?: string;
    complete: boolean;
    finaleLine: string;
    onReveal: (reason: Reason) => void;
  }
>(function DayRing(
  { reasons, nextLabel, countdown, complete, finaleLine, onReveal },
  ref,
) {
  const reduce = useReducedMotion();
  const count = Math.max(reasons.length, 1);
  const openCount = reasons.filter((r) => r.open).length;
  const slice = 360 / count;

  const rotation = useMotionValue(0);
  const [spinning, setSpinning] = useState(false);
  const spinningRef = useRef(false);
  const rotationAccum = useRef(0);

  const wedges = useMemo(() => {
    // Start at top (-90°) like a clock.
    const start = -Math.PI / 2;
    return reasons.map((r, i) => {
      const a0 = start + (i / count) * Math.PI * 2;
      const a1 = start + ((i + 1) / count) * Math.PI * 2;
      const mid = (a0 + a1) / 2;
      const labelR = 34;
      return {
        ...r,
        index: i,
        path: wedgePath(50, 50, 18, 46, a0, a1),
        labelX: 50 + labelR * Math.cos(mid),
        labelY: 50 + labelR * Math.sin(mid),
        fill: r.open
          ? SEG_OPEN[i % SEG_OPEN.length]!
          : SEG_LOCKED[i % SEG_LOCKED.length]!,
      };
    });
  }, [reasons, count]);

  const spinToIndex = useCallback(
    async (index: number) => {
      if (spinningRef.current || reasons.length === 0) return;
      const target = reasons[index];
      if (!target) return;
      if (!target.open) {
        toast.message("Still sealed", {
          description: "That hour hasn’t opened yet.",
        });
        return;
      }

      spinningRef.current = true;
      setSpinning(true);

      // Pointer sits at top. Segment center is at index*slice + slice/2 from top.
      // Wheel rotation should bring that center under the pointer:
      // targetAngle = -(index * slice + slice/2)
      const segmentCenter = index * slice + slice / 2;
      const current = rotationAccum.current;
      const normalized = ((current % 360) + 360) % 360;
      // Desired final modulo: we want (normalized + delta) % 360 === (360 - segmentCenter) % 360
      // Because rotating wheel clockwise by θ moves segment at θ under the top pointer...
      // With CSS rotate positive = clockwise: segment that started at `segmentCenter` degrees
      // from top (clockwise) reaches top when rotation = -segmentCenter (or 360-k).
      const desiredMod = (360 - segmentCenter + 360) % 360;
      let delta = desiredMod - normalized;
      if (delta <= 0) delta += 360;
      const extraTurns = reduce ? 1 : 4 + Math.floor(Math.random() * 3);
      const finalRotation = current + delta + extraTurns * 360;

      rotationAccum.current = finalRotation;

      await animate(rotation, finalRotation, {
        duration: reduce ? 1.1 : 4.2,
        ease: [0.12, 0.8, 0.12, 1],
      }).finished;

      spinningRef.current = false;
      setSpinning(false);
      onReveal(target);
    },
    [reasons, slice, rotation, onReveal, reduce],
  );

  const spinOpen = useCallback(() => {
    const pool = reasons.map((r, i) => ({ r, i })).filter(({ r }) => r.open);
    if (pool.length === 0) {
      toast.message("No seals open yet", {
        description: nextLabel ?? "Come back when the next hour unlocks.",
      });
      return;
    }
    const preferred = pool.filter(({ r }) => r.isNew);
    const pick = (preferred.length ? preferred : pool)[
      Math.floor(
        Math.random() * (preferred.length ? preferred.length : pool.length),
      )
    ]!;
    void spinToIndex(pick.i);
  }, [reasons, spinToIndex, nextLabel]);

  useImperativeHandle(
    ref,
    () => ({
      spinTo: (id: string) => {
        const i = reasons.findIndex((r) => r.id === id);
        if (i >= 0) void spinToIndex(i);
      },
      spinOpen,
    }),
    [reasons, spinToIndex, spinOpen],
  );

  return (
    <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem]">
      {/* Pedestal */}
      <div
        aria-hidden
        className="absolute -bottom-2 left-1/2 h-12 w-[72%] -translate-x-1/2 rounded-[100%] bg-[#5a3223]/25 blur-2xl"
      />

      {/* Fixed pointer (casino marker at top) */}
      <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1">
        <div
          className="h-0 w-0 border-x-[10px] border-t-[18px] border-x-transparent drop-shadow-md"
          style={{ borderTopColor: "#B11226" }}
        />
        <div
          aria-hidden
          className="mx-auto -mt-1 size-2.5 rounded-full border border-[#f0d9b0]"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #f5e0b8, #b8860b 70%)",
          }}
        />
      </div>

      {/* Outer casino housing */}
      <div
        className="relative aspect-square overflow-hidden rounded-full p-[10px] shadow-[0_24px_50px_rgba(90,50,35,0.28),inset_0_1px_0_rgba(255,255,255,0.25)]"
        style={{
          background:
            "conic-gradient(from 0deg, #3d2618, #6b4428, #3d2618, #8a6238, #3d2618)",
        }}
      >
        {/* Gold studs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[6px] rounded-full"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, #f0d9b0 0deg 2deg, transparent 2deg 15deg)",
            opacity: 0.55,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))",
          }}
        />

        <motion.div
          className="relative h-full w-full rounded-full"
          style={{ rotate: rotation }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <filter
                id="wheelShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="0.5"
                  stdDeviation="0.4"
                  floodOpacity="0.25"
                />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="48" fill="#2a1a14" />
            {wedges.map((w) => (
              <path
                key={w.id}
                d={w.path}
                fill={w.fill}
                stroke="rgba(42,26,20,0.35)"
                strokeWidth="0.35"
                filter="url(#wheelShadow)"
                opacity={w.open ? 1 : 0.72}
              />
            ))}
            {/* Inner hub ring */}
            <circle
              cx="50"
              cy="50"
              r="18"
              fill="#3d2618"
              stroke="#D4A373"
              strokeWidth="0.8"
            />
            {wedges.map((w) => (
              <g key={`lbl-${w.id}`}>
                <text
                  x={w.labelX}
                  y={w.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={w.open ? "#8E1020" : "rgba(42,26,20,0.55)"}
                  style={{
                    fontSize: count > 16 ? "3.2px" : "3.8px",
                    fontFamily: "var(--font-hand)",
                    fontWeight: 600,
                  }}
                >
                  {String(w.n).padStart(2, "0")}
                </text>
                {!w.open && (
                  <circle
                    cx={w.labelX}
                    cy={w.labelY + (count > 16 ? 3.2 : 3.8)}
                    r="0.9"
                    fill="#8E1020"
                    opacity={0.55}
                  />
                )}
                {w.isNew && w.open && (
                  <circle
                    cx={w.labelX}
                    cy={w.labelY}
                    r="5"
                    fill="none"
                    stroke="#B11226"
                    strokeWidth="0.4"
                    opacity={0.55}
                  />
                )}
              </g>
            ))}
          </svg>
        </motion.div>

        {/* Center console (does not spin) */}
        <div
          className="absolute inset-[22%] z-10 flex flex-col items-center justify-center rounded-full text-center shadow-[inset_0_2px_12px_rgba(0,0,0,0.25)]"
          style={{
            background:
              "radial-gradient(circle at 40% 30%, #fffaf4 0%, #f0dcc8 55%, #e2c4a8 100%)",
          }}
        >
          {complete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3"
            >
              <p className="font-cursive text-xl leading-tight text-[#8E1020] sm:text-2xl">
                {finaleLine}
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 px-3">
              {spinning ? (
                <p className="font-cursive text-xl text-[#8E1020]">spinning…</p>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={spinning || openCount === 0}
                    onClick={spinOpen}
                    className="rounded-full bg-gradient-to-b from-[#D4A373] to-[#B11226] px-4 py-2 text-[0.7rem] font-bold tracking-[0.18em] text-white uppercase shadow-[0_8px_20px_rgba(177,18,38,0.35)] transition-transform hover:scale-[1.04] active:scale-95 disabled:opacity-40"
                  >
                    Spin
                  </button>
                  {countdown ? (
                    <p className="font-display text-sm tabular-nums text-[#B11226]">
                      {countdown}
                    </p>
                  ) : null}
                  <p className="text-[0.6rem] tracking-wide text-[#92786c]">
                    {openCount}/{reasons.length} open
                  </p>
                  {nextLabel && openCount === 0 ? (
                    <p className="font-hand text-[0.65rem] text-[#5a3223]/55">
                      {nextLabel}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center font-hand text-sm text-[#5a3223]/55">
        {spinning
          ? "The ring is choosing…"
          : openCount > 0
            ? "Spin to break a seal and reveal a reason"
            : "Waiting for the next hour to unlock"}
      </p>
    </div>
  );
});
