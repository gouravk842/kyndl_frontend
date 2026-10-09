import type { Heat } from "@/features/desire-deck/config";
import type { ActivityIntensity } from "@/features/ludo/types";
import type { Mood } from "@/features/mirror-match/config";

import type { BankItem } from "./types";

/** Red Zone heat implied by the item's type. The builder can change it after. */
export function heatForType(slug: string): Heat {
  if (slug === "sexual") return "spicy";
  if (slug === "normal") return "sweet";
  return "flirty";
}

/** Ludo deck implied by type. Adult types never reach this picker. */
export function ludoDeckForType(slug: string): ActivityIntensity {
  if (slug === "playful") return "fun";
  if (slug === "romantic") return "spicy";
  return "sweet";
}

export function mirrorMoodForType(slug: string): Mood {
  if (slug === "playful") return "funny";
  if (slug === "romantic") return "sweet";
  return "us";
}

/** One line for games that store a single string. */
export function lineText(item: Pick<BankItem, "text" | "detail">): string {
  const text = item.text.trim();
  const detail = item.detail.trim();
  return detail ? `${text} — ${detail}` : text;
}

/** Title plus how-to for dice, snakes, and coupons. Titles cap at 120. */
export function titled(item: Pick<BankItem, "text" | "detail">): {
  title: string;
  body: string;
} {
  const text = item.text.trim();
  const detail = item.detail.trim();
  if (text.length <= 120) return { title: text, body: detail };
  return { title: `${text.slice(0, 117)}…`, body: detail || text };
}
