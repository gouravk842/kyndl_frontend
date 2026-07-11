"use client";

import { AnimatePresence, motion } from "framer-motion";

import { LAST_POS, type SeatId } from "../lib/board";
import { SEAT_COLORS } from "../lib/colors";
import { useLudoStore } from "../store";

export function WinnerModal() {
  const phase = useLudoStore((s) => s.phase);
  const players = useLudoStore((s) => s.players);
  const finishOrder = useLudoStore((s) => s.finishOrder);
  const rematch = useLudoStore((s) => s.rematch);
  const resetToSetup = useLudoStore((s) => s.resetToSetup);

  // Final standings: finishers in order, then the rest by tokens-home.
  const standings: SeatId[] = [
    ...finishOrder,
    ...players
      .filter((p) => !finishOrder.includes(p.seat))
      .sort(
        (a, b) =>
          b.tokens.filter((t) => t.pos >= LAST_POS).length -
          a.tokens.filter((t) => t.pos >= LAST_POS).length,
      )
      .map((p) => p.seat),
  ];

  const winner = players.find((p) => p.seat === standings[0]);
  const winColor = winner ? SEAT_COLORS[winner.color] : null;

  return (
    <AnimatePresence>
      {phase === "finished" && winner && (
        <motion.div
          className="absolute inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#2A1812]/55 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[#F2DACE] bg-[#FFFBF7] p-6 text-center shadow-2xl"
          >
            <div className="mb-1 text-5xl">🏆</div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#C75B39] uppercase">
              Winner
            </p>
            <h2
              className="mt-1 font-display text-3xl"
              style={{ color: winColor?.ink ?? "#3A2A25" }}
            >
              {winner.name}
            </h2>
            <p className="mt-1 text-sm text-[#92786C]">
              brought every token home first 💕
            </p>

            <ul className="mt-5 space-y-1.5 text-left">
              {standings.map((seat, i) => {
                const p = players.find((x) => x.seat === seat)!;
                const c = SEAT_COLORS[p.color];
                const home = p.tokens.filter((t) => t.pos >= LAST_POS).length;
                return (
                  <li
                    key={seat}
                    className="flex items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2"
                  >
                    <span className="w-5 text-sm text-[#92786C]">{i + 1}</span>
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ background: c.base }}
                    />
                    <span className="flex-1 truncate text-sm text-[#3A2A25]">
                      {p.name}
                    </span>
                    <span className="text-xs text-[#92786C]">{home}/4</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={rematch}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-sm font-medium text-white kyndl-glow-warm transition-transform hover:-translate-y-0.5"
              >
                Rematch
              </button>
              <button
                type="button"
                onClick={resetToSetup}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[#F2DACE] bg-white text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50"
              >
                New setup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
