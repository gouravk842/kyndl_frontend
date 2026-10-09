/**
 * Mystery Box module — a reward. The memory arrives sealed in a crate the
 * recipient taps to shatter (DOM/CSS burst — no nested WebGL canvas), then the
 * message inside is revealed.
 *
 * Config is message-like — it *contains* the memory — so a box can wrap any
 * remembered moment.
 */

import { z } from "zod";

import type { MemoryModule } from "@/features/unlocks";
import { registerModule } from "@/features/unlocks";

import { MOODS } from "../../types";

export const mysteryBoxConfigSchema = z.object({
  /** Headline revealed after the box opens. */
  title: z.string().min(1),
  /** The remembered moment inside. */
  body: z.string().min(1),
  /** Emotional tone → accent colour of the box + reveal. */
  mood: z.enum(MOODS),
  /** Optional teaser shown on the sealed box. */
  teaser: z.string().optional(),
});

export type MysteryBoxConfig = z.infer<typeof mysteryBoxConfigSchema>;

export const mysteryBoxModule: MemoryModule<MysteryBoxConfig> = {
  type: "mystery-box",
  kind: "reward",
  meta: {
    label: "Mystery Box",
    description: "A memory sealed in a crate they shatter open.",
    icon: "package",
  },
  schema: mysteryBoxConfigSchema,
  defaults: (): MysteryBoxConfig => ({
    title: "A little surprise",
    body: "Something I've been waiting to tell you.",
    mood: "joyful",
  }),
  Interaction: () => import("./interaction"),
};

registerModule(mysteryBoxModule);
