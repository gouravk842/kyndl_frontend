export type Warmth = "out" | "ember" | "lit";

export type HearthBoardId = "current" | "longest" | "week";

export const HEARTH_BOARDS: { id: HearthBoardId; label: string }[] = [
  { id: "current", label: "Burning now" },
  { id: "longest", label: "Longest kept" },
  { id: "week", label: "This week" },
];

export function clientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
}

export function flameCopy(
  state: Warmth,
  streak: number,
  keptToday: boolean,
): { title: string; body: string } {
  if (state === "ember" && streak > 0) {
    return {
      title: streak === 1 ? "1 day" : `${streak} days`,
      body: "A quiet day. Keep a memory today and it continues.",
    };
  }
  if (state === "lit" && streak > 0 && keptToday) {
    return {
      title: streak === 1 ? "1 day" : `${streak} days`,
      body: "You kept something today.",
    };
  }
  if (state === "lit" && streak > 0) {
    return {
      title: streak === 1 ? "1 day" : `${streak} days`,
      body: "The flame is still up. Keep something today.",
    };
  }
  return {
    title: "The flame is out",
    body: "One memory lights it again.",
  };
}

export function youFlameClass(state: Warmth): string {
  if (state === "lit") {
    return "shadow-[0_0_0_6px_rgba(199,91,57,0.55),0_0_28px_rgba(199,91,57,0.45)]";
  }
  if (state === "ember") {
    return "shadow-[0_0_0_5px_rgba(196,122,74,0.4)]";
  }
  return "shadow-[0_8px_30px_rgba(58,42,37,0.18)]";
}

export function bankWarmthShadow(
  warmth: Warmth | undefined,
  streak: number | undefined,
): string | null {
  if (!streak || warmth === "out" || !warmth) return null;
  if (warmth === "ember") {
    return "0 0 0 8px rgba(196,122,74,0.45), 0 10px 28px rgba(58,42,37,0.2)";
  }
  const spread = Math.min(18, 6 + streak);
  const alpha = Math.min(0.72, 0.28 + streak * 0.04).toFixed(2);
  return `0 0 ${spread}px rgba(199,91,57,${alpha}), 0 0 0 4px rgba(199,91,57,0.35), 0 10px 28px rgba(58,42,37,0.2)`;
}

export function bankStreakLine(circle: {
  is_loose?: boolean;
  streak?: number;
  warmth?: Warmth;
}): string | null {
  if (circle.is_loose || !circle.streak || circle.warmth === "out") return null;
  const days = circle.streak === 1 ? "1 day" : `${circle.streak} days`;
  if (circle.warmth === "ember") return `Quiet · ${days}`;
  return `${days} warm`;
}

export function youAria(streak: number, state: Warmth): string {
  if (state === "out" || streak <= 0)
    return "Your streak is out. Open the hearth.";
  if (state === "ember") {
    return `Quiet day. ${streak} day streak. Open the hearth.`;
  }
  return `${streak} day streak. Open the hearth.`;
}
