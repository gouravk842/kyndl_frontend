/**
 * Whack My Face — content & config for the saveable, shareable arcade.
 *
 * Topology (3×3 holes) and spawn rules live in `lib/engine`; everything
 * personal lives here: title/intro, face photo, hit quips, apology letter,
 * difficulty. A saved game opens straight into play with these settings.
 *
 * Shape mirrors the backend's `WhackAMoleContentSerializer`.
 */

export type MediaRef = { fileId: string };

export type Difficulty = "chill" | "spicy" | "chaos";

export type Apology = {
  heading: string;
  body: string;
  /** Optional make-up ask shown under the letter. */
  ask: string;
};

export type WhackAMoleConfig = {
  title: string;
  intro: string;
  /** Recipient nickname on the HUD. */
  playerName: string;
  difficulty: Difficulty;
  face: MediaRef | null;
  hitQuips: string[];
  apology: Apology;
  sacredLabel: string;
};

export const DIFFICULTY_ORDER: Difficulty[] = ["chill", "spicy", "chaos"];

export const DIFFICULTY_LABELS: Record<
  Difficulty,
  { label: string; hint: string }
> = {
  chill: { label: "Chill", hint: "Slow pops — easy to bonk." },
  spicy: { label: "Spicy", hint: "Date-night pace." },
  chaos: { label: "Chaos", hint: "Fast & frantic." },
};

/** The document a fresh builder starts from. */
export const WHACK_A_MOLE_CONFIG: WhackAMoleConfig = {
  title: "Whack my dumb face",
  intro: "I messed up. Take it out on me — then read what I meant to say.",
  playerName: "You",
  difficulty: "spicy",
  face: null,
  hitQuips: [
    "Ow — deserved!",
    "Okay okay I'm sorry!",
    "Bonk accepted.",
    "Still love you though.",
  ],
  apology: {
    heading: "I'm sorry",
    body: "I was wrong. Thank you for playing this with me — can we make up?",
    ask: "Hug? Coffee? Your call.",
  },
  sacredLabel: "Don't bonk the heart",
};

export function starterDoc(): WhackAMoleConfig {
  return {
    ...WHACK_A_MOLE_CONFIG,
    hitQuips: [...WHACK_A_MOLE_CONFIG.hitQuips],
    apology: { ...WHACK_A_MOLE_CONFIG.apology },
    face: null,
  };
}
