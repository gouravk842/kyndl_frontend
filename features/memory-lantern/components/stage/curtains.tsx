"use client";

import { motion } from "framer-motion";

const FOLDS = [
  "#3a0614",
  "#7c1832",
  "#2e0410",
  "#8f1d3a",
  "#410818",
  "#691228",
  "#320612",
  "#7a1630",
];

/**
 * Velvet that actually parts. Each half is folded cloth: it draws toward its
 * own wall, overshoots, and settles, then the tie-back and tassel drop in.
 * The same panels stay at the sides, so the open drapes are the cloth that moved.
 */
export function Curtains({
  parted,
  reducedMotion,
}: {
  parted: boolean;
  reducedMotion: boolean;
}) {
  const duration = reducedMotion ? 0.01 : 2.15;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-hidden
    >
      <Valance />
      <Velvet side="left" parted={parted} duration={duration} />
      <Velvet side="right" parted={parted} duration={duration} />
      <motion.div
        className="absolute inset-y-[6%] left-1/2 w-16 -translate-x-1/2"
        initial={false}
        animate={
          parted
            ? { opacity: [0, 0.9, 0], scaleX: [0.15, 1.6, 2.4] }
            : { opacity: 0, scaleX: 0.15 }
        }
        transition={{ duration: reducedMotion ? 0.01 : 1.5, ease: "easeOut" }}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 236, 196, 0.55), transparent 70%)",
        }}
      />
      <motion.div
        className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-[#f0d7a8]/50"
        initial={false}
        animate={{ opacity: parted ? 0 : 0.7, scaleY: parted ? 0.4 : 1 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.35 }}
      />
      <Tieback side="left" parted={parted} reducedMotion={reducedMotion} />
      <Tieback side="right" parted={parted} reducedMotion={reducedMotion} />
    </div>
  );
}

function Velvet({
  side,
  parted,
  duration,
}: {
  side: "left" | "right";
  parted: boolean;
  duration: number;
}) {
  const left = side === "left";
  return (
    <motion.div
      className={`absolute inset-y-0 w-[66%] ${left ? "left-0 origin-left" : "right-0 origin-right"}`}
      initial={{ x: parted ? (left ? "-76%" : "76%") : "0%" }}
      animate={{ x: parted ? (left ? "-76%" : "76%") : "0%" }}
      transition={
        duration < 0.05
          ? { duration: 0.01 }
          : { type: "spring", stiffness: 62, damping: 14, mass: 1.15 }
      }
      style={{
        boxShadow: left
          ? "18px 0 28px rgba(0,0,0,0.35)"
          : "-18px 0 28px rgba(0,0,0,0.35)",
      }}
    >
      {FOLDS.map((color, i) => (
        <span
          key={color + i}
          className="absolute inset-y-0"
          style={{
            left: `${i * 12.5}%`,
            width: "14%",
            background: `linear-gradient(90deg, rgba(0,0,0,0.28), ${color} 42%, rgba(255,220,190,0.16) 78%, rgba(0,0,0,0.35))`,
          }}
        />
      ))}
      <span
        className={`absolute inset-y-0 w-[3px] ${left ? "right-0" : "left-0"}`}
        style={{
          background:
            "linear-gradient(180deg, rgba(255,236,210,0.15), rgba(255,236,210,0.55), rgba(255,236,210,0.12))",
        }}
      />
    </motion.div>
  );
}

function Valance() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 h-7">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #4a0818 0%, #6e1028 70%, #3a0614 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-3"
        style={{
          background:
            "radial-gradient(circle at 12px 0, transparent 10px, #5c0c20 11px) 0 0 / 24px 12px repeat-x",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#e8c872]/70" />
    </div>
  );
}

function Tieback({
  side,
  parted,
  reducedMotion,
}: {
  side: "left" | "right";
  parted: boolean;
  reducedMotion: boolean;
}) {
  const left = side === "left";
  return (
    <motion.div
      className={`absolute top-[46%] z-20 ${left ? "left-[11%]" : "right-[11%]"}`}
      initial={false}
      animate={{ opacity: parted ? 1 : 0, y: parted ? 0 : -10 }}
      transition={{
        duration: reducedMotion ? 0.01 : 0.45,
        delay: parted && !reducedMotion ? 1.35 : 0,
      }}
    >
      <div
        className="h-2 w-16 rounded-full"
        style={{
          background: "linear-gradient(180deg, #fff1c2, #d4a441 45%, #7a5418)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
          transform: left ? "rotate(-8deg)" : "rotate(8deg)",
        }}
      />
      <div
        className={`relative mt-0.5 ${left ? "ml-10" : "mr-10 ml-auto"} w-4`}
      >
        <span
          className="absolute left-1/2 top-0 h-3 w-2 -translate-x-1/2 rounded-sm"
          style={{
            background: "linear-gradient(90deg, #8a611c, #ffe28a, #8a611c)",
          }}
        />
        {[-5, 0, 5].map((shift) => (
          <span
            key={shift}
            className="absolute top-2 h-8 w-[3px] rounded-full"
            style={{
              left: `calc(50% + ${shift}px)`,
              background:
                "linear-gradient(180deg, #f3d78a, #a8742a 40%, #5c3a10)",
            }}
          />
        ))}
        <span
          className="absolute top-9 left-1/2 size-2 -translate-x-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #fff6d4, #a8742a)",
          }}
        />
      </div>
    </motion.div>
  );
}
