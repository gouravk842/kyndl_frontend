/**
 * Crossword module — a gate. A small themed crossword whose answers are words
 * that matter to the pair; filling it correctly unlocks the memory. Entries are
 * placed on a `size`×`size` grid; cells not covered by any entry are blocked.
 */

import { z } from "zod";

import { registerModule } from "../registry";
import type { MemoryModule } from "../types";

export const crosswordEntrySchema = z
  .object({
    /** The solution word. Present for the owner; stripped on the public page. */
    answer: z.string().min(1).optional(),
    /** SHA-256 hex of the normalised word. All the public page receives. */
    answerHash: z.string().min(16).optional(),
    /** Letter count, so the public grid still has cells after the word is stripped. */
    letters: z.number().int().min(1).max(20).optional(),
    /** The clue shown in the across/down list. */
    clue: z.string().min(1),
    /** Zero-based start cell. */
    row: z.number().int().min(0),
    col: z.number().int().min(0),
    dir: z.enum(["across", "down"]),
  })
  .refine(
    (entry) =>
      (typeof entry.answer === "string" && entry.answer.length > 0) ||
      (typeof entry.answerHash === "string" && (entry.letters ?? 0) > 0),
    { message: "A crossword entry needs its word or a hash and length." },
  );

export const crosswordConfigSchema = z.object({
  /** Grid dimension (size×size). */
  size: z.number().int().min(2).max(10),
  entries: z.array(crosswordEntrySchema).min(1),
});

export type CrosswordEntry = z.infer<typeof crosswordEntrySchema>;
export type CrosswordConfig = z.infer<typeof crosswordConfigSchema>;

export const crosswordModule: MemoryModule<CrosswordConfig> = {
  type: "crossword",
  kind: "gate",
  meta: {
    label: "Crossword",
    description: "A small crossword of your words they solve to unlock.",
    icon: "grid-3x3",
  },
  schema: crosswordConfigSchema,
  defaults: (): CrosswordConfig => ({
    size: 3,
    entries: [
      { answer: "US", clue: "You and me", row: 0, col: 0, dir: "across" },
    ],
  }),
  Interaction: () => import("./interaction"),
};

registerModule(crosswordModule);
