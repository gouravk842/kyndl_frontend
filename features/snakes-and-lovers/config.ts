/**
 * Snakes & Lovers — content & art-direction config (Red Zone, adults only).
 *
 * Snakes & Ladders fused with a "dare on every square" couples board. A 100
 * square track climbs from sweet warm-ups to a wild climax; two tokens race up
 * it one die-roll at a time. The board topology (which squares are ladders,
 * snakes, or safe checkpoints) is the engine, built in `board-layout.ts`. The
 * customization is the words: rename the dare on any square and set its heat.
 *
 * Two reframes make the classic mechanic work for couples:
 *   - 🪜 a ladder is a "Heat Rush" — climb fast to a hotter dare.
 *   - 🐍 a snake is a "Slow Burn" — slide back into a teasing one. More squares
 *        left = more play before the finish, so a setback is just delayed fun.
 */

import {
  BOARD_SIZE,
  cellCenter,
  cellPosition,
  LADDERS,
  SNAKES,
} from "./board-layout";

/** Intensity tiers, coolest → hottest. Mirrors `HEAT_LEVELS` on the backend. */
export type Heat = "sweet" | "flirty" | "spicy" | "wild";

/** A single square of the track. */
export type Square = {
  /** Track position 1–100. Fixed — the tokens move onto it, so squares are
   *  edited in place, never reordered. */
  id: number;
  /** Intensity tier — colours the reveal card and its badge. */
  heat: Heat;
  /** The dare's name, shown big on the reveal card. */
  name: string;
  /** A short, playful how-to revealed beneath the name. */
  note: string;
  image?: { fileId: string } | null;
};

export type SnakesConfig = {
  recipientName: string;
  gameTitle: string;
  /** Shown on the table before the first roll. */
  intro: string;
  /** Exactly 100 squares, indexed 1–100. */
  squares: Square[];
};

/** The board is a 10×10 serpentine track, 1 (bottom-left) → 100 (top-left). */
export { BOARD_SIZE, cellCenter, cellPosition, LADDERS, SNAKES };
export const SQUARE_COUNT = BOARD_SIZE * BOARD_SIZE; // 100

/** Tier-boundary breathers — landing here is a safe-word check-in, not a dare. */
export const SAFE_SQUARES: ReadonlySet<number> = new Set([25, 50, 75]);

/** The final square — reaching it is the climax (uses square 100's dare text). */
export const CLIMAX_SQUARE = 100;

/** Ordered list of heat tiers — used for the editor's heat picker. */
export const HEAT_ORDER: Heat[] = ["sweet", "flirty", "spicy", "wild"];

/** The heat a square defaults to, by zone: the board escalates as it climbs. */
export function zoneHeat(id: number): Heat {
  if (id <= 25) return "sweet";
  if (id <= 50) return "flirty";
  if (id <= 75) return "spicy";
  return "wild";
}

/** Per-tier presentation: a label, a flame count, and the reveal card's colourway. */
export const HEAT_META: Record<
  Heat,
  {
    label: string;
    flames: number;
    /** Chip / accent colour, also the square's tint on the board. */
    accent: string;
    /** Painted-tile gradient stops on the board (lit → shaded). */
    tile: [string, string];
    /** Reveal card face gradient. */
    card: string;
    /** Soft glow behind the card. */
    glow: string;
  }
> = {
  sweet: {
    label: "Sweet",
    flames: 1,
    accent: "#f4a8c0",
    tile: ["#f9c4d6", "#e07ea4"],
    card: "linear-gradient(155deg, #3a1430 0%, #531a3c 100%)",
    glow: "rgba(244,168,192,0.45)",
  },
  flirty: {
    label: "Flirty",
    flames: 2,
    accent: "#ff8fae",
    tile: ["#ff9fb9", "#e35f86"],
    card: "linear-gradient(155deg, #45122e 0%, #6a1838 100%)",
    glow: "rgba(255,143,174,0.5)",
  },
  spicy: {
    label: "Spicy",
    flames: 3,
    accent: "#ff6f6f",
    tile: ["#ff7f7f", "#cf3a52"],
    card: "linear-gradient(155deg, #4d0f24 0%, #7e1426 100%)",
    glow: "rgba(255,111,111,0.55)",
  },
  wild: {
    label: "Wild",
    flames: 4,
    accent: "#ff4d4d",
    tile: ["#ff5d5d", "#b51d2c"],
    card: "linear-gradient(155deg, #3d0a16 0%, #8a0f1d 100%)",
    glow: "rgba(255,77,77,0.6)",
  },
};

/** The bundled sample dares, 100 of them, escalating sweet → wild up the track.
 *  Indexed by id: `SAMPLE_DARES[id - 1]`. */
