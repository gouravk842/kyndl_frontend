/**
 * The "Moment" content document — shared by every Moment experience
 * (`proposal`, `date-ask`). One paced, single-use emotional ask: the recipient
 * is walked through an approach, asked a question, and their answer travels back
 * to the creator. The document is theme-driven so a creator picks the world the
 * recipient opens into.
 *
 * Mirrors the backend serializers in `experiences/types/{proposal,date_ask}.py`.
 * Art-direction-ish fields are intentionally loose so additive client tweaks
 * don't need a server migration (the backend stores them as pass-through JSON).
 */

export type MomentTheme = "midnight" | "blush";

/** One beat in the paced "approach" — the recipient taps once to advance each. */
export type MomentBeat =
  | { id: string; kind: "line"; text: string }
  | { id: string; kind: "photo"; fileId: string; caption?: string }
  | { id: string; kind: "counter"; label: string; sinceDate: string };

export type MomentQuestion = {
  /** The ask itself, e.g. "Will you marry me?" */
  text: string;
  yesLabel: string;
  noLabel: string;
  /** When true, the "No" gently evades — sweet, never mean. Creator can disable. */
  playfulNo: boolean;
};

export type MomentCelebration = {
  /** Big line shown to the recipient the instant they say yes. */
  headline: string;
  subtext?: string;
  /** Optional two names that bloom together. */
  askerName?: string;
  recipientName?: string;
};

/** Optional plan details surfaced after a "yes" — used by date-ask. */
export type MomentPlan = {
  when?: string;
  where?: string;
};

export type MomentDoc = {
  theme: MomentTheme;
  /** Text on the sealed envelope the recipient breaks to begin. */
  sealLabel: string;
  approach: MomentBeat[];
  question: MomentQuestion;
  celebration: MomentCelebration;
  plan?: MomentPlan;
};

export type MomentAnswer = "yes" | "no";
