/**
 * Canonical reveal-parity fixture — keep in sync with
 * `kyndl_backend/experiences/tests/test_mirror_match.py`
 * (`mirror_content`, `PARITY_PARTNER_ANSWERS`, `PARITY_EXPECTED`).
 */

import type { Answer, MirrorContent, Reveal } from "../config";
import { computeReveal } from "./reveal";

export const PARITY_CONTENT: MirrorContent = {
  recipientName: "Sam",
  ownerName: "Alex",
  title: "Do we see us the same way?",
  intro: "Answer honestly — only what we both feel shows up.",
  occasion: "girlfriend-day",
  ownerAnswers: { a: "yes", b: "yes", c: "maybe", d: "no" },
  items: [
    { id: "a", mood: "us", label: "We feel like a team" },
    { id: "b", mood: "sweet", label: "Ordinary days feel special" },
    { id: "c", mood: "funny", label: "We have jokes nobody else gets" },
    { id: "d", mood: "deep", label: "I'd choose you again" },
  ],
};

export const PARITY_PARTNER_ANSWERS: Record<string, Answer> = {
  a: "yes",
  b: "maybe",
  c: "yes",
  d: "yes",
};

export const PARITY_EXPECTED: Reveal = {
  matches: [{ id: "a", label: "We feel like a team", mood: "us" }],
  softMatches: [
    { id: "b", label: "Ordinary days feel special", mood: "sweet" },
    { id: "c", label: "We have jokes nobody else gets", mood: "funny" },
  ],
  total: 4,
};

/** Throws if client reveal drifts from the locked parity expected shape. */
export function assertRevealParity(): void {
  const reveal = computeReveal(PARITY_CONTENT, PARITY_PARTNER_ANSWERS);
  const actual = JSON.stringify(reveal);
  const expected = JSON.stringify(PARITY_EXPECTED);
  if (actual !== expected) {
    throw new Error(
      `Mirror Match reveal parity failed.\nExpected: ${expected}\nActual:   ${actual}`,
    );
  }
}
