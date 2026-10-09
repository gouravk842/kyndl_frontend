import {
  CLIMAX_SQUARE,
  SAFE_SQUARES,
  type Square,
} from "@/features/snakes-and-lovers/config";
import {
  heatAllowed,
  type HeatChoice,
  heatRank,
} from "@/features/snakes-and-lovers/setup";

/** Skips each player can spend in one game. A skip does not count as doing the dare. */
export const SKIP_TOKENS = 3;

const WORD_NUMBERS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
};

const MAX_SECONDS = 10 * 60;

/** A dare's identity for "already used this game". Blank names are not tracked. */
export function dareKey(square: { name: string }): string {
  return square.name.trim().toLowerCase();
}

/**
 * Seconds mentioned in the how-to, if any. The ring only shows when this
 * returns a number — a dare with no duration stays untimed.
 */
export function dareSeconds(note: string | undefined): number | null {
  if (!note) return null;
  const text = note.toLowerCase();

  const numeric = text.match(/(\d+)\s*(seconds?|secs?|minutes?|mins?)/);
  if (numeric) {
    const amount = Number(numeric[1]);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const seconds = numeric[2]!.startsWith("min") ? amount * 60 : amount;
    return Math.min(seconds, MAX_SECONDS);
  }

  const words = text.match(
    /\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|sixty)\s+(seconds?|minutes?|mins?)\b/,
  );
  if (words) {
    const amount = WORD_NUMBERS[words[1]!] ?? 0;
    if (amount <= 0) return null;
    const seconds = words[2]!.startsWith("min") ? amount * 60 : amount;
    return Math.min(seconds, MAX_SECONDS);
  }

  if (/\ba full minute\b/.test(text)) return 60;
  return null;
}

/**
 * The dare to show for a landing. The square's own dare wins until it has
 * been done, as long as it fits the heat they chose. After that, another
 * unused dare inside that heat. If nothing is left, the square's own text
 * is shown again.
 */
export function pickDare(
  squares: readonly Square[],
  landedId: number,
  used: ReadonlySet<string>,
  choice: HeatChoice = "wild",
): Square | undefined {
  const own = squares.find((square) => square.id === landedId);
  if (!own) return undefined;
  const key = dareKey(own);
  const allowed = (square: Square) => heatAllowed(choice, square.heat);

  const unused = squares
    .filter((square) => {
      const nextKey = dareKey(square);
      if (!nextKey || used.has(nextKey)) return false;
      if (square.id === CLIMAX_SQUARE || SAFE_SQUARES.has(square.id))
        return false;
      if (!allowed(square)) return false;
      return true;
    })
    .sort((a, b) => heatRank(b.heat) - heatRank(a.heat));

  if (allowed(own) && (!key || !used.has(key))) return own;
  return unused.find((square) => square.heat === own.heat) ?? unused[0] ?? own;
}
