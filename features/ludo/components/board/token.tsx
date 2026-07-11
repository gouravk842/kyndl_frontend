"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cellForPosition, GRID, type SeatId } from "../../lib/board";
import { SEAT_COLORS } from "../../lib/colors";
import type { SeatColorKey } from "../../types";

/** Centre of a cell as a percentage of the board, plus a cluster offset. */
function pct(r: number, c: number) {
  return {
    left: ((c + 0.5) / GRID) * 100,
    top: ((r + 0.5) / GRID) * 100,
  };
}

export interface TokenView {
  seat: SeatId;
  color: SeatColorKey;
  index: number;
  pos: number;
  /** Small offset (in board %) so co-located tokens don't fully overlap. */
  dx: number;
  dy: number;
  movable: boolean;
  /** Positions to animate through (set only on the actively moving token). */
  waypoints?: number[];
}

export function Token({
  view,
  onClick,
}: {
  view: TokenView;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const color = SEAT_COLORS[view.color];

  const path = view.waypoints?.length ? view.waypoints : [view.pos];

  const points = path.map((p) => {
    const cell = cellForPosition(view.seat, p, view.index);
    return pct(cell.r, cell.c);
  });

  const lefts = points.map((p) => `${p.left + view.dx}%`);
  const tops = points.map((p) => `${p.top + view.dy}%`);

  const moving = (view.waypoints?.length ?? 0) > 1;
  const duration = reduce ? 0 : moving ? path.length * 0.165 : 0.28;

  return (
    <motion.button
      type="button"
      aria-label={`${color.label} token ${view.index + 1}`}
      onClick={onClick}
      disabled={!view.movable}
      initial={false}
      animate={{
        left: lefts.length > 1 ? lefts : lefts[0],
        top: tops.length > 1 ? tops : tops[0],
        // a little lift mid-hop reads as a physical bounce
        scale: moving && !reduce ? [1, 1.12, 1] : 1,
      }}
      transition={{
        duration,
        ease: moving ? "easeInOut" : "easeOut",
        times: undefined,
      }}
      whileHover={view.movable ? { scale: 1.16 } : undefined}
      whileTap={view.movable ? { scale: 0.94 } : undefined}
      className="absolute z-20 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
      style={{
        width: `${(1 / GRID) * 100 * 0.82}%`,
        height: `${(1 / GRID) * 100 * 0.82}%`,
        cursor: view.movable ? "pointer" : "default",
        filter: "drop-shadow(0 3px 3px rgba(40,20,10,0.32))",
      }}
    >
      {/* movable pulse ring */}
      {view.movable && (
        <motion.span
          aria-hidden
          className="absolute inset-[-22%] rounded-full"
          style={{ border: `2px solid ${color.base}` }}
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.9, 1.12, 0.9] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {/* the pawn — a domed disc with a glossy top */}
      <span
        className="relative block h-full w-full rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${color.light} 0%, ${color.base} 46%, ${color.shade} 100%)`,
          border: `1.5px solid ${color.shade}`,
          boxShadow: `inset 0 -2px 3px ${color.shade}, inset 0 2px 2px rgba(255,255,255,0.55)`,
        }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "rgba(255,255,255,0.78)" }}
        />
      </span>
    </motion.button>
  );
}
