/** Pure FLAMES rules — no React. */

export const FLAMES_OUTCOMES = [
  "Friends",
  "Lovers",
  "Affection",
  "Marriage",
  "Enemies",
  "Siblings",
] as const;

export type FlamesOutcome = (typeof FLAMES_OUTCOMES)[number];

const LETTER_TO_OUTCOME: Record<string, FlamesOutcome> = {
  F: "Friends",
  L: "Lovers",
  A: "Affection",
  M: "Marriage",
  E: "Enemies",
  S: "Siblings",
};

export function normalizeName(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z]/g, "");
}

/** Cancel shared letters (each occurrence once), return leftover count. */
export function leftoverCount(nameA: string, nameB: string): number {
  const a = normalizeName(nameA).split("");
  const b = normalizeName(nameB).split("");
  for (let i = 0; i < a.length; i++) {
    const j = b.indexOf(a[i]!);
    if (j !== -1) {
      a[i] = "";
      b[j] = "";
    }
  }
  return a.filter(Boolean).length + b.filter(Boolean).length;
}

/**
 * Classic strike: count leftover steps around remaining FLAMES letters
 * until one letter remains.
 */
export function resolveFlames(nameA: string, nameB: string): FlamesOutcome {
  const count = leftoverCount(nameA, nameB);
  if (count === 0) return "Friends";
  const letters = ["F", "L", "A", "M", "E", "S"];
  let idx = 0;
  while (letters.length > 1) {
    idx = (idx + count - 1) % letters.length;
    letters.splice(idx, 1);
  }
  return LETTER_TO_OUTCOME[letters[0]!] ?? "Friends";
}
