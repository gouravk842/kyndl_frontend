"use client";

import { motion } from "framer-motion";

import { LAST_POS } from "../../lib/board";
import { SEAT_COLORS } from "../../lib/colors";
import type { Player } from "../../types";

export function PlayerCard({
  player,
  active,
  rank,
}: {
  player: Player;
  active: boolean;
  /** Finishing place (1-based) once the player has finished, else null. */
  rank: number | null;
}) {
  const color = SEAT_COLORS[player.color];
  const home = player.tokens.filter((t) => t.pos >= LAST_POS).length;

  return (
    <motion.div
      layout
      animate={{
        scale: active ? 1 : 0.98,
        opacity: active ? 1 : 0.82,
      }}
      className="relative flex items-center gap-3 rounded-2xl border bg-white/80 px-3 py-2.5 backdrop-blur"
      style={{
        borderColor: active ? color.base : "#F0DECF",
        boxShadow: active ? `0 6px 18px ${color.soft}` : "none",
      }}
    >
      {active && (
        <motion.span
          aria-hidden
          layoutId="turn-marker"
          className="absolute -left-1 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-full"
          style={{ background: color.base }}
        />
      )}
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
        style={{
          background: `radial-gradient(circle at 32% 28%, ${color.light}, ${color.base} 55%, ${color.shade})`,
        }}
      >
        {player.name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-[#3A2A25]">
            {player.name}
          </p>
          {player.isBot && (
            <span className="rounded-full bg-[#FFF1E9] px-1.5 text-[10px] text-[#C75B39]">
              CPU
            </span>
          )}
          {rank && (
            <span className="rounded-full bg-[#FFF6E9] px-1.5 text-[10px] text-[#B06A12]">
              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"} #{rank}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1">
          {player.tokens.map((t) => (
            <span
              key={t.index}
              className="h-2 w-2 rounded-full"
              style={{
                background: t.pos >= LAST_POS ? color.base : "transparent",
                border: `1.5px solid ${color.base}`,
                opacity: t.pos < 0 ? 0.45 : 1,
              }}
            />
          ))}
          <span className="ml-1 text-[11px] text-[#92786C]">{home}/4 home</span>
        </div>
      </div>
    </motion.div>
  );
}
