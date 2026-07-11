import type { ActivityConfig } from "../types";

/**
 * Default couple activity decks. The setup panel lets players edit every line
 * and toggle which moments draw a card, so these are starting points rather
 * than fixed content. Three intensities:
 *  - sweet : tender, low-pressure, safe-for-anyone
 *  - fun   : playful, silly, a little daring
 *  - spicy : flirty / intimate (couples only)
 */
export const DEFAULT_ACTIVITIES: ActivityConfig = {
  enabled: true,
  intensity: "mixed",
  triggers: {
    star: true,
    capture: true,
    home: true,
    sixes: true,
  },
  decks: {
    sweet: [
      "Give your partner a 20-second hug — no talking.",
      "Say one thing you're grateful for about them today.",
      "Share your favourite memory of the two of you.",
      "Hold hands and look into each other's eyes for 15 seconds.",
      "Tell them one little thing they did this week that made you smile.",
      "Write a one-line love note and hand it over before your next turn.",
      "Give a sincere compliment about something other than looks.",
      "Recreate the moment you first met, in one sentence each.",
      "Plan one tiny date you'd love to do together this month.",
      "Slow-dance to one song you both like (or hum it).",
    ],
    fun: [
      "Do your best impression of your partner until they laugh.",
      "Swap an embarrassing childhood story.",
      "Loser of the next roll makes the other a snack.",
      "Talk in an accent until it's your turn again.",
      "Let your partner pick a new nickname for you for the rest of the game.",
      "Take a goofy selfie together right now.",
      "Answer: if we were a duo, what would our band be called?",
      "Do 10 jumping jacks together.",
      "Trade one weird food combo you secretly love.",
      "Whoever has the messier phone home screen does a dramatic apology.",
    ],
    spicy: [
      "Give your partner a 30-second shoulder massage.",
      "Whisper one thing you find attractive about them.",
      "A slow kiss — your partner decides where (cheek counts!).",
      "Share a fantasy date night in vivid detail.",
      "Tell them the moment you knew you were into them.",
      "Maintain eye contact for 30 seconds, no laughing.",
      "Pay a bold compliment you've been too shy to say.",
      "Let your partner plan the next 'just us' evening — say yes in advance.",
      "Trade phones and post something sweet about each other (if you dare).",
      "One honest answer: what's your favourite kind of kiss?",
    ],
  },
};

export const TRIGGER_LABELS: Record<
  keyof ActivityConfig["triggers"],
  { title: string; hint: string; emoji: string }
> = {
  star: {
    title: "Land on a star",
    hint: "Reaching a glowing star tile draws a card.",
    emoji: "⭐",
  },
  capture: {
    title: "Capture a token",
    hint: "Knocking a partner's token home draws a card.",
    emoji: "💥",
  },
  home: {
    title: "Bring a token home",
    hint: "Walking a token into the centre draws a card.",
    emoji: "🏠",
  },
  sixes: {
    title: "Roll three sixes",
    hint: "A forfeited triple-six turn draws a dare.",
    emoji: "🎲",
  },
};

export const INTENSITY_LABELS: Record<
  ActivityConfig["intensity"],
  { label: string; emoji: string }
> = {
  sweet: { label: "Sweet", emoji: "🫶" },
  fun: { label: "Fun", emoji: "😄" },
  spicy: { label: "Spicy", emoji: "🔥" },
  mixed: { label: "Mixed", emoji: "🎭" },
};
