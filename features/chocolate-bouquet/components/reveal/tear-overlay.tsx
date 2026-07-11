"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Chocolate } from "../../config";
import { kindOf } from "../../lib/chocolate-kinds";
import { RevealCard } from "./reveal-card";

const CARD_W = 300;
const CARD_H = 404;
/** Peel distance that counts as a completed tear. */
const DONE_AT = CARD_H * 0.58;

/** A zigzag clip-path along the top edge — the torn foil line. */
function tornTopClip(teeth = 22): string {
  const pts: string[] = ["0% 100%", "0% 7%"];
  for (let i = 0; i <= teeth; i++) {
    const x = (i / teeth) * 100;
    const y = i % 2 === 0 ? 0 : 7;
    pts.push(`${x}% ${y}%`);
  }
  pts.push("100% 100%");
  return `polygon(${pts.join(", ")})`;
}

/**
 * The drag-to-tear reveal. The chocolate the visitor picked lifts in the scene
 * behind this; here they grab the foil and **peel it downward** to rip it open —
 * the tear tracks the finger, not a timer, which is what makes it feel physical.
 * Past the threshold the wrapper flies off and the memory tucked inside unfolds;
 * released short, it springs back so nothing opens by accident.
 */
export function TearOverlay({
  chocolate,
  onOpened,
  onClose,
}: {
  chocolate: Chocolate;
  onOpened: (id: number) => void;
  onClose: () => void;
}) {
  const kind = kindOf(chocolate.type);
  const [torn, setTorn] = useState(false);
  const y = useMotionValue(0);
  const clip = useMemo(() => tornTopClip(), []);
  const reduceMotion = useReducedMotion();

  // Foil curls back and dims as it peels.
  const curl = useTransform(y, [0, DONE_AT], [0, -38], { clamp: true });
  const foilShade = useTransform(y, [0, DONE_AT], [1, 0.72], { clamp: true });
  const hint = useTransform(y, [0, 40], [1, 0], { clamp: true });

  useEffect(() => {
    if (torn) onOpened(chocolate.id);
  }, [torn, chocolate.id, onOpened]);

  function finishTear() {
    setTorn(true);
    animate(y, CARD_H + 160, { type: "spring", stiffness: 220, damping: 26 });
  }

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => torn && onClose()}
    >
      <div
        aria-hidden
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(28,10,16,0.62)" }}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-[73] inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        <X className="size-4" /> Close
      </button>

      <div
        className="relative"
        style={{ width: CARD_W, height: CARD_H }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The memory, revealed from the top down as the foil peels away. */}
        <div className="absolute inset-0">
          <RevealCard chocolate={chocolate} opened={torn} />
        </div>

        {/* The foil wrapper — drag it down to tear. */}
        {!torn ? (
          <motion.div
            className="absolute inset-0 cursor-grab touch-none rounded-[22px] active:cursor-grabbing"
            style={{
              y,
              clipPath: clip,
              opacity: foilShade,
              background: `linear-gradient(135deg, ${kind.wrapperHi} 0%, ${kind.wrapper} 45%, ${kind.wrapperHi} 100%)`,
              boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: CARD_H + 160 }}
            dragElastic={0.04}
            onDragEnd={() => {
              if (y.get() >= DONE_AT) finishTear();
              else animate(y, 0, { type: "spring", stiffness: 320, damping: 30 });
            }}
          >
            {/* foil sheen streak */}
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-[22px]"
              style={{
                opacity: foilShade,
                background:
                  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.5) 50%, transparent 62%)",
                mixBlendMode: "screen",
              }}
            />
            {/* curling top lip */}
            <motion.div
              aria-hidden
              className="absolute inset-x-0 top-0 h-10 origin-top rounded-t-[22px]"
              style={{
                rotateX: curl,
                background: `linear-gradient(180deg, rgba(0,0,0,0.28), transparent)`,
              }}
            />

            {/* drag hint */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 text-white"
              style={{ opacity: hint }}
            >
              <span className="text-sm font-semibold tracking-wide [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
                drag down to unwrap
              </span>
              <motion.span
                aria-hidden
                className="text-2xl"
                animate={reduceMotion ? {} : { y: [0, 8, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                ↓
              </motion.span>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
