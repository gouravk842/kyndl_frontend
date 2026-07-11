/**
 * Time-lock module — a gate with no challenge to solve: the content stays
 * sealed until a chosen moment, then opens on its own. "Solving" is a function
 * of the clock, so the module exposes `isUnlocked(config)` (true once the
 * instant has passed) and the host reveals the content directly. Until then,
 * tapping the gate raises the `Interaction` — a live countdown with an optional
 * teaser — which fires `onSolve` the instant the clock reaches zero while the
 * recipient is watching.
 *
 * `unlockAt` is an ISO-8601 string (mirroring the Countdown experience's
 * `targetDate`), kept JSON-native for the opaque `unlock` block on a star.
 */

import { z } from "zod";

import { registerModule } from "../registry";
import type { MemoryModule } from "../types";

export const timeLockConfigSchema = z.object({
  /** ISO-8601 instant the memory unlocks at. */
  unlockAt: z
    .string()
    .min(1)
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "unlockAt must be a valid ISO-8601 date-time.",
    }),
  /** Optional line shown on the sealed gate while it waits. */
  teaser: z.string().optional(),
});

export type TimeLockConfig = z.infer<typeof timeLockConfigSchema>;

export const timeLockModule: MemoryModule<TimeLockConfig> = {
  type: "time-lock",
  kind: "gate",
  meta: {
    label: "Time lock",
    description: "Sealed until a date and time you choose, then it opens itself.",
    icon: "clock",
  },
  schema: timeLockConfigSchema,
  defaults: (): TimeLockConfig => ({
    unlockAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }),
  isUnlocked: (config) => Date.parse(config.unlockAt) <= Date.now(),
  Interaction: () => import("./interaction"),
};

registerModule(timeLockModule);
