/**
 * Pure Ludo rules. No randomness, no timers, no React — the store wires those
 * in. Everything here is a deterministic function of (state, inputs) so the
 * rules stay testable and the turn flow stays easy to reason about.
 */
import type { Player } from "../types";
import {
  HOME_ENTRY_POS,
  LAST_POS,
  ringIndexForPosition,
  SAFE_RING_INDICES,
  type SeatId,
  STAR_RING_INDICES,
} from "./board";

export function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

/** Where a token at `pos` would land with `dice`, or null if illegal. */
export function destinationFor(pos: number, dice: number): number | null {
  if (pos < 0) {
    // Leaving the base needs a 6; it lands on the seat's start cell (pos 0).
    return dice === 6 ? 0 : null;
  }
  if (pos >= LAST_POS) return null; // already finished
  const next = pos + dice;
  // Must land exactly on the centre; overshooting is not a legal move.
  return next <= LAST_POS ? next : null;
}

/** Token indices the player can legally move with `dice`. */
export function movableTokens(player: Player, dice: number): number[] {
  const out: number[] = [];
  for (const t of player.tokens) {
    if (destinationFor(t.pos, dice) !== null) out.push(t.index);
  }
  return out;
}

/**
 * The logical positions a token visits, used to drive the step-by-step hop
 * animation. Leaving the base is a single placement onto the start cell.
 */
export function waypointsFor(pos: number, dest: number): number[] {
  if (pos < 0) return [dest];
  const path: number[] = [];
  for (let p = pos + 1; p <= dest; p++) path.push(p);
  return path;
}

export function isSafePos(seat: SeatId, pos: number): boolean {
  const ring = ringIndexForPosition(seat, pos);
  if (ring === null) return true; // base / home column are always safe
  return SAFE_RING_INDICES.has(ring);
}

export function isStarPos(seat: SeatId, pos: number): boolean {
  const ring = ringIndexForPosition(seat, pos);
  return ring !== null && STAR_RING_INDICES.has(ring);
}

export interface Capture {
  seat: SeatId;
  tokenIndex: number;
}

/**
 * Opponent tokens sitting on the same ring cell as `(seat,dest)` that get sent
 * home. Tokens on a safe cell, in a home column, or in the base are immune.
 */
export function capturesAt(
  players: Player[],
  seat: SeatId,
  dest: number,
): Capture[] {
  const landingRing = ringIndexForPosition(seat, dest);
  if (landingRing === null || SAFE_RING_INDICES.has(landingRing)) return [];

  const captured: Capture[] = [];
  for (const p of players) {
    if (p.seat === seat) continue;
    for (const t of p.tokens) {
      if (ringIndexForPosition(p.seat, t.pos) === landingRing) {
        captured.push({ seat: p.seat, tokenIndex: t.index });
      }
    }
  }
  return captured;
}

export function hasWon(player: Player): boolean {
  return player.tokens.every((t) => t.pos >= LAST_POS);
}

export function isFinishMove(dest: number): boolean {
  return dest >= LAST_POS;
}

export function enteredHomeColumn(pos: number, dest: number): boolean {
  return pos < HOME_ENTRY_POS && dest >= HOME_ENTRY_POS;
}

/**
 * A naive but sensible bot pick. Priorities: finish a token, capture an
 * opponent, leave the base, otherwise advance the furthest token.
 */
export function botPickToken(
  players: Player[],
  player: Player,
  dice: number,
  movable: number[],
): number {
  let best = movable[0]!;
  let bestScore = -Infinity;
  for (const idx of movable) {
    const token = player.tokens[idx]!;
    const dest = destinationFor(token.pos, dice)!;
    let score = 0;
    if (isFinishMove(dest)) score += 100;
    if (capturesAt(players, player.seat, dest).length > 0) score += 60;
    if (token.pos < 0) score += 40; // get more tokens into play
    if (isSafePos(player.seat, dest)) score += 15;
    score += dest; // otherwise prefer progress
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best;
}
