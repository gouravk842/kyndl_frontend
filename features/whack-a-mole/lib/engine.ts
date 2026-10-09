/**
 * Pure whack-a-mole rules — no React, no DOM.
 *
 * Content (face, quips, apology) is authored; this module only owns spawn,
 * hit/miss scoring, and the timed round. The UI drives `tick` on a rAF loop.
 */

import type { Difficulty } from "../config";

export type MoleKind = "face" | "apology" | "sacred";

export type ActiveMole = {
  id: string;
  hole: number;
  kind: MoleKind;
  /** Epoch ms when this mole auto-despawns (counts as a miss for face/apology). */
  expiresAt: number;
};

export type GamePhase = "intro" | "playing" | "ended";

export type GameState = {
  phase: GamePhase;
  score: number;
  hits: number;
  misses: number;
  sacredHits: number;
  apologiesCollected: number;
  /** Remaining round time in ms while playing. */
  timeLeftMs: number;
  moles: ActiveMole[];
  lastQuip: string | null;
  combo: number;
  /** Next scheduled spawn time (epoch ms). */
  nextSpawnAt: number;
  /** Monotonic id counter for moles. */
  nextId: number;
};

export type DifficultyTuning = {
  holeCount: number;
  roundMs: number;
  spawnIntervalMs: number;
  moleLifetimeMs: number;
  maxActive: number;
  /** Probability a spawn is an apology mole (else face, with sacred overlay). */
  apologyChance: number;
  sacredChance: number;
  facePoints: number;
  apologyPoints: number;
  sacredPenalty: number;
};

export const TUNING: Record<Difficulty, DifficultyTuning> = {
  chill: {
    holeCount: 9,
    roundMs: 45_000,
    spawnIntervalMs: 900,
    moleLifetimeMs: 1400,
    maxActive: 2,
    apologyChance: 0.18,
    sacredChance: 0.14,
    facePoints: 100,
    apologyPoints: 200,
    sacredPenalty: 50,
  },
  spicy: {
    holeCount: 9,
    roundMs: 40_000,
    spawnIntervalMs: 650,
    moleLifetimeMs: 1000,
    maxActive: 3,
    apologyChance: 0.16,
    sacredChance: 0.16,
    facePoints: 100,
    apologyPoints: 250,
    sacredPenalty: 75,
  },
  chaos: {
    holeCount: 9,
    roundMs: 35_000,
    spawnIntervalMs: 450,
    moleLifetimeMs: 750,
    maxActive: 4,
    apologyChance: 0.14,
    sacredChance: 0.18,
    facePoints: 120,
    apologyPoints: 300,
    sacredPenalty: 100,
  },
};

export function createInitialState(): GameState {
  return {
    phase: "intro",
    score: 0,
    hits: 0,
    misses: 0,
    sacredHits: 0,
    apologiesCollected: 0,
    timeLeftMs: 0,
    moles: [],
    lastQuip: null,
    combo: 0,
    nextSpawnAt: 0,
    nextId: 1,
  };
}

export function startPlaying(
  state: GameState,
  difficulty: Difficulty,
  now: number,
): GameState {
  const t = TUNING[difficulty];
  return {
    ...createInitialState(),
    phase: "playing",
    timeLeftMs: t.roundMs,
    nextSpawnAt: now + 400,
    nextId: state.nextId,
  };
}

function pickKind(t: DifficultyTuning, rng: () => number): MoleKind {
  const roll = rng();
  if (roll < t.sacredChance) return "sacred";
  if (roll < t.sacredChance + t.apologyChance) return "apology";
  return "face";
}

function freeHoles(state: GameState, holeCount: number): number[] {
  const occupied = new Set(state.moles.map((m) => m.hole));
  const free: number[] = [];
  for (let i = 0; i < holeCount; i++) {
    if (!occupied.has(i)) free.push(i);
  }
  return free;
}

function spawnMole(
  state: GameState,
  t: DifficultyTuning,
  now: number,
  rng: () => number,
): GameState {
  if (state.moles.length >= t.maxActive) return state;
  const free = freeHoles(state, t.holeCount);
  if (!free.length) return state;
  const hole = free[Math.floor(rng() * free.length)]!;
  const mole: ActiveMole = {
    id: `m-${state.nextId}`,
    hole,
    kind: pickKind(t, rng),
    expiresAt: now + t.moleLifetimeMs,
  };
  return {
    ...state,
    nextId: state.nextId + 1,
    moles: [...state.moles, mole],
    nextSpawnAt: now + t.spawnIntervalMs,
  };
}

/**
 * Advance the clock: expire moles, spawn new ones, end the round when time is up.
 */
export function tick(
  state: GameState,
  difficulty: Difficulty,
  now: number,
  dtMs: number,
  rng: () => number = Math.random,
): GameState {
  if (state.phase !== "playing") return state;

  let next: GameState = {
    ...state,
    timeLeftMs: Math.max(0, state.timeLeftMs - dtMs),
  };

  // Expire moles that timed out.
  const kept: ActiveMole[] = [];
  let misses = next.misses;
  let combo = next.combo;
  for (const mole of next.moles) {
    if (mole.expiresAt <= now) {
      if (mole.kind !== "sacred") {
        misses += 1;
        combo = 0;
      }
    } else {
      kept.push(mole);
    }
  }
  next = { ...next, moles: kept, misses, combo };

  if (next.timeLeftMs <= 0) {
    return {
      ...next,
      phase: "ended",
      moles: [],
      timeLeftMs: 0,
      lastQuip: null,
    };
  }

  // Spawn while behind schedule (catch up at most one per tick to avoid floods).
  if (now >= next.nextSpawnAt) {
    next = spawnMole(next, TUNING[difficulty], now, rng);
  }

  return next;
}

export type HitResult = {
  state: GameState;
  kind: MoleKind | null;
  quip: string | null;
};

/**
 * Attempt a hit on a hole. Empty holes / wrong timing are no-ops.
 */
export function hitHole(
  state: GameState,
  hole: number,
  difficulty: Difficulty,
  hitQuips: string[],
  rng: () => number = Math.random,
): HitResult {
  if (state.phase !== "playing") return { state, kind: null, quip: null };

  const idx = state.moles.findIndex((m) => m.hole === hole);
  if (idx < 0) return { state, kind: null, quip: null };

  const mole = state.moles[idx]!;
  const t = TUNING[difficulty];
  const moles = state.moles.filter((_, i) => i !== idx);

  if (mole.kind === "sacred") {
    return {
      kind: "sacred",
      quip: null,
      state: {
        ...state,
        moles,
        score: Math.max(0, state.score - t.sacredPenalty),
        sacredHits: state.sacredHits + 1,
        combo: 0,
        lastQuip: null,
      },
    };
  }

  const combo = state.combo + 1;
  const comboBonus = Math.min(combo - 1, 5) * 10;
  const base = mole.kind === "apology" ? t.apologyPoints : t.facePoints;
  const quips = hitQuips.map((q) => q.trim()).filter(Boolean);
  const quip =
    mole.kind === "face" && quips.length
      ? quips[Math.floor(rng() * quips.length)]!
      : mole.kind === "apology"
        ? "Apology unlocked"
        : null;

  return {
    kind: mole.kind,
    quip,
    state: {
      ...state,
      moles,
      score: state.score + base + comboBonus,
      hits: state.hits + 1,
      apologiesCollected:
        state.apologiesCollected + (mole.kind === "apology" ? 1 : 0),
      combo,
      lastQuip: quip,
    },
  };
}

export function replay(difficulty: Difficulty, now: number): GameState {
  return startPlaying(createInitialState(), difficulty, now);
}
