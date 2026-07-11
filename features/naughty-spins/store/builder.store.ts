import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  CATEGORY_COLORS,
  type SpinCategory,
  WHEEL_CONFIG,
  type WheelConfig,
} from "../config";

/** A fresh document — seeded from the sample so the wheel is playable on day one
 *  (a wheel with no slices reads as broken); authors edit or replace from there. */
export function starterDoc(): WheelConfig {
  return {
    recipientName: WHEEL_CONFIG.recipientName,
    wheelTitle: WHEEL_CONFIG.wheelTitle,
    intro: WHEEL_CONFIG.intro,
    categories: WHEEL_CONFIG.categories.map((c) => ({
      ...c,
      prompts: [...c.prompts],
    })),
  };
}

/** Categories carry numeric ids; the next id is one past the current max so
 *  removals never collide. */
export function nextCategoryId(categories: SpinCategory[]): number {
  return categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

/** Sensible defaults for a brand-new category — a fresh colour off the palette. */
export function categoryDefaults(
  categories: SpinCategory[],
): Pick<SpinCategory, "color"> {
  return { color: CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]! };
}

type WheelMeta = Pick<WheelConfig, "recipientName" | "wheelTitle" | "intro">;

/** A category's editable payload (everything but its id). */
export type CategoryInput = Omit<SpinCategory, "id">;

interface BuilderState {
  doc: WheelConfig;
  /** The category currently being edited. */
  selectedId: number | null;

  loadDoc: (doc: WheelConfig) => void;
  setMeta: (patch: Partial<WheelMeta>) => void;

  /** Add a fully-formed category (from the form); returns its new id. */
  addCategory: (category: CategoryInput) => number;
  updateCategory: (id: number, patch: Partial<CategoryInput>) => void;
  removeCategory: (id: number) => void;
  moveCategory: (id: number, dir: -1 | 1) => void;
  selectCategory: (id: number | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,

      // `assets` is part of the shared sync contract but the wheel has no media;
      // ignore the second arg.
      loadDoc: (doc) =>
        set({ doc, selectedId: doc.categories[0]?.id ?? null }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      addCategory: (category) => {
        const id = nextCategoryId(get().doc.categories);
        set((s) => ({
          doc: {
            ...s.doc,
            categories: [...s.doc.categories, { ...category, id }],
          },
          selectedId: id,
        }));
        return id;
      },

      updateCategory: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            categories: s.doc.categories.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          },
        })),

      removeCategory: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            categories: s.doc.categories.filter((c) => c.id !== id),
          },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      moveCategory: (id, dir) =>
        set((s) => {
          const categories = [...s.doc.categories];
          const i = categories.findIndex((c) => c.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= categories.length) return {};
          const a = categories[i];
          const b = categories[j];
          if (!a || !b) return {};
          categories[i] = b;
          categories[j] = a;
          return { doc: { ...s.doc, categories } };
        }),

      selectCategory: (id) => set({ selectedId: id }),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:naughty-spins-builder",
      // Persist only the document.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
