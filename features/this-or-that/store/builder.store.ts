import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  starterDoc,
  type ThisOrThatConfig,
  type ThisOrThatPair,
} from "../config";

interface BuilderState {
  doc: ThisOrThatConfig;
  loadDoc: (doc: ThisOrThatConfig) => void;
  setMeta: (
    patch: Partial<Pick<ThisOrThatConfig, "title" | "intro" | "resultBlurb">>,
  ) => void;
  setPairs: (pairs: ThisOrThatPair[]) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      loadDoc: (doc) => set({ doc }),
      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),
      setPairs: (pairs) => set((s) => ({ doc: { ...s.doc, pairs } })),
      reset: () => set({ doc: starterDoc() }),
    }),
    {
      name: "kyndl:this-or-that-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
