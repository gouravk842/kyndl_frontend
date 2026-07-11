"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * A realistic 3D die — an actual six-faced cube with ivory faces, recessed pips,
 * beveled edges and a contact shadow. It tumbles in 3D and settles on `value`.
 *
 * Contract: the parent decides the rolled `value` up front, then bumps
 * `rollNonce` to trigger a tumble. The cube spins several full turns and lands
 * with `value` facing the camera (added turns are multiples of 360°, so they
 * never change which face shows). `index` varies the spin between dice rolled
 * together so a pair doesn't move in lockstep.
 */

/** Which of the nine 3×3 slots are filled, per face value. */
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Cube rotation that brings each face value to the front. Opposite faces sum
 *  to 7 (1↔6, 2↔5, 3↔4), like a real die. */
const FACE_ROT: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

export function Dice3D({
  value,
  rollNonce,
  rolling = false,
  size = 64,
  index = 0,
}: {
  value: number;
  rollNonce: number;
  rolling?: boolean;
  size?: number;
  index?: number;
}) {
  const safe = FACE_ROT[value] ?? FACE_ROT[1]!;
  const [rot, setRot] = useState<{ x: number; y: number }>({ x: safe.x, y: safe.y });
  const acc = useRef({ x: 0, y: 0 });
  const first = useRef(true);

  useEffect(() => {
    const f = FACE_ROT[value] ?? FACE_ROT[1]!;
    if (first.current) {
      first.current = false;
      setRot({ x: f.x, y: f.y });
      return;
    }
    // Forward-only spin: add whole turns so the die always tumbles the same way.
    acc.current.x += 360 * (3 + (index % 2));
    acc.current.y += 360 * (4 - (index % 2));
    setRot({ x: acc.current.x + f.x, y: acc.current.y + f.y });
    // Only react to a new roll; value is read fresh each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollNonce]);

  const half = size / 2;
  const faces: { value: number; transform: string }[] = [
    { value: 1, transform: `translateZ(${half}px)` },
    { value: 6, transform: `rotateY(180deg) translateZ(${half}px)` },
    { value: 3, transform: `rotateY(90deg) translateZ(${half}px)` },
    { value: 4, transform: `rotateY(-90deg) translateZ(${half}px)` },
    { value: 2, transform: `rotateX(90deg) translateZ(${half}px)` },
    { value: 5, transform: `rotateX(-90deg) translateZ(${half}px)` },
  ];

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div style={{ width: size, height: size, perspective: size * 5 }}>
        <motion.div
          style={{
            width: size,
            height: size,
            position: "relative",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateX: rot.x, rotateY: rot.y }}
          transition={{ duration: 1.0, ease: [0.16, 0.7, 0.2, 1] }}
        >
          {faces.map((f) => (
            <DieFace key={f.value} value={f.value} transform={f.transform} size={size} />
          ))}
        </motion.div>
      </div>

      {/* Contact shadow on the table — shrinks & lightens while the die is up. */}
      <motion.span
        aria-hidden
        className="mt-1 block rounded-full bg-black/45 blur-[4px]"
        style={{ height: size * 0.13 }}
        animate={{
          width: rolling ? [size * 0.9, size * 0.5, size * 0.8] : size * 0.92,
          opacity: rolling ? [0.45, 0.2, 0.4] : 0.45,
        }}
        transition={
          rolling
            ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.4 }
        }
      />
    </div>
  );
}

function DieFace({
  value,
  transform,
  size,
}: {
  value: number;
  transform: string;
  size: number;
}) {
  const lit = PIPS[value] ?? [];
  const pip = size * 0.155;
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        transform,
        padding: size * 0.14,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
        borderRadius: size * 0.18,
        background:
          "radial-gradient(120% 120% at 30% 24%, #fffefa 0%, #f6efe1 52%, #e6dac3 100%)",
        border: "1px solid rgba(120,92,52,0.35)",
        boxShadow: `inset 0 ${size * 0.05}px ${size * 0.07}px rgba(255,255,255,0.75), inset 0 -${size * 0.05}px ${size * 0.08}px rgba(120,90,50,0.28), inset 0 0 ${size * 0.1}px rgba(120,90,50,0.18)`,
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="grid place-items-center">
          {lit.includes(i) && (
            <span
              className="block rounded-full"
              style={{
                width: pip,
                height: pip,
                background:
                  "radial-gradient(circle at 36% 30%, #6b6b6b 0%, #2a2a2a 55%, #111 100%)",
                boxShadow: `inset 0 ${size * 0.022}px ${size * 0.03}px rgba(0,0,0,0.75), 0 ${size * 0.01}px ${size * 0.012}px rgba(255,255,255,0.45)`,
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
