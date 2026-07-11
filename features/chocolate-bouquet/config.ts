/**
 * Chocolate Bouquet — content & art-direction config.
 *
 * Everything personal lives here. Each chocolate is one memory; its `type`
 * decides both the sweet it becomes in the 3D bouquet and how the memory reveals
 * once its wrapper is torn open. Six to eighteen chocolates feels right — under
 * five looks thin, over ~24 crowds the bouquet (and the layout caps there).
 */

/**
 * The five kinds of chocolate, each a different sort of memory:
 * - `moment`    — a photo moment (foil-and-paper bar)
 * - `note`      — a written note / love letter (purple bar)
 * - `secret`    — something tender, blurred until you tear it (round foil truffle)
 * - `milestone` — a favourite / a big day (gold-wrapped, celebrated on reveal)
 * - `voice`     — a voice note tucked in a ribboned square
 */
export type ChocolateType = "moment" | "note" | "secret" | "milestone" | "voice";

export type Chocolate = {
  id: number;
  type: ChocolateType;
  /** Short title shown on the revealed memory card. */
  label: string;
  /** A short date string, shown on the card. */
  date: string;
  /** The memory read once the wrapper tears. Line breaks are preserved. */
  message: string;
  /** Optional photo for this memory, e.g. "/chocolate-bouquet/trip.jpg" under /public. */
  imageUrl: string | null;
  /** Optional voice-note audio URL (only `voice` chocolates use it). */
  audioUrl?: string | null;
};

export type BouquetConfig = {
  /**
   * Stable id for this bouquet — namespaces the "already seen the wrapping
   * ceremony" flag in localStorage. Change it to replay the ceremony.
   */
  id: string;
  /** Who the bouquet is for — shown on the entrance ("For …"). */
  recipientName: string;
  /** The name of the bouquet — shown above it. */
  bouquetName: string;
  /** One line shown under the title. */
  subtitle: string;
  /** Shown once every chocolate has been opened. */
  allOpenedMessage: string;
  chocolates: Chocolate[];
  /** Tissue-paper wrap colour around the bouquet. */
  wrapColor: string;
  /** Ribbon/bow colour at the base. */
  bowColor: string;
};

export const BOUQUET_CONFIG: BouquetConfig = {
  // ↓ Make it theirs.
  id: "our-bouquet",
  recipientName: "you",
  bouquetName: "A bouquet of us",
  subtitle: "tap a chocolate, then tear it open",

  chocolates: [
    {
      id: 1,
      type: "moment",
      label: "the night we met",
      date: "where it started",
      message:
        "You were laughing before I'd said anything funny, and I remember thinking I'd spend a long time trying to be the reason you laughed like that again.",
      imageUrl: null,
    },
    {
      id: 2,
      type: "note",
      label: "a note for you",
      date: "just because",
      message:
        "I'm not good at saying it out loud, so here it is in a chocolate: you are the best thing about every ordinary day.",
      imageUrl: null,
    },
    {
      id: 3,
      type: "moment",
      label: "the long drive",
      date: "that first spring",
      message:
        "No destination, windows down, the same four songs on repeat because neither of us wanted to change it. You fell asleep near the end and I drove slower so it would last.",
      imageUrl: null,
    },
    {
      id: 4,
      type: "secret",
      label: "something I never told you",
      date: "shh",
      message:
        "The first time you held my hand, I lost the entire thread of what I was saying. I've never admitted that. Now you know.",
      imageUrl: null,
    },
    {
      id: 5,
      type: "milestone",
      label: "our first trip",
      date: "the big one",
      message:
        "Cold mornings, terrible coffee, a map we never followed. We got lost twice and called it exploring both times. Still the most at-home I've felt being nowhere in particular.",
      imageUrl: null,
    },
    {
      id: 6,
      type: "note",
      label: "the hard week",
      date: "later that year",
      message:
        "We were both wrong and both too tired to say it. But you reached for my hand in the dark before either of us apologised — and that told me everything about us.",
      imageUrl: null,
    },
    {
      id: 7,
      type: "moment",
      label: "your day",
      date: "your birthday",
      message:
        "You kept saying you didn't want a fuss, then smiled the whole way through the fuss. I'd ruin a hundred surprises to watch you try not to cry over a cake again.",
      imageUrl: null,
    },
    {
      id: 8,
      type: "milestone",
      label: "when I knew",
      date: "an ordinary Tuesday",
      message:
        "Not a big moment. You were humming at the kitchen counter and it landed quietly: this is it. This is the person. The rest has just been me being grateful, on a loop.",
      imageUrl: null,
    },
    {
      id: 9,
      type: "voice",
      label: "press play",
      date: "for your ears",
      message:
        "There's a voice note in this one — record yourself saying the thing you'd want them to hear, and drop the audio link in the builder.",
      imageUrl: null,
      audioUrl: null,
    },
  ],

  allOpenedMessage:
    "That's the whole bouquet — one sweet for every reason. There are more being written every day. I love you.",

  wrapColor: "#cdd7e6",
  bowColor: "#c49a6a",
};
