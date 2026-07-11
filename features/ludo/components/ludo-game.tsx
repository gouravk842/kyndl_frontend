"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { type LudoConfig, toGameConfig } from "../config";
import { type SeatId } from "../lib/board";
import { useLudoStore } from "../store";
import { ActivityModal } from "./activity-modal";
import { Board } from "./board/board";
import { Dice } from "./dice";
import { PlayerCard } from "./hud/player-card";
import { SetupPanel } from "./setup-panel";
import { WinnerModal } from "./winner-modal";

export function LudoGame({ config }: { config?: LudoConfig }) {
  const phase = useLudoStore((s) => s.phase);
  const players = useLudoStore((s) => s.players);
  const turn = useLudoStore((s) => s.turn);
  const message = useLudoStore((s) => s.message);
  const finishOrder = useLudoStore((s) => s.finishOrder);
  const muted = useLudoStore((s) => s.muted);
  const toggleMuted = useLudoStore((s) => s.toggleMuted);
  const resetToSetup = useLudoStore((s) => s.resetToSetup);
  const startGame = useLudoStore((s) => s.startGame);

  const [rulesOpen, setRulesOpen] = useState(false);

  // A saved/shared Ludo opens straight into play with its authored settings,
  // skipping setup. Seed once per mount so live edits don't restart the game.
  const seeded = useRef(false);
  useEffect(() => {
    if (config && !seeded.current) {
      seeded.current = true;
      startGame(toGameConfig(config));
    }
  }, [config, startGame]);

  // Seeded games have no setup screen — wait for the seed effect to start play.
  if (phase === "setup") {
    return config ? null : <SetupPanel />;
  }

  const rankOf = (seat: SeatId) => {
    const i = finishOrder.indexOf(seat);
    return i >= 0 ? i + 1 : null;
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {config && (config.title.trim() || config.intro.trim()) && (
        <header className="mb-5 text-center">
          {config.title.trim() && (
            <h1 className="font-display text-2xl text-[#3A2A25] sm:text-3xl">
              {config.title}
            </h1>
          )}
          {config.intro.trim() && (
            <p className="mx-auto mt-1 max-w-xl text-sm text-[#7A6258]">
              {config.intro}
            </p>
          )}
        </header>
      )}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* board */}
        <div className="relative">
          <div className="mx-auto w-full max-w-[640px]">
            <div className="relative">
              <Board />
              <ActivityModal />
              <WinnerModal />
            </div>
          </div>
        </div>

        {/* sidebar */}
        <aside className="flex flex-col gap-4">
          {/* players */}
          <div className="space-y-2">
            {players.map((p) => (
              <PlayerCard
                key={p.seat}
                player={p}
                active={players[turn]?.seat === p.seat && phase === "playing"}
                rank={rankOf(p.seat)}
              />
            ))}
          </div>

          {/* dice + status */}
          <div className="kyndl-card-soft rounded-3xl border border-[#F4DDD0] bg-white/90 p-4">
            <Dice />
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-2 min-h-[2.5rem] text-center text-sm font-medium text-[#3A2A25]"
              >
                {message}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMuted}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#F2DACE] bg-white text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50"
            >
              {muted ? "🔇 Muted" : "🔊 Sound"}
            </button>
            <button
              type="button"
              onClick={() => setRulesOpen((o) => !o)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#F2DACE] bg-white text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50"
            >
              ❔ Rules
            </button>
            <button
              type="button"
              onClick={resetToSetup}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-[#F2DACE] bg-white text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50"
            >
              ↺ New game
            </button>
          </div>

          <AnimatePresence>
            {rulesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-2xl border border-[#F2DACE] bg-[#FFFDFB] text-sm text-[#7A6258]"
              >
                <ul className="space-y-1.5 p-4">
                  <li>🎲 Roll a 6 to bring a token out of its base.</li>
                  <li>
                    ↩️ A 6, a capture, or sending a token home earns a bonus
                    roll.
                  </li>
                  <li>
                    💥 Land on an opponent to send it home — unless it&apos;s on
                    a ⭐ safe tile.
                  </li>
                  <li>
                    ⭐ Star tiles, captures &amp; homecomings can draw a couple
                    card.
                  </li>
                  <li>
                    🏁 Land exactly on the centre to finish a token; all four
                    wins.
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
