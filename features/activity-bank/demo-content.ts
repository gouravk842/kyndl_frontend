import type { DeluluMeterConfig } from "@/features/delulu-meter/config";
import type { DeckConfig } from "@/features/desire-deck/config";
import type { MatcherContent } from "@/features/desire-matcher/config";
import type { DiceConfig } from "@/features/dice-of-desire/config";
import type { CouponBook } from "@/features/love-coupons/config";
import type { ActivityConfig } from "@/features/ludo/types";
import type { MirrorContent } from "@/features/mirror-match/config";
import type { WheelConfig } from "@/features/naughty-spins/config";
import {
  CLIMAX_SQUARE,
  type SnakesConfig,
} from "@/features/snakes-and-lovers/config";
import type { ThisOrThatConfig } from "@/features/this-or-that/config";

import {
  heatForType,
  lineText,
  ludoDeckForType,
  mirrorMoodForType,
  titled,
} from "./map";
import { fileRef } from "./previews";
import type { BankItem } from "./types";

/**
 * Fill a bundled marketing sample from the live bank, keeping the sample's
 * shape (card count, board geometry, owner-answer ids). An empty pool leaves
 * that sample untouched so a failed or sparse catalog still plays.
 */

function openTruths(items: BankItem[], adult: boolean): BankItem[] {
  return items.filter(
    (item) =>
      item.kind === "truth" &&
      item.choices.length === 0 &&
      (adult || !item.type.isAdult),
  );
}

function dares(items: BankItem[], adult: boolean): BankItem[] {
  return items.filter(
    (item) => item.kind === "dare" && (adult || !item.type.isAdult),
  );
}

export function applyDesireDeck(
  items: BankItem[],
  base: DeckConfig,
): DeckConfig {
  const lines = items.filter((item) => item.choices.length === 0);
  if (!lines.length) return base;
  return {
    ...base,
    cards: base.cards.map((card, index) => {
      const item = lines[index];
      if (!item) return card;
      const image = fileRef(item);
      return {
        ...card,
        prompt: lineText(item),
        heat: heatForType(item.type.slug),
        image: image ?? null,
      };
    }),
  };
}

export function applyMatcher(
  items: BankItem[],
  base: MatcherContent,
): MatcherContent {
  const lines = dares(items, true);
  if (!lines.length) return base;
  return {
    ...base,
    items: base.items.map((row, index) => {
      const item = lines[index];
      if (!item) return row;
      const image = fileRef(item);
      return {
        ...row,
        label: lineText(item).slice(0, 400),
        heat: heatForType(item.type.slug),
        image: image ?? null,
      };
    }),
  };
}

export function applyCoupons(items: BankItem[], base: CouponBook): CouponBook {
  const lines = dares(items, true);
  if (!lines.length) return base;
  return {
    ...base,
    coupons: base.coupons.map((coupon, index) => {
      const item = lines[index];
      if (!item) return coupon;
      const image = fileRef(item);
      const { title, body } = titled(item);
      return {
        ...coupon,
        title,
        description: body,
        heat: heatForType(item.type.slug),
        image: image ?? null,
      };
    }),
  };
}

export function applyDice(items: BankItem[], base: DiceConfig): DiceConfig {
  const tagged = dares(items, true).filter((item) =>
    item.tags.some((tag) => tag.slug === "position"),
  );
  const rest = dares(items, true).filter(
    (item) => !item.tags.some((tag) => tag.slug === "position"),
  );
  const lines = [...tagged, ...rest];
  if (!lines.length) return base;
  return {
    ...base,
    positions: base.positions.map((position, index) => {
      const item = lines[index];
      if (!item) return position;
      const image = fileRef(item);
      const { title, body } = titled(item);
      return {
        ...position,
        name: title,
        note: body,
        heat: heatForType(item.type.slug),
        image: image ?? null,
      };
    }),
  };
}

