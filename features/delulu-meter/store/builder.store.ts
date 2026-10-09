import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type DeluluBands,
  type DeluluMeterConfig,
  type DeluluQuestion,
  starterDoc,
} from "../config";

interface BuilderState {
  doc: DeluluMeterConfig;
  loadDoc: (doc: DeluluMeterConfig) => void;
  setMeta: (patch: Partial<Pick<DeluluMeterConfig, "title" | "intro">>) => void;
  setQuestions: (questions: DeluluQuestion[]) => void;
  setBands: (patch: Partial<DeluluBands>) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      loadDoc: (doc) => set({ doc }),
      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),
      setQuestions: (questions) =>
        set((s) => ({ doc: { ...s.doc, questions } })),
      setBands: (patch) =>
        set((s) => ({
          doc: { ...s.doc, bands: { ...s.doc.bands, ...patch } },
        })),
      reset: () => set({ doc: starterDoc() }),
    }),
    {
      name: "kyndl:delulu-meter-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
