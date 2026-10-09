import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SEED_DOC } from "../data/seed-city";
import type { CityDoc } from "../lib/city-from-memories";
import {
  type CityMemory,
  DEFAULT_THEME,
  LAYOUT_ENGINE_VERSION,
  type Mood,
} from "../types";

/**
 * The Memory City builder edits a **meaning-only** {@link CityDoc}.
 */

export function starterDoc(): CityDoc {
  return {
    ...SEED_DOC,
    id: "my-city",
    theme: SEED_DOC.theme ?? DEFAULT_THEME,
    layoutEngineVersion: LAYOUT_ENGINE_VERSION,
    memories: SEED_DOC.memories.map((m) => ({ ...m })),
  };
}

function nextMemoryId(memories: CityMemory[]): string {
  const max = memories.reduce((acc, m) => {
    const match = /^mem-(\d+)$/.exec(m.id);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `mem-${max + 1}`;
}

function blankMemory(id: string): CityMemory {
  return {
    id,
    date: "",
    title: "A new memory",
    body: "Write the moment this place holds…",
    person: "",
    mood: "joyful",
  };
}

type CityMeta = Pick<CityDoc, "title" | "from" | "to">;

interface BuilderState {
  doc: CityDoc;
  selectedId: string | null;
  assets: Record<string, string>;
  localPreviews: Record<string, string>;

  loadDoc: (doc: CityDoc, assets?: Record<string, string>) => void;
  registerPreview: (fileId: string, previewUrl: string) => void;
  setMeta: (patch: Partial<CityMeta>) => void;

  addMemory: () => void;
  updateMemory: (id: string, patch: Partial<Omit<CityMemory, "id">>) => void;
  removeMemory: (id: string) => void;
  moveMemory: (id: string, dir: -1 | 1) => void;
  selectMemory: (id: string | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      selectedId: starterDoc().memories[0]?.id ?? null,
      assets: {},
      localPreviews: {},

      loadDoc: (doc, assets = {}) =>
        set({
          doc: {
            ...doc,
            layoutEngineVersion:
              doc.layoutEngineVersion ?? LAYOUT_ENGINE_VERSION,
          },
          selectedId: doc.memories[0]?.id ?? null,
          assets,
        }),

      registerPreview: (fileId, previewUrl) =>
        set((s) => ({
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      addMemory: () =>
        set((s) => {
          const memory = blankMemory(nextMemoryId(s.doc.memories));
          return {
            doc: { ...s.doc, memories: [...s.doc.memories, memory] },
            selectedId: memory.id,
          };
        }),

      updateMemory: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            memories: s.doc.memories.map((m) =>
              m.id === id ? { ...m, ...patch } : m,
            ),
          },
        })),

      removeMemory: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            memories: s.doc.memories
              .filter((m) => m.id !== id)
              .map((m) =>
                m.requires?.includes(id)
                  ? { ...m, requires: m.requires.filter((r) => r !== id) }
                  : m,
              ),
          },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      moveMemory: (id, dir) =>
        set((s) => {
          const memories = [...s.doc.memories];
          const i = memories.findIndex((m) => m.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= memories.length) return s;
          [memories[i], memories[j]] = [memories[j]!, memories[i]!];
          return { doc: { ...s.doc, memories } };
        }),

      selectMemory: (id) => set({ selectedId: id }),

      reset: () =>
        set({
          doc: starterDoc(),
          selectedId: starterDoc().memories[0]?.id ?? null,
          assets: {},
          localPreviews: {},
        }),
    }),
    {
      name: "kyndl:memory-city-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);

export const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "joyful", label: "Joyful" },
  { value: "nostalgic", label: "Nostalgic" },
  { value: "bittersweet", label: "Bittersweet" },
  { value: "epic", label: "Epic" },
  { value: "quiet", label: "Quiet" },
];

export const SHELL_OPTIONS: { value: string; label: string }[] = [
  { value: "tower", label: "Tower" },
  { value: "pavilion", label: "Pavilion" },
  { value: "lantern", label: "Lantern" },
  { value: "vault", label: "Vault" },
];

export const GATE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "None" },
  { value: "question", label: "Question" },
  { value: "crossword", label: "Crossword" },
  { value: "image-puzzle", label: "Image puzzle" },
  { value: "time-lock", label: "Time lock" },
];

export const REWARD_OPTIONS: { value: string; label: string }[] = [
  { value: "message", label: "Message (default)" },
  { value: "mystery-box", label: "Mystery box" },
];
