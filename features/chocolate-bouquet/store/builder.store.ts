import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  BOUQUET_CONFIG,
  type BouquetConfig,
  type Chocolate,
  type ChocolateType,
} from "../config";

/** The most chocolates a bouquet holds before it starts to crowd (layout caps here too). */
export const MAX_CHOCOLATES = 24;

/** A fresh bouquet seeded from the sample, so a new builder isn't empty. */
export function starterDoc(): BouquetConfig {
  return {
    ...BOUQUET_CONFIG,
    chocolates: BOUQUET_CONFIG.chocolates.map((c) => ({ ...c })),
    // A unique id so each saved bouquet replays its own wrapping ceremony.
    id: "my-bouquet",
  };
}

/** Next chocolate id — one past the current max so removals never collide. */
function nextId(chocolates: Chocolate[]): number {
  return chocolates.reduce((max, c) => Math.max(max, c.id), 0) + 1;
}

/** A new chocolate of the given type, ready for the user to write. */
function blankChocolate(id: number, type: ChocolateType): Chocolate {
  return {
    id,
    type,
    label: "a new memory",
    date: "",
    message: "Write the moment this chocolate holds…",
    imageUrl: null,
    audioUrl: type === "voice" ? null : undefined,
  };
}

type BouquetMeta = Pick<
  BouquetConfig,
  "recipientName" | "bouquetName" | "subtitle" | "allOpenedMessage" | "wrapColor" | "bowColor"
>;

interface BuilderState {
  doc: BouquetConfig;
  /** The chocolate currently being edited. */
  selectedId: number | null;

  loadDoc: (doc: BouquetConfig) => void;
  setMeta: (patch: Partial<BouquetMeta>) => void;

  /** Append a chocolate of `type` and return its new id (or null if at the cap). */
  addChocolate: (type: ChocolateType) => number | null;
  updateChocolate: (id: number, patch: Partial<Omit<Chocolate, "id">>) => void;
  removeChocolate: (id: number) => void;
  selectChocolate: (id: number | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,

      loadDoc: (doc) =>
        set({ doc, selectedId: doc.chocolates[0]?.id ?? null }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      addChocolate: (type) => {
        const chocolates = get().doc.chocolates;
        if (chocolates.length >= MAX_CHOCOLATES) return null;
        const id = nextId(chocolates);
        set((s) => ({
          doc: {
            ...s.doc,
            chocolates: [...s.doc.chocolates, blankChocolate(id, type)],
          },
          selectedId: id,
        }));
        return id;
      },

      updateChocolate: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            chocolates: s.doc.chocolates.map((c) =>
              c.id === id ? { ...c, ...patch } : c,
            ),
          },
        })),

      removeChocolate: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            chocolates: s.doc.chocolates.filter((c) => c.id !== id),
          },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      selectChocolate: (id) => set({ selectedId: id }),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:chocolate-bouquet-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
