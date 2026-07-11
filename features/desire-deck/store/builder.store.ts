import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DECK_CONFIG,
  type DeckCard,
  type DeckConfig,
  type Heat,
  HEAT_ORDER,
} from "../config";

/** A gentle, deterministic tilt for a card, seeded by its id so the drawn pile
 *  looks hand-shuffled and stays stable across renders. */
function tiltFor(id: number): number {
  const steps = [-6, 5, -3, 8, -9, 4, -5, 7];
  return steps[id % steps.length]!;
}

/** Sensible defaults for a brand-new card, seeded by its next id so successive
 *  cards don't all look (or read as) identical. */
export function cardDefaults(nextId: number): Pick<DeckCard, "rotation" | "heat"> {
  return {
    rotation: tiltFor(nextId),
    heat: HEAT_ORDER[nextId % HEAT_ORDER.length]!,
  };
}

/** A fresh document — the deck starts empty; cards are added by hand. The deck
 *  meta is seeded from the sample so the fields aren't blank. */
export function starterDoc(): DeckConfig {
  return {
    recipientName: DECK_CONFIG.recipientName,
    deckTitle: DECK_CONFIG.deckTitle,
    intro: DECK_CONFIG.intro,
    outro: DECK_CONFIG.outro,
    cards: [],
  };
}

/** Cards carry numeric ids; the next id is one past the current max so removals
 *  never collide. */
export function nextCardId(cards: DeckCard[]): number {
  return cards.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

type DeckMeta = Pick<
  DeckConfig,
  "recipientName" | "deckTitle" | "intro" | "outro"
>;

/** A card's editable payload (everything but its id). */
export type CardInput = Omit<DeckCard, "id">;

interface BuilderState {
  doc: DeckConfig;
  /** The card currently being edited. */
  selectedId: number | null;

  loadDoc: (doc: DeckConfig) => void;
  setMeta: (patch: Partial<DeckMeta>) => void;

  /** Add a fully-formed card (from the card form); returns its new id. */
  addCard: (card: CardInput) => number;
  updateCard: (id: number, patch: Partial<CardInput>) => void;
  removeCard: (id: number) => void;
  moveCard: (id: number, dir: -1 | 1) => void;
  selectCard: (id: number | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,

      // `assets` is part of the shared sync contract but the deck has no media;
      // ignore the second arg.
      loadDoc: (doc) =>
        set({ doc, selectedId: doc.cards[0]?.id ?? null }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      addCard: (card) => {
        const id = nextCardId(get().doc.cards);
        set((s) => ({
          doc: { ...s.doc, cards: [...s.doc.cards, { ...card, id }] },
          selectedId: id,
        }));
        return id;
      },

      updateCard: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            cards: s.doc.cards.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          },
        })),

      removeCard: (id) =>
        set((s) => ({
          doc: { ...s.doc, cards: s.doc.cards.filter((c) => c.id !== id) },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      moveCard: (id, dir) =>
        set((s) => {
          const cards = [...s.doc.cards];
          const i = cards.findIndex((c) => c.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= cards.length) return {};
          const a = cards[i];
          const b = cards[j];
          if (!a || !b) return {};
          cards[i] = b;
          cards[j] = a;
          return { doc: { ...s.doc, cards } };
        }),

      selectCard: (id) => set({ selectedId: id }),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:desire-deck-builder",
      // Persist only the document.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);

export type { Heat };
