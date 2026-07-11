/**
 * Naughty Spins — content & art-direction config (Red Zone, adults only).
 *
 * A spin-the-wheel night in: the wheel is divided into categories (Action, Deep
 * Talk, Dare…), each a colour and a little stack of prompts. You spin, the
 * pointer lands on a category, and one of its prompts is dealt. The digital,
 * endlessly customizable answer to a physical "naughty spinner" board.
 *
 * Everything personal lives here. Prompts are pure text — the customization is
 * in the categories you pick, the colours you give them, and the words inside.
 */

export type SpinCategory = {
  id: number;
  /** Wedge label — "Action", "Deep Talk", "Dare"… */
  label: string;
  /** Wedge colour (hex). Drives the wheel slice and the reveal card. */
  color: string;
  /** The prompts dealt when the wheel lands on this category. */
  prompts: string[];
};

export type WheelConfig = {
  recipientName: string;
  wheelTitle: string;
  /** Shown on the cover, before the first spin. */
  intro: string;
  categories: SpinCategory[];
};

/** The Red-Zone palette wedges draw from — offered as swatches in the builder. */
export const CATEGORY_COLORS: string[] = [
  "#ff4d6d", // rose
  "#2fae7a", // emerald
  "#f0a13d", // amber
  "#b06cff", // violet
  "#ffd24d", // gold
  "#ff7ad9", // pink
  "#4dd0e1", // teal
  "#ff6f6f", // coral
];

export const WHEEL_CONFIG: WheelConfig = {
  // ↓ Make it yours.
  recipientName: "you",

  wheelTitle: "Naughty Spins",

  intro:
    "One wheel, just the two of us. Give it a spin, see where it lands, and do what the card says — or spin again if you're feeling brave. No rules except the ones we like.",

  categories: [
    {
      id: 1,
      label: "Action",
      color: "#ff4d6d",
      prompts: [
        "Kiss me somewhere you haven't kissed me yet tonight.",
        "Undress one piece of my clothing — slowly, no hands.",
        "Pin me where I am and tease me for sixty seconds. No more.",
      ],
    },
    {
      id: 2,
      label: "Deep Talk",
      color: "#2fae7a",
      prompts: [
        "Tell me the exact moment tonight you started wanting me.",
        "Whisper the thing you've wanted to try but never said out loud.",
        "What's something I do that drives you completely wild?",
      ],
    },
    {
      id: 3,
      label: "Dare",
      color: "#f0a13d",
      prompts: [
        "Do your best slow walk across the room, eyes on me the whole time.",
        "Send me a text right now saying exactly what you want next.",
        "Let me write a word on your skin — you have to guess it.",
      ],
    },
    {
      id: 4,
      label: "Charades",
      color: "#b06cff",
      prompts: [
        "Act out your favourite thing I've done to you — no words.",
        "Mime the fantasy you've been thinking about and let me guess.",
        "Show me, don't tell me, where you want my hands.",
      ],
    },
    {
      id: 5,
      label: "Wildcard",
      color: "#ffd24d",
      prompts: [
        "You're in charge for the next three spins. Tell me what you want.",
        "Name a fantasy we've never tried — tonight we try as much as we dare.",
        "Trade one item of clothing with me and wear it for the next round.",
      ],
    },
    {
      id: 6,
      label: "Mystery",
      color: "#ff7ad9",
      prompts: [
        "Close your eyes. I'll surprise you — just say yes or no.",
        "We each pick one thing off the wheel for the other. No vetoes.",
        "Two minutes, lights off, anything goes. Go.",
      ],
    },
  ],
};
