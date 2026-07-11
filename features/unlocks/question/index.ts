/**
 * Question module — a gate. The recipient must answer a prompt (free text or
 * multiple choice) before the node's reward unlocks. Answers match
 * case-insensitively after trimming, so "Paris" / "paris " both pass.
 */

import { z } from "zod";

import { registerModule } from "../registry";
import type { MemoryModule } from "../types";

export const questionConfigSchema = z.object({
  /** The question, e.g. "Where did we first meet?". */
  prompt: z.string().min(1),
  /** Accepted answers (case-insensitive, trimmed). At least one. */
  answers: z.array(z.string().min(1)).min(1),
  /** Optional multiple-choice options; when present, shown as buttons. */
  choices: z.array(z.string().min(1)).optional(),
  /** Optional nudge shown after a wrong attempt. */
  hint: z.string().optional(),
});

export type QuestionConfig = z.infer<typeof questionConfigSchema>;

export const questionModule: MemoryModule<QuestionConfig> = {
  type: "question",
  kind: "gate",
  meta: {
    label: "Question",
    description: "A question they must answer to unlock the memory.",
    icon: "help-circle",
  },
  schema: questionConfigSchema,
  defaults: (): QuestionConfig => ({
    prompt: "What's our special date?",
    answers: ["answer"],
  }),
  Interaction: () => import("./interaction"),
};

registerModule(questionModule);
