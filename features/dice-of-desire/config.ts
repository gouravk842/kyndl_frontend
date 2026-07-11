/**
 * Dice of Desire — content & art-direction config (Red Zone, adults only).
 *
 * The digital, fully customizable answer to the printed "Roll a Sex Position"
 * chart: two dice, a 6×6 grid of 36 positions. The first die picks the row, the
 * second the column, and the cell where they meet is what you do next. Pure luck
 * of the roll — the customization is in the position names, the playful notes,
 * and the heat you give each square. Everything personal lives here.
 */

/** Intensity tiers, coolest → hottest. Mirrors `HEAT_LEVELS` on the backend. */
export type Heat = "sweet" | "flirty" | "spicy" | "wild";

/** A single square of the 6×6 grid. */
export type Position = {
  /** Grid index 0–35, where `id = (die1 - 1) * 6 + (die2 - 1)`. Fixed — the dice
   *  map onto it, so squares are edited in place, never reordered. */
  id: number;
  /** Intensity tier — colours the result card and its badge. */
  heat: Heat;
  /** The position's name, shown big on the result card. */
  name: string;
  /** A short, playful how-to revealed beneath the name. */
  note: string;
};

export type DiceConfig = {
  recipientName: string;
  gameTitle: string;
  /** Shown on the table before the first roll. */
  intro: string;
  /** Exactly 36 squares, indexed 0–35. */
  positions: Position[];
};

/** The grid is 6×6 — two ordinary dice. */
export const GRID_SIZE = 6;
export const POSITION_COUNT = GRID_SIZE * GRID_SIZE; // 36

/** The grid index a pair of dice lands on (die values are 1–6). */
export function indexFor(die1: number, die2: number): number {
  return (die1 - 1) * GRID_SIZE + (die2 - 1);
}

/** The (die1, die2) pair a grid index maps back to — used by the builder grid. */
export function diceFor(id: number): { die1: number; die2: number } {
  return { die1: Math.floor(id / GRID_SIZE) + 1, die2: (id % GRID_SIZE) + 1 };
}

/** Ordered list of heat tiers — used for the editor's heat picker. */
export const HEAT_ORDER: Heat[] = ["sweet", "flirty", "spicy", "wild"];

/** Per-tier presentation: a label, a flame count, and the result card's colourway. */
export const HEAT_META: Record<
  Heat,
  {
    label: string;
    flames: number;
    /** Chip / accent colour. */
    accent: string;
    /** Result card face gradient. */
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

/** The bundled sample grid. Read top-to-bottom by die 1 (rows) then die 2
 *  (columns); heat is mixed across the board so every roll is a surprise. */
const SAMPLE_POSITIONS: Omit<Position, "id">[] = [
  // die 1 = 1
  { heat: "sweet", name: "Spooning", note: "Curl up behind me, slow and close — no rush at all." },
  { heat: "sweet", name: "Face to Face", note: "On our sides, foreheads touching, just feeling each other." },
  { heat: "sweet", name: "The Lotus", note: "Sit me in your lap, wrap around each other, and rock slowly." },
  { heat: "flirty", name: "Coital Alignment", note: "Missionary, but shift up an inch — it's all about the grind." },
  { heat: "sweet", name: "Slow Dance", note: "Standing, wrapped together, swaying like the song's still on." },
  { heat: "flirty", name: "Lazy Sunday", note: "Both on our sides, my back to you — unhurried and warm." },
  // die 1 = 2
  { heat: "flirty", name: "Cowgirl", note: "I take the lead on top and set the pace tonight." },
  { heat: "spicy", name: "Reverse Cowgirl", note: "Same, but facing away — enjoy the view." },
  { heat: "flirty", name: "Pillow Talk", note: "Missionary with a pillow under my hips. You'll see why." },
  { heat: "flirty", name: "Edge of the Bed", note: "I lie back at the edge, you stand and take over." },
  { heat: "flirty", name: "Lap of Luxury", note: "Straddle you in the chair — start with a slow tease." },
  { heat: "flirty", name: "The Throne", note: "You sit like a king; I do all the work — for now." },
  // die 1 = 3
  { heat: "spicy", name: "Doggy", note: "Hands and knees — hold my hips and don't be shy." },
  { heat: "spicy", name: "The Lean-Back", note: "Reverse cowgirl, but lean back onto your chest." },
  { heat: "spicy", name: "Pinned", note: "Hold my wrists above my head and make me wait for it." },
  { heat: "wild", name: "Against the Wall", note: "Lift me, pin me to the wall, and don't let go." },
  { heat: "spicy", name: "On Your Shoulders", note: "On my back, legs over your shoulders — deep and slow." },
  { heat: "spicy", name: "Tabletop", note: "Lay me on the edge of the table and step in close." },
  // die 1 = 4
  { heat: "wild", name: "Standing Doggy", note: "Bent over the bed while you stand behind me." },
  { heat: "wild", name: "The Bridge", note: "I arch up off the bed — you take it from there." },
  { heat: "wild", name: "Blindfolded", note: "Cover my eyes first. Every touch a surprise." },
  { heat: "spicy", name: "Cross-Body", note: "I'm on my side, you kneel and pull me onto you." },
  { heat: "flirty", name: "Side Saddle", note: "I straddle one of your thighs and grind in close." },
  { heat: "sweet", name: "Seated Wrap", note: "Face to face, seated, legs wrapped, slow rocking." },
  // die 1 = 5
  { heat: "wild", name: "Tied & Teased", note: "Loosely bind my hands. You're completely in charge now." },
  { heat: "wild", name: "The Rodeo", note: "I ride on top; you hold on and let me run wild." },
  { heat: "spicy", name: "The Pretzel", note: "Tangle our legs on our sides and meet in the middle." },
  { heat: "sweet", name: "Morning Spoon", note: "Half-asleep, behind me, lazy and gentle." },
  { heat: "flirty", name: "The Cradle", note: "I sit in your lap facing you; you cradle and lift." },
  { heat: "spicy", name: "The Stairs", note: "Catch each other halfway up — don't make it to the top." },
  // die 1 = 6
  { heat: "wild", name: "Held Up", note: "I wrap my legs around you while you carry the weight." },
  { heat: "wild", name: "Face Down", note: "Flat on my front, you press in close behind." },
  { heat: "wild", name: "The Frog", note: "I crouch, you kneel behind — deep and intense." },
  { heat: "spicy", name: "Wheelbarrow", note: "Bold and athletic — hold my legs and go for it." },
  { heat: "flirty", name: "Lap Dance", note: "I start with a tease in your lap and take it from there." },
  { heat: "wild", name: "Dealer's Choice", note: "You rolled the wild card — whatever you've both been craving." },
];

export const DICE_CONFIG: DiceConfig = {
  // ↓ Make it yours.
  recipientName: "you",

  gameTitle: "Roll for us",

  intro:
    "Two dice, one bed. Roll them together — wherever they land is what's next. No overthinking, no deciding. Just luck, and us.",

  positions: SAMPLE_POSITIONS.map((p, id) => ({ id, ...p })),
};
