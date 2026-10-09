/** Deterministic silly % from two names. */

export function normalizeName(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z]/g, "");
}

function hashNames(a: string, b: string): number {
  const s = `${normalizeName(a)}::${normalizeName(b)}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Percent in 41–99 so results feel fun, never zero. */
export function lovePercent(nameA: string, nameB: string): number {
  if (!normalizeName(nameA) || !normalizeName(nameB)) return 0;
  return 41 + (hashNames(nameA, nameB) % 59);
}

export function bandFor(pct: number): "low" | "mid" | "high" {
  if (pct < 60) return "low";
  if (pct < 85) return "mid";
  return "high";
}
