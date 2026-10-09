/**
 * Desire Matcher — content & types (Red Zone, adults only).
 *
 * A two-sided "yes / maybe / no" game for couples. The owner curates a list of
 * intimate activities and privately answers each; the partner answers the same
 * list via the shared link; the reveal shows only the things neither said no to
 * — what you're *both* into. One-sided answers are never exposed.
 *
 * Heat tiers and their styling are shared with the Desire Deck so the Red Zone
 * reads as one world.
 */

import {
  type Heat,
  HEAT_META,
  HEAT_ORDER,
} from "@/features/desire-deck/config";

export { type Heat, HEAT_META, HEAT_ORDER };

export type Answer = "yes" | "maybe" | "no";

export type MatcherItem = {
  /** Stable id the answer maps key on. */
  id: string;
  heat: Heat;
  label: string;
  image?: { fileId: string } | null;
};

export type MatcherContent = {
  /** The partner's name (who it's shared with). */
  recipientName: string;
  /** The owner's name (shown to the partner so they know who's asking). */
  ownerName: string;
  title: string;
  intro: string;
  /** The owner's own private answers, keyed by item id. Stripped from the
   *  public read, so the partner never sees them before answering. */
  ownerAnswers: Record<string, Answer>;
  items: MatcherItem[];
};

/** The reveal handed back after the partner answers (and recomputed for the
 *  owner's results view). Only mutual, non-"no" items appear. */
export type RevealItem = Pick<MatcherItem, "id" | "label" | "heat">;
export type Reveal = {
  matches: RevealItem[];
  maybes: RevealItem[];
  total: number;
};

/** Presentation for each answer (used by the swipe controls and builder). */
export const ANSWER_META: Record<Answer, { label: string; color: string }> = {
  yes: { label: "Yes", color: "#3ad17f" },
  maybe: { label: "Maybe", color: "#f0b53d" },
  no: { label: "No", color: "#ff5a6a" },
};

export const MATCHER_CONFIG: MatcherContent = {
  recipientName: "you",
  ownerName: "me",
  title: "What are we both into?",
  intro:
    "Answer each one honestly — yes, maybe, or no. I can't see what you pick, and you can't see mine. Only the things we BOTH want will show up at the end. Everything else stays private.",
  // The sample's owner answers, so the marketing demo can reveal matches locally.
  ownerAnswers: {
    i1: "yes",
    i2: "yes",
    i3: "maybe",
    i4: "yes",
    i5: "maybe",
    i6: "no",
    i7: "yes",
    i8: "maybe",
  },
  items: [
    {
      id: "i1",
      heat: "sweet",
      label: "A long, unhurried makeout — nothing else allowed",
    },
    {
      id: "i2",
      heat: "flirty",
      label: "Send each other a daring photo during the day",
    },
    { id: "i3", heat: "flirty", label: "Give a full-body massage with oil" },
    { id: "i4", heat: "spicy", label: "Try a blindfold" },
    {
      id: "i5",
      heat: "spicy",
      label: "One of us is fully in charge for the night",
    },
    { id: "i6", heat: "wild", label: "Bring a new toy into the mix" },
    { id: "i7", heat: "sweet", label: "Shower together, no agenda" },
    {
      id: "i8",
      heat: "wild",
      label: "Act out a fantasy we've never said out loud",
    },
  ],
};
