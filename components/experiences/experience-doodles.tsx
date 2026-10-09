"use client";

import { motion } from "framer-motion";

/**
 * Soft, hand-drawn doodles that float around the experiences catalog.
 * Positions are deterministic so server and client paint identically.
 */

type Doodle = {
  id: string;
  kind: "heart" | "star" | "squiggle" | "spark" | "arrow" | "dot";
  left: string;
  top: string;
  size: number;
  rotate: number;
  color: string;
  duration: number;
  delay: number;
  floatY: number;
};

const DOODLES: Doodle[] = [
  {
    id: "h1",
    kind: "heart",
    left: "4%",
    top: "8%",
    size: 28,
    rotate: -12,
    color: "#FF7A59",
    duration: 5.5,
    delay: 0,
    floatY: 10,
  },
  {
    id: "s1",
    kind: "star",
    left: "92%",
    top: "6%",
    size: 22,
    rotate: 15,
    color: "#F0A13D",
    duration: 4.8,
    delay: 0.4,
    floatY: 8,
  },
  {
    id: "q1",
    kind: "squiggle",
    left: "88%",
    top: "22%",
    size: 48,
    rotate: 8,
    color: "#C75B39",
    duration: 6.2,
    delay: 0.2,
    floatY: 12,
  },
  {
    id: "sp1",
    kind: "spark",
    left: "6%",
    top: "28%",
    size: 20,
    rotate: 0,
    color: "#F2596F",
    duration: 3.6,
    delay: 0.8,
    floatY: 6,
  },
  {
    id: "a1",
    kind: "arrow",
    left: "3%",
    top: "48%",
    size: 36,
    rotate: -25,
    color: "#E07A5F",
    duration: 7,
    delay: 0.3,
    floatY: 14,
  },
  {
    id: "h2",
    kind: "heart",
    left: "94%",
    top: "52%",
    size: 20,
    rotate: 18,
    color: "#F2596F",
    duration: 5.2,
    delay: 1.1,
    floatY: 9,
  },
  {
    id: "d1",
    kind: "dot",
    left: "10%",
    top: "62%",
    size: 10,
    rotate: 0,
    color: "#FF9A7B",
    duration: 4.2,
    delay: 0.5,
    floatY: 7,
  },
  {
    id: "s2",
    kind: "star",
    left: "8%",
    top: "78%",
    size: 18,
    rotate: -8,
    color: "#C75B39",
    duration: 5.8,
    delay: 0.6,
    floatY: 11,
  },
  {
    id: "q2",
    kind: "squiggle",
    left: "90%",
    top: "72%",
    size: 42,
    rotate: -6,
    color: "#FF7A59",
    duration: 6.5,
    delay: 0.9,
    floatY: 10,
  },
  {
    id: "sp2",
    kind: "spark",
    left: "96%",
    top: "88%",
    size: 16,
    rotate: 20,
    color: "#F0A13D",
    duration: 3.9,
    delay: 1.4,
    floatY: 5,
  },
  {
    id: "h3",
    kind: "heart",
    left: "2%",
    top: "92%",
    size: 24,
    rotate: 10,
    color: "#FF7A59",
    duration: 5,
    delay: 0.7,
    floatY: 8,
  },
];

function DoodleShape({ kind, color }: { kind: Doodle["kind"]; color: string }) {
  const stroke = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "heart":
      return (
        <svg viewBox="0 0 24 22" className="size-full">
          <path
            {...stroke}
            d="M12 20S3 14 3 8a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 6-9 12-9 12Z"
          />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" className="size-full">
          <path
            {...stroke}
            d="M12 3.5 13.8 9h5.7l-4.6 3.4 1.8 5.5L12 14.6 7.3 17.9l1.8-5.5L4.5 9h5.7L12 3.5Z"
          />
        </svg>
      );
    case "squiggle":
      return (
        <svg viewBox="0 0 48 20" className="size-full">
          <path {...stroke} d="M3 12c6-8 10 8 16 0s10 8 16 0 7-6 10-2" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" className="size-full">
          <path {...stroke} d="M12 3v6M12 15v6M3 12h6M15 12h6" />
          <circle cx="12" cy="12" r="1.4" fill={color} />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 36 24" className="size-full">
          <path {...stroke} d="M4 18c8-2 14-10 24-12M22 4l6 2-2 6" />
        </svg>
      );
    case "dot":
      return (
        <svg viewBox="0 0 12 12" className="size-full">
          <circle cx="6" cy="6" r="3.5" fill={color} opacity={0.55} />
        </svg>
      );
  }
}

export function ExperienceDoodles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block"
      aria-hidden
    >
      {DOODLES.map((d) => (
        <motion.div
          key={d.id}
          className="absolute opacity-[0.45]"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            rotate: d.rotate,
          }}
          animate={{
            y: [0, -d.floatY, 0],
            rotate: [d.rotate, d.rotate + 6, d.rotate],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <DoodleShape kind={d.kind} color={d.color} />
        </motion.div>
      ))}
    </div>
  );
}

/** Tiny doodle cluster used beside section titles. */
export function SectionDoodle({ variant = 0 }: { variant?: number }) {
  const sets = [
    { kind: "heart" as const, color: "#FF7A59", rotate: -8 },
    { kind: "star" as const, color: "#F0A13D", rotate: 12 },
    { kind: "spark" as const, color: "#F2596F", rotate: 0 },
  ];
  const d = sets[variant % sets.length]!;

  return (
    <motion.span
      className="inline-flex size-6 shrink-0 opacity-70"
      aria-hidden
      animate={{ y: [0, -4, 0], rotate: [d.rotate, d.rotate + 8, d.rotate] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <DoodleShape kind={d.kind} color={d.color} />
    </motion.span>
  );
}
