import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type FlamesConfig, starterDoc } from "../config";

interface BuilderState {
  doc: FlamesConfig;
  loadDoc: (doc: FlamesConfig) => void;
  setMeta: (patch: Partial<FlamesConfig>) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      loadDoc: (doc) => set({ doc }),
      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),
      reset: () => set({ doc: starterDoc() }),
    }),
    { name: "kyndl:flames-builder", partialize: (s) => ({ doc: s.doc }) },
  ),
);
