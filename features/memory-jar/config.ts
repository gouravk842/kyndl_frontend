/**
 * Memory Jar — content & art-direction config.
 *
 * Everything personal lives here. Edit the messages in your own voice before
 * gifting; nothing else in the feature needs to change. Six to twelve notes
 * feels right — enough to invite exploration without turning it into a chore.
 */

/** A reference to one of the user's uploaded files, resolved to a URL on read. */
export type MediaRef = { fileId: string };

export type JarNote = {
  id: number;
  /** Tilt of the folded slip inside the jar, in degrees (-15 → 15). */
  rotation: number;
  /** Per-note paper warmth so the stack looks hand-placed, not generated. */
  paperTone: string;
  /** A few words shown on the open card's front, written like a label. */
  title: string;
  /** The message she reads when the note unfolds. */
  message: string;
  /** An optional photo shown on the unfolded note. */
  image?: MediaRef;
};

export type JarConfig = {
  recipientName: string;
  jarLabel: string;
  openingMessage: string;
  closingMessage: string;
  /** Optional looping background music, played while the jar is open. */
  music?: MediaRef;
  notes: JarNote[];
};

export const JAR_CONFIG: JarConfig = {
  // ↓ Make it hers.
  recipientName: "my love",

  jarLabel: "open when you need me",

  openingMessage:
    "Every slip in here is a little piece of my heart. Open one whenever you need a reminder that you're loved.",

  closingMessage:
    "You've opened every single one — and I meant every single one of them. There's more where these came from. Always.",

  notes: [
    {
      id: 1,
      rotation: -12,
      paperTone: "#f5e2e2",
      title: "for a hard day",
      message:
        "If today felt heavy, put it down for a second. You don't have to carry all of it at once, and you definitely don't have to carry it alone. I'm right here, and I'm not going anywhere.",
    },
    {
      id: 2,
      rotation: 7,
      paperTone: "#f4ecdb",
      title: "the small things",
      message:
        "The way you hum when you think no one's listening is my favourite song. I notice every little thing you do — and somehow it's always the small things that make me fall for you again.",
    },
    {
      id: 3,
      rotation: -4,
      paperTone: "#ecd2d2",
      title: "when we're apart",
      message:
        "Distance is just the space I have to cross to get back to you. Wherever you are right now, know that I'm thinking about you, smiling at my phone like an idiot.",
    },
    {
      id: 4,
      rotation: 15,
      paperTone: "#f7ede0",
      title: "you, exactly as you are",
      message:
        "You don't have to be brave, or fine, or anything at all for me. I love you on your loud days and your quiet ones. There is no version of you I'd trade for an easier one.",
    },
    {
      id: 5,
      rotation: -9,
      paperTone: "#e9cdd0",
      title: "a memory I keep",
      message:
        "I keep replaying the first time you really laughed around me — the proper, uncontrollable kind. I knew right then I'd spend a long time trying to make that happen again.",
    },
    {
      id: 6,
      rotation: 4,
      paperTone: "#f4e6dd",
      title: "read this slowly",
      message:
        "You are the best part of my ordinary days. Not the holidays or the big moments — the Tuesdays, the dishes, the half-asleep conversations. That's where I love you the most.",
    },
    {
      id: 7,
      rotation: 11,
      paperTone: "#edd6d6",
      title: "when you doubt it",
      message:
        "On the days you can't see what I see, let me hold the picture for you: you are kind in ways you don't even count, and the world is softer because you're in it. I see all of it.",
    },
    {
      id: 8,
      rotation: -6,
      paperTone: "#f2e3d5",
      title: "a promise",
      message:
        "Whatever comes, I'm choosing you — today, and on the days that are harder to choose anything. Come find me when you need to. I'll always leave the light on.",
    },
  ],
};
