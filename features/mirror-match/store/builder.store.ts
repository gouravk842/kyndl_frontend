import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type Answer,
  blankMirrorContent,
  type MirrorContent,
  type MirrorItem,
  type Mood,
  MOOD_ORDER,
  type Occasion,
  packForOccasion,
} from "../config";

/** Stable id for a new prompt (SSR-safe; uniqueness within the list is enough). */
function mintId(existing: MirrorItem[]): string {
  const max = existing.reduce((m, it) => {
    const n = Number(it.id.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `m${max + 1}`;
}

/** Sensible mood default, cycling so a fresh list has variety. */
export function itemMoodDefault(count: number): Mood {
  return MOOD_ORDER[count % MOOD_ORDER.length]!;
}

/** A fresh document — empty prompt list; meta from blankMirrorContent. */
export function starterDoc(): MirrorContent {
  return blankMirrorContent();
}

type DeckMeta = Pick<
  MirrorContent,
  "recipientName" | "ownerName" | "title" | "intro" | "occasion"
>;

export type ItemInput = Omit<MirrorItem, "id">;

interface BuilderState {
  doc: MirrorContent;
  selectedId: string | null;

  loadDoc: (doc: MirrorContent) => void;
  setMeta: (patch: Partial<DeckMeta>) => void;

  /** Add a prompt; owner-answer defaults to "yes". Returns the new id. */
  addItem: (item: ItemInput) => string;
  updateItem: (id: string, patch: Partial<ItemInput>) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, dir: -1 | 1) => void;
  selectItem: (id: string | null) => void;

  setOwnerAnswer: (id: string, answer: Answer) => void;

  /** Replace items with the pack for an occasion; owner answers all "yes". */
  applyPack: (occasion: Occasion) => void;

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

      applyPack: (occasion) => {
        const items = packForOccasion(occasion).map((it) => ({ ...it }));
        const ownerAnswers: Record<string, Answer> = {};
        for (const it of items) ownerAnswers[it.id] = "yes";
        set((s) => ({
          doc: {
            ...s.doc,
            occasion,
            items,
            ownerAnswers,
          },
          selectedId: items[0]?.id ?? null,
        }));
      },

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:mirror-match-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
