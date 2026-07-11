/**
 * Message module — the simplest reward: a remembered moment (title, date, body,
 * optional photo). This is what every seed memory migrates onto, so the original
 * Memory Lane content keeps working under the new node model.
 *
 * Phase 0 ships the data layer only (schema + defaults). The 3D `Shell` and the
 * reveal `Interaction` are added in a later phase; the contract leaves them
 * optional so the module is usable as data immediately.
 */

import { z } from "zod";

import type { MemoryModule } from "@/features/unlocks";
import { registerModule } from "@/features/unlocks";

import { MOODS } from "../../types";

export const messageConfigSchema = z.object({
  /** Short headline, e.g. "The morning we moved in". */
  title: z.string().min(1),
  /** ISO date (YYYY-MM-DD). */
  date: z.string().optional(),
  /** 1–3 sentences of remembrance. */
  body: z.string().min(1),
  /** Who the memory is with / from. */
  person: z.string().optional(),
  /** Emotional tone → accent colour. */
  mood: z.enum(MOODS),
  /** Optional photo URL for the memory (e.g. an uploaded asset or public path). */
  imageUrl: z.string().optional(),
});

export type MessageConfig = z.infer<typeof messageConfigSchema>;

export const messageModule: MemoryModule<MessageConfig> = {
  type: "message",
  kind: "reward",
  meta: {
    label: "Message",
    description: "A remembered moment — a title, a date, a few words, a photo.",
    icon: "mail",
  },
  schema: messageConfigSchema,
  defaults: (): MessageConfig => ({
    title: "A moment to remember",
    body: "Write what you want them to feel here.",
    mood: "joyful",
  }),
  Interaction: () => import("./interaction"),
};

registerModule(messageModule);