export function applySnakes(
  items: BankItem[],
  base: SnakesConfig,
): SnakesConfig {
  const lines = dares(items, true);
  if (!lines.length) return base;
  let cursor = 0;
  return {
    ...base,
    squares: base.squares.map((square) => {
      if (square.id === CLIMAX_SQUARE) return square;
      const item = lines[cursor];
      if (!item) return square;
      cursor += 1;
      const image = fileRef(item);
      const { title, body } = titled(item);
      return {
        ...square,
        name: title,
        note: body,
        image: image ?? null,
      };
    }),
  };
}

function wheelPool(label: string, items: BankItem[]): BankItem[] {
  if (/charade/i.test(label)) {
    const tagged = items.filter((item) =>
      item.tags.some((tag) => tag.slug === "charades"),
    );
    if (tagged.length) return tagged;
  }
  if (/talk/i.test(label)) {
    const tagged = openTruths(items, true).filter((item) =>
      item.tags.some((tag) => tag.slug === "deep-talk"),
    );
    return tagged.length ? tagged : openTruths(items, true);
  }
  return dares(items, true);
}

export function applyWheel(items: BankItem[], base: WheelConfig): WheelConfig {
  const cursors = new Map<string, number>();
  return {
    ...base,
    categories: base.categories.map((category) => {
      const pool = wheelPool(category.label, items);
      if (!pool.length) return category;
      const key = /talk/i.test(category.label)
        ? "talk"
        : /charade/i.test(category.label)
          ? "charades"
          : "dare";
      const start = cursors.get(key) ?? 0;
      const prompts = category.prompts.map((existing, index) => {
        const item = pool[start + index];
        return item ? lineText(item) : existing;
      });
      cursors.set(key, start + category.prompts.length);
      return { ...category, prompts };
    }),
  };
}

export function applyMirror(
  items: BankItem[],
  base: MirrorContent,
): MirrorContent {
  const lines = openTruths(items, false).filter(
    (item) => item.type.slug === "normal" || item.type.slug === "romantic",
  );
  if (!lines.length) return base;
  return {
    ...base,
    items: base.items.map((row, index) => {
      const item = lines[index];
      if (!item) return row;
      return {
        ...row,
        label: item.text.slice(0, 400),
        mood: mirrorMoodForType(item.type.slug),
      };
    }),
  };
}

export function applyDelulu(
  items: BankItem[],
  base: DeluluMeterConfig,
): DeluluMeterConfig {
  const lines = openTruths(items, false).filter(
    (item) => item.type.slug === "playful",
  );
  if (!lines.length) return base;
  return {
    ...base,
    questions: base.questions.map((question, index) => {
      const item = lines[index];
      if (!item) return question;
      return { ...question, prompt: item.text };
    }),
  };
}

export function applyThisOrThat(
  items: BankItem[],
  base: ThisOrThatConfig,
): ThisOrThatConfig {
  const pairs = items.filter(
    (item) =>
      item.kind === "truth" && item.choices.length >= 2 && !item.type.isAdult,
  );
  if (!pairs.length) return base;
  return {
    ...base,
    pairs: pairs.slice(0, 16).map((item, index) => ({
      id: base.pairs[index]?.id ?? `p${index + 1}`,
      left: item.choices[0] ?? "",
      right: item.choices[1] ?? "",
    })),
  };
}

export function applyLudoActivities(
  items: BankItem[],
  base: ActivityConfig,
): ActivityConfig {
  const decks: ActivityConfig["decks"] = { sweet: [], fun: [], spicy: [] };
  for (const item of items) {
    if (item.type.isAdult || item.choices.length > 0) continue;
    decks[ludoDeckForType(item.type.slug)].push(lineText(item));
  }
  if (!decks.sweet.length && !decks.fun.length && !decks.spicy.length)
    return base;
  return {
    ...base,
    decks: {
      sweet: decks.sweet.length ? decks.sweet : base.decks.sweet,
      fun: decks.fun.length ? decks.fun : base.decks.fun,
      spicy: decks.spicy.length ? decks.spicy : base.decks.spicy,
    },
  };
}
