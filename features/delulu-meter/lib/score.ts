/** Score answers (1–5) against weighted questions → 0–100. */

import type { DeluluBands, DeluluQuestion } from "../config";

export function deluluScore(
  questions: DeluluQuestion[],
  answers: Record<string, number>,
): number {
  let weighted = 0;
  let max = 0;
  for (const q of questions) {
    const raw = answers[q.id];
    if (raw == null) continue;
    const clamped = Math.min(5, Math.max(1, raw));
    weighted += clamped * q.weight;
    max += 5 * q.weight;
  }
  if (max === 0) return 0;
  return Math.round((weighted / max) * 100);
}

export function bandKey(score: number): keyof DeluluBands {
  if (score < 40) return "grounded";
  if (score < 70) return "hopeful";
  return "delulu";
}
