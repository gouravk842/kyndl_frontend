/**
 * Mirror Match — content & types (wholesome Moment, not Red Zone).
 *
 * Two-sided yes / maybe / no on soft prompts about *us*. Owner answers live in
 * `ownerAnswers` (redacted on public read); partner answers via respond; reveal
 * shows only mutual non-"no" items — `matches` (both yes) and `softMatches`.
 */

export type Answer = "yes" | "maybe" | "no";

export type Mood = "sweet" | "funny" | "deep" | "us";

export type Occasion = "none" | "girlfriend-day";

export type MirrorItem = {
  /** Stable id the answer maps key on. */
  id: string;
  mood: Mood;
  label: string;
};

export type MirrorContent = {
  recipientName: string;
  ownerName: string;
  title: string;
  intro: string;
  occasion: Occasion;
  /** Owner's private answers — stripped from public reads. */
  ownerAnswers: Record<string, Answer>;
  items: MirrorItem[];
};

export type RevealItem = Pick<MirrorItem, "id" | "label" | "mood">;

export type Reveal = {
  matches: RevealItem[];
  softMatches: RevealItem[];
  total: number;
};

export const MOOD_META: Record<Mood, { label: string; color: string }> = {
  sweet: { label: "Sweet", color: "#c45c6a" },
  funny: { label: "Funny", color: "#c4a35a" },
  deep: { label: "Deep", color: "#6b5b8a" },
  us: { label: "Us", color: "#b8860b" },
};

export const MOOD_ORDER: Mood[] = ["us", "sweet", "funny", "deep"];

/** Soft answer labels for builder + partner UI. */
export const ANSWER_META: Record<Answer, { label: string; color: string }> = {
  yes: { label: "That’s us", color: "#3ad17f" },
  maybe: { label: "Kinda", color: "#f0b53d" },
  no: { label: "Not really", color: "#b0a8a0" },
};

export const DEFAULT_TITLE = "Do we see us the same way?";

export const DEFAULT_INTRO =
  "Answer honestly — your picks stay private. Kyndl only shows what you both feel.";

/** Year-round starter prompts. */
export const US_PACK: MirrorItem[] = [
  { id: "m1", mood: "us", label: "We feel like a team" },
  { id: "m2", mood: "sweet", label: "Ordinary days feel special with you" },
  { id: "m3", mood: "funny", label: "We have jokes nobody else would get" },
  { id: "m4", mood: "deep", label: "I’d choose you again" },
  { id: "m5", mood: "us", label: "Home is a person, not a place" },
  { id: "m6", mood: "sweet", label: "You notice the little things" },
  { id: "m7", mood: "funny", label: "Our weird habits somehow work" },
  { id: "m8", mood: "deep", label: "I feel safe being myself with you" },
  { id: "m9", mood: "us", label: "We make each other braver" },
  { id: "m10", mood: "sweet", label: "I’m proud to call you mine" },
  { id: "m11", mood: "deep", label: "The future feels better with you in it" },
  { id: "m12", mood: "us", label: "Today is worth celebrating — us" },
];

/** Girlfriend Day seasonal pack (same shape; used when occasion is set). */
export const GIRLFRIEND_DAY_PACK: MirrorItem[] = [
  { id: "g1", mood: "us", label: "We feel like a team" },
  { id: "g2", mood: "sweet", label: "Ordinary days feel special with you" },
  { id: "g3", mood: "funny", label: "We have jokes nobody else would get" },
  { id: "g4", mood: "deep", label: "I’d choose you again" },
  { id: "g5", mood: "us", label: "Home is a person, not a place" },
  { id: "g6", mood: "sweet", label: "You notice the little things" },
  { id: "g7", mood: "funny", label: "Our weird habits somehow work" },
  { id: "g8", mood: "deep", label: "I feel safe being myself with you" },
  { id: "g9", mood: "us", label: "We make each other braver" },
  { id: "g10", mood: "sweet", label: "I’m proud to call you mine" },
  { id: "g11", mood: "deep", label: "The future feels better with you in it" },
  { id: "g12", mood: "us", label: "Today is worth celebrating — us" },
];

/** Marketing / local demo content (owner answers filled for local reveal). */
export const MIRROR_CONFIG: MirrorContent = {
  recipientName: "you",
  ownerName: "me",
  title: DEFAULT_TITLE,
  intro: DEFAULT_INTRO,
  occasion: "girlfriend-day",
  ownerAnswers: {
    m1: "yes",
    m2: "yes",
    m3: "maybe",
    m4: "yes",
    m5: "yes",
    m6: "maybe",
    m7: "no",
    m8: "yes",
    m9: "yes",
    m10: "maybe",
    m11: "yes",
    m12: "yes",
  },
  items: US_PACK,
};

export function blankMirrorContent(): MirrorContent {
  return {
    recipientName: "",
    ownerName: "",
    title: DEFAULT_TITLE,
    intro: DEFAULT_INTRO,
    occasion: "none",
    ownerAnswers: {},
    items: [],
  };
}

export function packForOccasion(occasion: Occasion): MirrorItem[] {
  return occasion === "girlfriend-day" ? GIRLFRIEND_DAY_PACK : US_PACK;
}
