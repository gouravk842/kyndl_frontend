/**
 * Live play store for Whack My Face. Seeded from authored config when a round
 * starts; mid-game scores are never persisted to the Creation.
 */

import { create } from "zustand";

import type { WhackAMoleConfig } from "./config";
import {
  createInitialState,
  type GameState,
  hitHole,
  replay,
  startPlaying,
  tick,
} from "./lib/engine";

type PlayStore = {
  config: WhackAMoleConfig | null;
  faceUrl: string | null;
  game: GameState;
  seed: (config: WhackAMoleConfig, faceUrl: string | null) => void;
  begin: () => void;
  whack: (hole: number) => void;
  advance: (now: number, dtMs: number) => void;
  playAgain: () => void;
  clearQuip: () => void;
};

export const usePlayStore = create<PlayStore>((set, get) => ({
  config: null,
  faceUrl: null,
  game: createInitialState(),

  seed: (config, faceUrl) =>
    set({
      config,
      faceUrl,
      game: createInitialState(),
    }),

  begin: () => {
    const { config } = get();
    if (!config) return;
    set({
      game: startPlaying(
        createInitialState(),
        config.difficulty,
        performance.now(),
      ),
    });
  },

  whack: (hole) => {
    const { config, game } = get();
    if (!config) return;
    const result = hitHole(game, hole, config.difficulty, config.hitQuips);
    set({ game: result.state });
  },

  advance: (now, dtMs) => {
    const { config, game } = get();
    if (!config || game.phase !== "playing") return;
    set({ game: tick(game, config.difficulty, now, dtMs) });
  },

  playAgain: () => {
    const { config } = get();
    if (!config) return;
    set({
      game: replay(config.difficulty, performance.now()),
    });
  },

  clearQuip: () =>
    set((s) => ({
      game: { ...s.game, lastQuip: null },
    })),
}));
