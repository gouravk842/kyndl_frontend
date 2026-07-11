import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DICE_CONFIG,
  type DiceConfig,
  type Heat,
  type Position,
} from "../config";

/** A fresh document. Unlike the deck, the dice grid must always be complete —
 *  every square the dice can land on needs something on it — so a new game is
 *  seeded from the full sample board, ready to be reworded square by square. */
export function starterDoc(): DiceConfig {
  return {
    recipientName: DICE_CONFIG.recipientName,
    gameTitle: DICE_CONFIG.gameTitle,
    intro: DICE_CONFIG.intro,
    positions: DICE_CONFIG.positions.map((p) => ({ ...p })),
  };
}

type DiceMeta = Pick<DiceConfig, "recipientName" | "gameTitle" | "intro">;

/** A square's editable payload (everything but its fixed grid id). */
export type PositionInput = Omit<Position, "id">;

interface BuilderState {
  doc: DiceConfig;
  /** The square currently open in the editor. */
  selectedId: number | null;

  loadDoc: (doc: DiceConfig) => void;
  setMeta: (patch: Partial<DiceMeta>) => void;

  updatePosition: (id: number, patch: Partial<PositionInput>) => void;
  selectPosition: (id: number | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      selectedId: null,

      // `assets` is part of the shared sync contract but the game has no media;
      // ignore the second arg. A loaded doc with a short grid (older or partial
      // save) is back-filled from the sample so the board is never broken.
      loadDoc: (doc) =>
        set({ doc: { ...doc, positions: fillGrid(doc.positions) } }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      updatePosition: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            positions: s.doc.positions.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
          },
        })),

      selectPosition: (id) => set({ selectedId: id }),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:dice-of-desire-builder",
      // Persist only the document.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);

/** Ensure a 36-square grid: keep what's loaded, fall back to the sample square
 *  for any id that's missing, so a roll can never land on an empty cell. */
function fillGrid(positions: Position[]): Position[] {
  const byId = new Map(positions.map((p) => [p.id, p]));
  return DICE_CONFIG.positions.map((sample) => byId.get(sample.id) ?? { ...sample });
}

export type { Heat };
