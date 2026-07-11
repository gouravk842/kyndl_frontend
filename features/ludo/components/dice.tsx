"use client";

import { motion, useReducedMotion } from "framer-motion";

import { useLudoStore } from "../store";

/** Which 3×3 grid cells carry a pip, per face value. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Rotation that brings face `v` to the front of the cube. */
const FACE_ROT: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

function Face({ value, transform }: { value: number; transform: string }) {
  return (
    <span
      className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[6%] rounded-[14px] p-[14%]"
      style={{
        transform,
        background: "linear-gradient(150deg,#FFFDFB,#F6E7DA)",
        border: "1px solid #E7CFB8",
        boxShadow: "inset 0 0 10px rgba(180,120,80,0.25)",
        backfaceVisibility: "hidden",
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="grid place-items-center">
          {PIPS[value]!.includes(i) && (
            <span
              className="h-[72%] w-[72%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%,#F2596F,#B22746)",
                boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.3)",
              }}
            />
          )}
        </span>
      ))}
    </span>
  );
}

export function Dice({ size = 96 }: { size?: number }) {
  const reduce = useReducedMotion();
  const dice = useLudoStore((s) => s.dice);
  const rolling = useLudoStore((s) => s.diceRolling);
  const phase = useLudoStore((s) => s.phase);
  const busy = useLudoStore((s) => s.busy);
  const activity = useLudoStore((s) => s.activity);
  const players = useLudoStore((s) => s.players);
  const turn = useLudoStore((s) => s.turn);
  const roll = useLudoStore((s) => s.roll);

  const value = dice ?? 1;
  const target = FACE_ROT[value]!;
  const half = size / 2;

  const current = players[turn];
  const isHumanTurn = phase === "playing" && current && !current.isBot;
  const canRoll =
    isHumanTurn && !rolling && !busy && !activity && dice === null;

  const animate = rolling
    ? {
        rotateX: target.x + 360 * 3,
        rotateY: target.y + 360 * 3,
      }
    : { rotateX: target.x, rotateY: target.y };

  const faces: { value: number; transform: string }[] = [
    { value: 1, transform: `translateZ(${half}px)` },
    { value: 6, transform: `rotateY(180deg) translateZ(${half}px)` },
    { value: 3, transform: `rotateY(90deg) translateZ(${half}px)` },
    { value: 4, transform: `rotateY(-90deg) translateZ(${half}px)` },
    { value: 2, transform: `rotateX(90deg) translateZ(${half}px)` },
    { value: 5, transform: `rotateX(-90deg) translateZ(${half}px)` },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => canRoll && roll()}
        disabled={!canRoll}
        aria-label="Roll the dice"
        className="grid place-items-center rounded-2xl outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#FF7A59] disabled:cursor-not-allowed"
        style={{
          width: size + 24,
          height: size + 24,
          perspective: 600,
          cursor: canRoll ? "pointer" : "default",
        }}
      >
        <motion.span
          className="relative block"
          style={{
            width: size,
            height: size,
            transformStyle: "preserve-3d",
          }}
          animate={animate}
          transition={{
            duration: reduce ? 0 : rolling ? 0.7 : 0.45,
            ease: rolling ? "easeOut" : "backOut",
          }}
        >
          {faces.map((f) => (
            <Face key={f.value} value={f.value} transform={f.transform} />
          ))}
        </motion.span>
      </button>

      <p className="h-4 text-center text-xs font-medium text-[#92786C]">
        {rolling
          ? "Rolling…"
          : canRoll
            ? "Tap the dice to roll"
            : dice !== null && isHumanTurn
              ? `You rolled ${dice}`
              : ""}
      </p>
    </div>
  );
}
