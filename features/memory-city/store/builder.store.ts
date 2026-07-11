import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SEED_DOC } from "../data/seed-city";
import type { CityDoc } from "../lib/city-from-memories";
import { type CityMemory, DEFAULT_THEME, type Mood } from "../types";

/**
 * The Memory City builder edits a **meaning-only** {@link CityDoc}: a title, gift
 * attribution, and an ordered list of memories (date / words / mood / shell). It
 * never touches coordinates — the layout engine derives the world from this doc
 * (see `lib/city-from-memories.ts`), so the builder's whole job is curating
 * *meaning* and letting the city arrange itself.
 *
 * Mirrors the constellation builder store: a `persist`ed `doc` + `selectedId`,
 * with add/update/remove/move/select memory actions and a `reset`. `partialize`
 * keeps only `doc` on device; the sync hook handles cloud save.
 */

/** A fresh city seeded from the sample so a new builder isn't an empty plaza. */
export function starterDoc(): CityDoc {
  return {
    ...SEED_DOC,
    // A unique id so each saved city seeds its own deterministic layout.
    id: "my-city",
    theme: SEED_DOC.theme ?? DEFAULT_THEME,
    memories: SEED_DOC.memories.map((m) => ({ ...m })),
  };
}

/** Next memory id — `mem-N` one past the current max so removals never collide. */
function nextMemoryId(memories: CityMemory[]): string {
  const max = memories.reduce((acc, m) => {
    const match = /^mem-(\d+)$/.exec(m.id);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `mem-${max + 1}`;
}

/** A new memory dropped on today's date for the author to fill in. */
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
  /** The memory currently being edited. */
  selectedId: string | null;

  loadDoc: (doc: CityDoc) => void;
  setMeta: (patch: Partial<CityMeta>) => void;

  addMemory: () => void;
  updateMemory: (id: string, patch: Partial<Omit<CityMemory, "id">>) => void;
  removeMemory: (id: string) => void;
  /** Reorder a memory (order sets the timeline spine when dates tie). */
  moveMemory: (id: string, dir: -1 | 1) => void;
  selectMemory: (id: string | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      selectedId: starterDoc().memories[0]?.id ?? null,

      loadDoc: (doc) =>
        set({ doc, selectedId: doc.memories[0]?.id ?? null }),

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
              // Drop any `requires` that pointed at the removed memory so a node
              // never waits on a memory that no longer exists.
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
        set({ doc: starterDoc(), selectedId: starterDoc().memories[0]?.id ?? null }),
    }),
    {
      name: "kyndl:memory-city-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);

/** Mood options for the builder select. */
export const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "joyful", label: "Joyful" },
  { value: "nostalgic", label: "Nostalgic" },
  { value: "bittersweet", label: "Bittersweet" },
  { value: "epic", label: "Epic" },
  { value: "quiet", label: "Quiet" },
];

/** Shell (building) options for the builder select. */
export const SHELL_OPTIONS: { value: string; label: string }[] = [
  { value: "tower", label: "Tower" },
  { value: "pavilion", label: "Pavilion" },
  { value: "lantern", label: "Lantern" },
  { value: "vault", label: "Vault" },
];
