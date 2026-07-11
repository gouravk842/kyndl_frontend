/**
 * Ludo for Two — content & config for the saveable, shareable keepsake.
 *
 * The board *topology* is fixed in code (see `lib/board`); everything personal
 * lives here: the title/intro, who's seated, and the couple-activity deck. A
 * saved Ludo opens straight into play with these settings — no setup screen.
 *
 * The shape mirrors the backend's `LudoContentSerializer`.
 */
import { DEFAULT_ACTIVITIES } from "./data/activities";
import type { SeatId } from "./lib/board";
import type { ActivityConfig, GameConfig, SeatColorKey } from "./types";

export type LudoPlayerConfig = {
  /** Fixed board seat (corner). The client assigns seats by player count. */
  seat: SeatId;
  name: string;
  color: SeatColorKey;
  isBot: boolean;
};

export type LudoConfig = {
  /** Card title (dashboard + the heading above the board). */
  title: string;
  /** A small line shown above the board when the game opens. */
  intro: string;
  players: LudoPlayerConfig[];
  activities: ActivityConfig;
};

/** Seats used per player count — 2 players sit diagonally. Mirrors the setup. */
export const SEATS_FOR: Record<number, SeatId[]> = {
  2: [0, 2],
  3: [0, 1, 2],
  4: [0, 1, 2, 3],
};

/** The document a fresh Ludo builder starts from. */
export const LUDO_CONFIG: LudoConfig = {
  title: "Ludo for Two",
  intro: "Our board, our rules. Roll, chase, capture — and take the dares.",
  players: [
    { seat: 0, name: "You", color: "rose", isBot: false },
    { seat: 2, name: "Partner", color: "teal", isBot: false },
  ],
  activities: DEFAULT_ACTIVITIES,
};

/** Strip the saved doc down to what the game engine's `startGame` consumes. */
export function toGameConfig(doc: LudoConfig): GameConfig {
  return { players: doc.players, activities: doc.activities };
}

/** Clone the activity config so edits never mutate the shared default. */
export function cloneActivities(c: ActivityConfig): ActivityConfig {
  return {
    ...c,
    triggers: { ...c.triggers },
    decks: {
      sweet: [...c.decks.sweet],
      fun: [...c.decks.fun],
      spicy: [...c.decks.spicy],
    },
  };
}
