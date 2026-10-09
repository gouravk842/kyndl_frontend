"use client";

import { motion } from "framer-motion";

import { withAlpha } from "./tint";

/**
 * Brushed-brass podium. Footlights stay inside the front ring so the last
 * bulb never walks off the brass. The underglow breathes with the memory.
 */
export function Podium({
  glow,
  bulbs,
  reducedMotion = false,
}: {
  glow: string;
  bulbs: { id: string; state: "dark" | "warm" | "burn" }[];
  reducedMotion?: boolean;
}) {
  return (
    <div className="relative w-[min(92%,640px)] shrink-0">
      <motion.div
        className="pointer-events-none absolute top-[18%] left-1/2 h-10 w-[34%] -translate-x-1/2 rounded-[50%]"
        aria-hidden
        animate={
          reducedMotion ? { opacity: 0.55 } : { opacity: [0.35, 0.7, 0.4] }
        }
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ background: withAlpha(glow, 0.55), filter: "blur(10px)" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[8%] left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-[50%]"
        aria-hidden
        animate={
          reducedMotion
            ? { opacity: 0.7 }
            : { opacity: [0.45, 0.85, 0.55], scaleX: [0.96, 1.04, 0.98] }
        }
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ background: withAlpha(glow, 0.55), filter: "blur(14px)" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static stage asset */}
      <img
        src="/memory-lantern/podium.svg"
        alt=""
        draggable={false}
        className="relative z-10 w-full"
      />
      {bulbs.length > 0 ? (
        <div className="absolute bottom-[24%] left-1/2 z-20 flex w-[36%] max-w-[190px] -translate-x-1/2 items-center justify-center overflow-hidden">
          {bulbs.map((bulb) => (
            <Bulb
              key={bulb.id}
              state={bulb.state}
              glow={glow}
              count={bulbs.length}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Bulb({
  state,
  glow,
  count,
  reducedMotion,
}: {
  state: "dark" | "warm" | "burn";
  glow: string;
  count: number;
  reducedMotion: boolean;
}) {
  const gap = count > 14 ? 1 : 3;
  const size = Math.max(
    3,
    Math.min(
      7,
      Math.floor((180 - gap * Math.max(count - 1, 0)) / Math.max(count, 1)),
    ),
  );
  const background =
    state === "burn"
      ? "#fff6d8"
      : state === "warm"
        ? "#e8c872"
        : "rgba(255,255,255,0.22)";
  const shadow =
    state === "burn"
      ? `0 0 8px 2px ${withAlpha(glow, 0.95)}`
      : state === "warm"
        ? "0 0 5px rgba(232, 200, 114, 0.75)"
        : undefined;

  const lamp = (
    <span
      className="flex flex-col items-center"
      style={{ marginInline: gap / 2 }}
    >
      {state === "burn" && !reducedMotion ? (
        <motion.span
          className="rounded-full"
          style={{ width: size, height: size, background, boxShadow: shadow }}
          animate={{ opacity: [1, 0.45, 1], scale: [1, 1.25, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <span
          className="rounded-full"
          style={{ width: size, height: size, background, boxShadow: shadow }}
        />
      )}
      <span
        className="-mt-px block rounded-b-full"
        style={{
          width: size + 3,
          height: Math.max(2, size * 0.45),
          background: "linear-gradient(180deg, #8a6230, #2a1a0c)",
        }}
      />
    </span>
  );

  return lamp;
}
