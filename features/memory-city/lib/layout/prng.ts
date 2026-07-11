/**
 * Deterministic pseudo-randomness for the layout engine.
 *
 * The city must be a *pure function* of its memories: the same city id + the same
 * memory list must produce the byte-identical world on every device and every
 * reload (otherwise share links reshape under the recipient, and the "it grew"
 * moment breaks). So the engine never calls `Math.random()` — it seeds a small,
 * fast PRNG (mulberry32) off a string hash and draws every jitter from it.
 */

/** FNV-1a-ish 32-bit string hash → a stable numeric seed. */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Ensure non-zero, unsigned.
  return (h >>> 0) || 0x9e3779b9;
}

/** mulberry32 — a compact, well-distributed 32-bit PRNG. Returns [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seeded RNG bundle with the small helpers the engine reaches for. */
export interface Rng {
  /** Next float in [0, 1). */
  next(): number;
  /** Float in [min, max). */
  range(min: number, max: number): number;
  /** Integer in [min, max]. */
  int(min: number, max: number): number;
  /** Pick an element deterministically. */
  pick<T>(items: readonly T[]): T;
}

/** Build a seeded RNG from any string (e.g. `${cityId}:fillers`). */
export function makeRng(seedInput: string): Rng {
  const next = mulberry32(hashSeed(seedInput));
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)]!,
  };
}
