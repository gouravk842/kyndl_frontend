import type { Heat } from "@/features/snakes-and-lovers/config";

/** How hot the dares in this game are allowed to get. */
export type HeatChoice = "sweet" | "spicy" | "wild";

export type SkipCount = 2 | 3;

export type GameSetup = {
  names: [string, string];
  heat: HeatChoice;
  /** Show the countdown ring when a dare mentions a duration. */
  timer: boolean;
  /** A short tick when the die is rolled. Off unless they ask for it. */
  sound: boolean;
  skips: SkipCount;
};

export type GameStats = {
  daresDone: number;
  skipsUsed: number;
  /** Longest Slow Burn this game, in squares. */
  biggestSlide: number;
  moves: number;
};

export const EMPTY_STATS: GameStats = {
  daresDone: 0,
  skipsUsed: 0,
  biggestSlide: 0,
  moves: 0,
};

export const DEFAULT_SETUP: GameSetup = {
  names: ["Player 1", "Player 2"],
  heat: "wild",
  timer: true,
  sound: false,
  skips: 3,
};

const STORAGE_KEY = "kyndl:snakes-and-lovers-setup";
const HEATS: HeatChoice[] = ["sweet", "spicy", "wild"];

const HEAT_RANK: Record<Heat, number> = {
  sweet: 0,
  flirty: 1,
  spicy: 2,
  wild: 3,
};
/** Sweet keeps the warm half. Spicy stops before wild. Wild is the full pack. */
const HEAT_CAP: Record<HeatChoice, number> = { sweet: 1, spicy: 2, wild: 3 };

export function heatAllowed(choice: HeatChoice, heat: Heat): boolean {
  return HEAT_RANK[heat] <= HEAT_CAP[choice];
}

export function heatRank(heat: Heat): number {
  return HEAT_RANK[heat];
}

export function displayName(who: number, names: [string, string]): string {
  const trimmed = names[who]?.trim();
  if (trimmed) return trimmed.slice(0, 24);
  return who === 0 ? "Player 1" : "Player 2";
}

function cleanName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().slice(0, 24);
  return trimmed || fallback;
}

export function loadSetup(): GameSetup {
  if (typeof window === "undefined") return DEFAULT_SETUP;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETUP;
    const parsed = JSON.parse(raw) as Partial<GameSetup>;
    const names = Array.isArray(parsed.names) ? parsed.names : [];
    const heat = HEATS.includes(parsed.heat as HeatChoice)
      ? (parsed.heat as HeatChoice)
      : DEFAULT_SETUP.heat;
    const skips: SkipCount = parsed.skips === 2 ? 2 : 3;
    return {
      names: [cleanName(names[0], "Player 1"), cleanName(names[1], "Player 2")],
      heat,
      timer: parsed.timer !== false,
      sound: parsed.sound === true,
      skips,
    };
  } catch {
    return DEFAULT_SETUP;
  }
}

export function saveSetup(setup: GameSetup): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
  } catch {
    // Private mode or a full disk — the game still starts.
  }
}

/** A quiet tick. Called from the roll button, so the browser allows it. */
let diceAudio: AudioContext | null = null;

export function playDiceSound(): void {
  try {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    diceAudio ??= new Ctx();
    if (diceAudio.state === "suspended") void diceAudio.resume();
    const osc = diceAudio.createOscillator();
    const gain = diceAudio.createGain();
    osc.type = "triangle";
    osc.frequency.value = 540;
    const now = diceAudio.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    gain.connect(diceAudio.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Missing audio — stay quiet.
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
