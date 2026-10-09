import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type LoveBands,
  type LoveCalculatorConfig,
  starterDoc,
} from "../config";

type Meta = Pick<
  LoveCalculatorConfig,
  "title" | "intro" | "nameA" | "nameB" | "note"
>;

interface BuilderState {
  doc: LoveCalculatorConfig;
  loadDoc: (doc: LoveCalculatorConfig) => void;
  setMeta: (patch: Partial<Meta>) => void;
  setBands: (patch: Partial<LoveBands>) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      loadDoc: (doc) => set({ doc }),
      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),
      setBands: (patch) =>
        set((s) => ({
          doc: { ...s.doc, bands: { ...s.doc.bands, ...patch } },
        })),
      reset: () => set({ doc: starterDoc() }),
    }),
    {
      name: "kyndl:love-calculator-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
