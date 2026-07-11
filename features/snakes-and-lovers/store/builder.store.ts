import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type Heat,
  SNAKES_CONFIG,
  type SnakesConfig,
  type Square,
} from "../config";

/** A fresh document. The track must always be complete — every square a token
 *  can land on needs a dare — so a new game is seeded from the full sample
 *  board, ready to be reworded square by square. */
export function starterDoc(): SnakesConfig {
  return {
    recipientName: SNAKES_CONFIG.recipientName,
    gameTitle: SNAKES_CONFIG.gameTitle,
    intro: SNAKES_CONFIG.intro,
    squares: SNAKES_CONFIG.squares.map((s) => ({ ...s })),
  };
}

type SnakesMeta = Pick<SnakesConfig, "recipientName" | "gameTitle" | "intro">;

/** A square's editable payload (everything but its fixed track id). */
export type SquareInput = Omit<Square, "id">;

interface BuilderState {
  doc: SnakesConfig;
  /** The square currently open in the editor. */
  selectedId: number | null;

  loadDoc: (doc: SnakesConfig) => void;
  setMeta: (patch: Partial<SnakesMeta>) => void;

  updateSquare: (id: number, patch: Partial<SquareInput>) => void;
  selectSquare: (id: number | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      selectedId: null,

      // `assets` is part of the shared sync contract but the game has no media;
      // ignore it. A loaded doc with a short track (older or partial save) is
      // back-filled from the sample so the board is never broken.
      loadDoc: (doc) =>
        set({ doc: { ...doc, squares: fillTrack(doc.squares) } }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      updateSquare: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            squares: s.doc.squares.map((sq) =>
              sq.id === id ? { ...sq, ...patch } : sq,
            ),
          },
        })),

      selectSquare: (id) => set({ selectedId: id }),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:snakes-and-lovers-builder",
      // Persist only the document.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);

/** Ensure a full 100-square track: keep what's loaded, fall back to the sample
 *  dare for any id that's missing, so a token can never land on a blank square. */
function fillTrack(squares: Square[]): Square[] {
  const byId = new Map(squares.map((s) => [s.id, s]));
  return SNAKES_CONFIG.squares.map(
    (sample) => byId.get(sample.id) ?? { ...sample },
  );
}

export type { Heat };
