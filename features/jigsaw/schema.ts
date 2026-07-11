/**
 * Zod schema for `JigsawConfig`. Validates puzzles at load — the standalone
 * page, and any future variant (a Memory City gate, a gift reveal) all run
 * their config through here so a bad grid or missing image fails loudly rather
 * than half-rendering.
 */
import { z } from "zod";

import type { JigsawConfig } from "./types";

export const jigsawImageSchema = z.object({
  src: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  alt: z.string().optional(),
});

export const jigsawConfigSchema = z.object({
  image: jigsawImageSchema,
  grid: z.object({
    // Keep puzzles sane: at least 2×2, and a ceiling that stays smooth on DOM.
    rows: z.number().int().min(2).max(20),
    cols: z.number().int().min(2).max(20),
  }),
  seed: z.number().int().optional(),
  mode: z.enum(["board-snap", "free-assemble"]),
  edgeStyle: z.enum(["classic", "soft"]).optional(),
  snapTolerance: z.number().positive().optional(),
}) satisfies z.ZodType<JigsawConfig>;

/** Parse + validate, returning a typed config (throws on invalid input). */
export function parseJigsawConfig(input: unknown): JigsawConfig {
  return jigsawConfigSchema.parse(input);
}