const SAMPLE_DARES: { name: string; note: string }[] = [
  // ── Sweet (1–25): warm-ups, clothes on ──────────────────────────────
  {
    name: "Eye Gaze",
    note: "Hold each other's eyes for 30 seconds. No giggling… or do.",
  },
  {
    name: "Compliment",
    note: "Tell them the first thing that made you fall for them.",
  },
  { name: "Slow Kiss", note: "One slow kiss. Make it last ten seconds." },
  { name: "Hand Massage", note: "Massage their hands for a full minute." },
  { name: "Whisper", note: "Whisper what you're hoping happens tonight." },
  {
    name: "Forehead Kiss",
    note: "Kiss their forehead and pull them in close.",
  },
  {
    name: "Truth",
    note: "Answer honestly: what were you thinking about me today?",
  },
  {
    name: "Slow Dance",
    note: "Put on one song and sway together till it ends.",
  },
  { name: "Neck Kiss", note: "Three soft kisses down the side of their neck." },
  {
    name: "Share a Sip",
    note: "Take a drink from the same glass, eyes locked.",
  },
  {
    name: "Can't Look Away",
    note: "Name one part of them you can't stop looking at.",
  },
  {
    name: "Hair Play",
    note: "Run your fingers slowly through their hair for a minute.",
  },
  {
    name: "Featherlight",
    note: "Trace a slow line down their arm with one finger.",
  },
  { name: "Confess", note: "Share one thing you've been too shy to ask for." },
  { name: "Wrist Kiss", note: "Kiss the soft inside of their wrist." },
  { name: "Cuddle Up", note: "Hold them from behind for a full minute." },
  {
    name: "Favorite Thing",
    note: "Tell them your favorite thing about kissing them.",
  },
  { name: "Earlobe", note: "Gently kiss or nibble their earlobe." },
  { name: "Shoulder Rub", note: "Work their shoulders for one slow minute." },
  {
    name: "Undress With Eyes",
    note: "Look them over slowly and describe what you see.",
  },
  { name: "Soft Bite", note: "A playful little bite on the shoulder." },
  {
    name: "Two Wishes",
    note: "Tell them two things you want to do later tonight.",
  },
  {
    name: "Lap Rest",
    note: "Lay your head in their lap for a minute while they stroke your hair.",
  },
  {
    name: "Deeper Kiss",
    note: "A kiss that starts soft and gets a little deeper.",
  },
  {
    name: "Breather",
    note: "Catch your breath and check in — you good? Keep going?",
  },
  // ── Flirty (26–50): teasing, light touch, things start coming off ────
  { name: "Strip One", note: "Take off one item of your own clothing." },
  { name: "Body Shot", note: "Take a shot (or sip) off their collarbone." },
  { name: "Lap Sit", note: "Sit in their lap, facing them, for 30 seconds." },
  {
    name: "Up the Thigh",
    note: "Run your hand slowly up their thigh — and stop.",
  },
  { name: "Their Dare", note: "Let them give you one dare. No refusing." },
  { name: "Just Above", note: "Kiss them just above the waistband." },
  { name: "Take It Off Them", note: "Remove one item of THEIR clothing." },
  {
    name: "Surprise Kiss",
    note: "Close their eyes and kiss them somewhere unexpected.",
  },
  { name: "Slow Grind", note: "A slow ten-second grind in their lap." },
  {
    name: "Leave a Mark",
    note: "Kiss their neck like you mean it — leave them wanting.",
  },
  { name: "Truth or Dare", note: "They choose. You deliver." },
  { name: "Bite the Lip", note: "Kiss them and gently bite their lower lip." },
  {
    name: "Whisper the Naughty",
    note: "Whisper the naughtiest thing on your mind right now.",
  },
  { name: "Body Shot, Lower", note: "A shot (or sip) off their stomach." },
  {
    name: "Guess Where",
    note: "Trace a path with one fingertip — let them guess where it ends.",
  },
  { name: "Lap Dance", note: "Thirty seconds of a teasing lap dance." },
  { name: "Strip Again", note: "Lose another item of clothing." },
  { name: "Point & Massage", note: "A slow massage anywhere they point." },
  { name: "Kiss Map", note: "Kiss three places you don't usually." },
  {
    name: "Start & Stop",
    note: "Start something… then make them wait for more.",
  },
  {
    name: "Hands Back",
    note: "Hold their hands behind them and kiss their neck.",
  },
  { name: "Show Off", note: "Show them your best move — for 20 seconds." },
  { name: "Say & Start", note: "Name what you want, then begin it slowly." },
  { name: "Dealer's Tease", note: "They pick anything flirty — you do it." },
  {
    name: "Halfway Check-In",
    note: "Pause, sip, and each say one thing you've loved so far.",
  },
  // ── Spicy (51–75): clothing comes off, the bases ─────────────────────
  { name: "Down to Less", note: "Strip down to your underwear." },
  { name: "They Point", note: "They point — you kiss it for 20 seconds." },
  { name: "Straddle", note: "Straddle them and kiss them deeply." },
  { name: "Body Worship", note: "Spend a minute kissing their chest." },
  {
    name: "Take the Lead",
    note: "Loosely hold their hands — you're in charge now.",
  },
  { name: "Make Out", note: "Make out like you mean it for a full minute." },
  { name: "Over the Fabric", note: "A slow tease, hand over the underwear." },
  { name: "One More Off", note: "Take off one more thing — theirs or yours." },
  { name: "On Top", note: "Get on top and set the pace for 30 seconds." },
  {
    name: "A Fantasy",
    note: "Tell them one thing you've always wanted to try.",
  },
  { name: "Inner Thigh", note: "Slow kisses up the inner thigh." },
  {
    name: "Edge of Control",
    note: "Start, slow down, start again — keep them guessing.",
  },
  {
    name: "Hands Everywhere",
    note: "One minute — hands roaming, mouths busy.",
  },
  { name: "Pin & Lead", note: "Pin them gently to the bed and take charge." },
  { name: "Hip Shot", note: "A shot (or sip) off the hip bone." },
  { name: "Underwear Off", note: "One of you loses the underwear." },
  { name: "Skin to Skin", note: "A slow grind, skin to skin, for 30 seconds." },
  { name: "Ask Out Loud", note: "Say exactly what you want — out loud." },
  {
    name: "The 69",
    note: "Try the position the number suggests for a minute.",
  },
  {
    name: "Bring & Pause",
    note: "Bring them close… then stop, and make them wait.",
  },
  { name: "Two Minutes", note: "Two minutes of whatever they ask for." },
  {
    name: "Somewhere New",
    note: "Use your mouth somewhere you haven't tonight.",
  },
  { name: "To the Edge", note: "Take them right to the edge — then pause." },
  { name: "Hand Over", note: "They take complete control for one minute." },
  {
    name: "Slow It Down",
    note: "Breathe together, check in — still a yes? Then on you go.",
  },
  // ── Wild (76–100): the build-up to the climax ────────────────────────
  { name: "Nothing Left", note: "Lose everything still on you." },
  {
    name: "Their Wildest",
    note: "They name the wildest thing — anything within your yes.",
  },
  { name: "Hands Tied", note: "Bind the hands and tease without mercy." },
  { name: "Blindfolded", note: "Eyes covered — every touch a surprise." },
  { name: "Take Them", note: "Pick a position and take the lead." },
  { name: "No Part Off-Limits", note: "Two minutes of kisses everywhere." },
  { name: "Make Them Ask", note: "Make them ask twice before you give in." },
  { name: "Ride", note: "One of you takes the top and runs it." },
  {
    name: "Edge & Deny",
    note: "Bring them to the edge, then deny — let it build.",
  },
  { name: "Roleplay", note: "Sixty seconds as someone else tonight." },
  { name: "Anything Goes", note: "One full minute — dealer's choice." },
  {
    name: "Pinned & Teased",
    note: "Pinned down, teased everywhere but where they want it.",
  },
  { name: "Swap", note: "Switch who's in charge, mid-way." },
  {
    name: "Toy or Touch",
    note: "Bring in a toy, or just your hands — their pick.",
  },
  {
    name: "As Slow As You Dare",
    note: "As slow as you both can possibly stand.",
  },
  { name: "One Wish Each", note: "Each name a wish — grant theirs first." },
  { name: "No Hands", note: "Pleasure them using no hands for a minute." },
  {
    name: "What You've Craved",
    note: "Whatever you've both been wanting — now.",
  },
  { name: "To the Brink", note: "Right to the brink, then hold it there." },
  {
    name: "Their Fantasy",
    note: "Act out the fantasy they whispered earlier.",
  },
  {
    name: "Total Control",
    note: "Total control for two minutes — they can't move.",
  },
  { name: "Make Them Beg", note: "Make them beg before you let them finish." },
  { name: "All In", note: "Anything, everything — decide it together." },
  {
    name: "So Close",
    note: "Almost there… draw it out as long as you both can.",
  },
  {
    name: "Climax",
    note: "You made it to the top. The winner directs the finale — and it's for the two of you. Take your time.",
  },
];

export const SNAKES_CONFIG: SnakesConfig = {
  // ↓ Make it yours.
  recipientName: "you",

  gameTitle: "Snakes & Lovers",

  intro:
    "One die, one bed, one long climb to the top. Take turns rolling — wherever you land is your dare. Ladders rush you hotter; snakes tease you back. First to 100 directs the finale.",

  squares: SAMPLE_DARES.map((d, i) => ({
    id: i + 1,
    heat: zoneHeat(i + 1),
    name: d.name,
    note: d.note,
  })),
};
