/**
 * Desire Deck — content & art-direction config (Red Zone, adults only).
 *
 * A deck of intimate prompt cards a couple draws together: the digital, fully
 * customizable answer to a physical "romantic card" deck. Everything personal
 * lives here. Cards are pure text — the customization is in the words and the
 * heat you choose. Eight to twenty cards across a couple of heat tiers feels
 * right — enough to keep a night going without it becoming a list.
 */

/** Intensity tiers, coolest → hottest. Mirrors `HEAT_LEVELS` on the backend. */
export type Heat = "sweet" | "flirty" | "spicy" | "wild";

export type DeckCard = {
  id: number;
  /** Intensity tier — colours the card and drives the heat filter. */
  heat: Heat;
  /** The prompt, dare, or question revealed when the card is drawn. */
  prompt: string;
  /** Tilt of the card in the drawn pile, in degrees (-12 → 12). */
  rotation: number;
  /** Optional catalog diagram copied from the activity bank. */
  image?: { fileId: string } | null;
};

export type DeckConfig = {
  recipientName: string;
  deckTitle: string;
  /** Shown on the cover, before the first card is drawn. */
  intro: string;
  /** Shown once every card has been drawn. */
  outro: string;
  cards: DeckCard[];
};

/** Ordered list of heat tiers — used for filter chips and cycling defaults. */
export const HEAT_ORDER: Heat[] = ["sweet", "flirty", "spicy", "wild"];

/** Per-tier presentation: a label, a flame count, and the card's colourway. */
export const HEAT_META: Record<
  Heat,
  {
    label: string;
    flames: number;
    /** Chip / accent colour. */
    accent: string;
    /** Card face gradient. */
    card: string;
    /** Soft glow behind the card. */
    glow: string;
  }
> = {
  sweet: {
    label: "Sweet",
    flames: 1,
    accent: "#f4a8c0",
    card: "linear-gradient(155deg, #3a1430 0%, #531a3c 100%)",
    glow: "rgba(244,168,192,0.45)",
  },
  flirty: {
    label: "Flirty",
    flames: 2,
    accent: "#ff8fae",
    card: "linear-gradient(155deg, #45122e 0%, #6a1838 100%)",
    glow: "rgba(255,143,174,0.5)",
  },
  spicy: {
    label: "Spicy",
    flames: 3,
    accent: "#ff6f6f",
    card: "linear-gradient(155deg, #4d0f24 0%, #7e1426 100%)",
    glow: "rgba(255,111,111,0.55)",
  },
  wild: {
    label: "Wild",
    flames: 4,
    accent: "#ff4d4d",
    card: "linear-gradient(155deg, #3d0a16 0%, #8a0f1d 100%)",
    glow: "rgba(255,77,77,0.6)",
  },
};

export const DECK_CONFIG: DeckConfig = {
  // ↓ Make it yours.
  recipientName: "you",

  deckTitle: "for us",

  intro:
    "Just the two of us tonight. Draw a card, do what it says — or trade it for the next one. No rules except the ones we like.",

  outro:
    "That's the whole deck. We made it through every card… or we didn't, and there's a very good reason we got distracted. Either way — again soon.",

  cards: [
    {
      id: 1,
      heat: "sweet",
      rotation: -6,
      prompt:
        "Tell me, slowly, the exact moment tonight you started wanting me.",
    },
    {
      id: 2,
      heat: "sweet",
      rotation: 5,
      prompt:
        "A two-minute kiss. No hands, no rushing — just see how worked up we can get with only our mouths.",
    },
    {
      id: 3,
      heat: "flirty",
      rotation: -3,
      prompt:
        "Whisper the thing you've been wanting to do to me but haven't said out loud yet.",
    },
    {
      id: 4,
      heat: "flirty",
      rotation: 8,
      prompt:
        "Undress one piece of my clothing using only your teeth. Take your time.",
    },
    {
      id: 5,
      heat: "spicy",
      rotation: -9,
      prompt:
        "Pin me where I am and tease me for sixty seconds — you're not allowed to give me what I'm asking for until the time's up.",
    },
    {
      id: 6,
      heat: "spicy",
      rotation: 4,
      prompt:
        "Describe, in detail, your favourite thing I've ever done to you — then let me do it again.",
    },
    {
      id: 7,
      heat: "wild",
      rotation: -5,
      prompt:
        "You're in charge for the next three cards. Tell me exactly what you want, and watch me do it.",
    },
    {
      id: 8,
      heat: "wild",
      rotation: 7,
      prompt:
        "Name the fantasy you've never told anyone. Tonight we try as much of it as we dare.",
    },
  ],
};
