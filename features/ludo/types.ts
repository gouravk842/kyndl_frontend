import type { SeatId } from "./lib/board";

export type { SeatId };

/** A token's logical position. -1 = base, 0..56 = path, 56 = finished. */
export type TokenPos = number;

export interface Token {
  /** 0..3 within its seat. */
  index: number;
  pos: TokenPos;
}

export interface Player {
  seat: SeatId;
  name: string;
  /** Palette key — see SEAT_COLORS in lib/colors. */
  color: SeatColorKey;
  isBot: boolean;
  tokens: Token[];
}

export type SeatColorKey = "rose" | "amber" | "teal" | "plum";

/** Which moments fire a couple activity. */
export type ActivityTrigger = "star" | "capture" | "home" | "sixes";

export type ActivityIntensity = "sweet" | "fun" | "spicy";

export interface ActivityDecks {
  sweet: string[];
  fun: string[];
  spicy: string[];
}

export interface ActivityConfig {
  enabled: boolean;
  triggers: Record<ActivityTrigger, boolean>;
  /** Pull cards from this deck ("mixed" = any of the three). */
  intensity: ActivityIntensity | "mixed";
  decks: ActivityDecks;
}

/** A surfaced activity prompt, shown over the board until acknowledged. */
export interface ActivityPrompt {
  id: string;
  trigger: ActivityTrigger;
  /** The player who triggered it. */
  seat: SeatId;
  text: string;
}

export interface GameConfig {
  players: {
    seat: SeatId;
    name: string;
    color: SeatColorKey;
    isBot: boolean;
  }[];
  activities: ActivityConfig;
}

export type GamePhase = "setup" | "playing" | "finished";

/** A queued board hop the renderer should animate before the next interaction. */
export interface PendingMove {
  seat: SeatId;
  tokenIndex: number;
  /** Logical positions the token passes through, inclusive of start & end. */
  waypoints: number[];
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  config: GameConfig;
  /** Index into `players` whose turn it is. */
  turn: number;
  dice: number | null;
  diceRolling: boolean;
  /** True while the engine is mid-resolution (locks input). */
  busy: boolean;
  /** Token indices the current player may move with the current dice. */
  movable: number[];
  /** Consecutive sixes this turn (3 forfeits the turn). */
  sixStreak: number;
  /** Seats that have finished, in finishing order. */
  finishOrder: SeatId[];
  activity: ActivityPrompt | null;
  /** Short status line for the HUD. */
  message: string;
}
