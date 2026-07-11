import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type Answer,
  type Heat,
  HEAT_ORDER,
  MATCHER_CONFIG,
  type MatcherContent,
  type MatcherItem,
} from "../config";

/** A short, stable id for a new item (timestamp-free so it's SSR-safe enough;
 *  uniqueness within a deck is all we need). */
function mintId(existing: MatcherItem[]): string {
  const max = existing.reduce((m, it) => {
    const n = Number(it.id.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `i${max + 1}`;
}

/** Sensible heat default for a new item, cycling so a fresh list has variety. */
export function itemHeatDefault(count: number): Heat {
  return HEAT_ORDER[count % HEAT_ORDER.length]!;
}

/** A fresh document — empty item list; meta seeded from the sample. */
export function starterDoc(): MatcherContent {
  return {
    recipientName: MATCHER_CONFIG.recipientName,
    ownerName: MATCHER_CONFIG.ownerName,
    title: MATCHER_CONFIG.title,
    intro: MATCHER_CONFIG.intro,
    ownerAnswers: {},
    items: [],
  };
}

type DeckMeta = Pick<
  MatcherContent,
  "recipientName" | "ownerName" | "title" | "intro"
>;

export type ItemInput = Omit<MatcherItem, "id">;

interface BuilderState {
  doc: MatcherContent;
  selectedId: string | null;

  loadDoc: (doc: MatcherContent) => void;
  setMeta: (patch: Partial<DeckMeta>) => void;

  /** Add an item; its owner-answer defaults to "yes" (the owner is curating
   *  their own wishlist). Returns the new id. */
  addItem: (item: ItemInput) => string;
  updateItem: (id: string, patch: Partial<ItemInput>) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, dir: -1 | 1) => void;
  selectItem: (id: string | null) => void;

  /** The owner's own yes/maybe/no for an item. */
  setOwnerAnswer: (id: string, answer: Answer) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,

      loadDoc: (doc) => set({ doc, selectedId: doc.items[0]?.id ?? null }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      addItem: (item) => {
        const id = mintId(get().doc.items);
        set((s) => ({
          doc: {
            ...s.doc,
            items: [...s.doc.items, { ...item, id }],
            ownerAnswers: { ...s.doc.ownerAnswers, [id]: "yes" },
          },
          selectedId: id,
        }));
        return id;
      },

      updateItem: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            items: s.doc.items.map((it) =>
              it.id === id ? { ...it, ...patch } : it,
            ),
          },
        })),

      removeItem: (id) =>
        set((s) => {
          const { [id]: _drop, ...ownerAnswers } = s.doc.ownerAnswers;
          return {
            doc: {
              ...s.doc,
              items: s.doc.items.filter((it) => it.id !== id),
              ownerAnswers,
            },
            selectedId: s.selectedId === id ? null : s.selectedId,
          };
        }),

      moveItem: (id, dir) =>
        set((s) => {
          const items = [...s.doc.items];
          const i = items.findIndex((it) => it.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= items.length) return {};
          const a = items[i];
          const b = items[j];
          if (!a || !b) return {};
          items[i] = b;
          items[j] = a;
          return { doc: { ...s.doc, items } };
        }),

      selectItem: (id) => set({ selectedId: id }),

      setOwnerAnswer: (id, answer) =>
        set((s) => ({
          doc: {
            ...s.doc,
            ownerAnswers: { ...s.doc.ownerAnswers, [id]: answer },
          },
        })),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:desire-matcher-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
