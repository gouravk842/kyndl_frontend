import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type FoldedNoteConfig,
  type NoteReactions,
  starterDoc,
} from "../config";

type Meta = Pick<
  FoldedNoteConfig,
  "title" | "fromName" | "toName" | "question" | "body"
>;

interface BuilderState {
  doc: FoldedNoteConfig;
  loadDoc: (doc: FoldedNoteConfig) => void;
  setMeta: (patch: Partial<Meta>) => void;
  setReactions: (patch: Partial<NoteReactions>) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      loadDoc: (doc) => set({ doc }),
      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),
      setReactions: (patch) =>
        set((s) => ({
          doc: { ...s.doc, reactions: { ...s.doc.reactions, ...patch } },
        })),
      reset: () => set({ doc: starterDoc() }),
    }),
    {
      name: "kyndl:folded-note-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
