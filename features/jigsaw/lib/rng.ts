/**
 * A tiny seeded PRNG. The whole engine is deterministic in its seed: the same
 * `JigsawConfig.seed` always cuts the same pieces and scatters them the same
 * way, so a saved gift puzzle reopens exactly as it was authored.
 *
 * `mulberry32` is a well-known 32-bit generator — fast, dependency-free, and
 * plenty random for piece shapes and layout (we are not doing cryptography).
 */

export interface Rng {
  /** Next float in [0, 1). */
  next(): number;
  /** Float in [min, max). */
  range(min: number, max: number): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Coin flip with probability `p` of `true` (default 0.5). */
  bool(p?: number): boolean;
}

/** Create a generator from a numeric seed. */
export function makeRng(seed: number): Rng {
  // mulberry32 — keep the state in a closure so each Rng is independent.
  let state = seed >>> 0;
  const next = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    bool: (p = 0.5) => next() < p,
  };
}

/**
 * Derive a stable seed when a config omits one. Hashing the image src + grid
 * keeps it deterministic per-puzzle without the caller having to invent one.
 */
export function seedFrom(text: string): number {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
