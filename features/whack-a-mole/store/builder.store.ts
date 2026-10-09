import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type Apology,
  type Difficulty,
  starterDoc,
  type WhackAMoleConfig,
} from "../config";

type Meta = Pick<
  WhackAMoleConfig,
  "title" | "intro" | "playerName" | "sacredLabel"
>;

interface BuilderState {
  doc: WhackAMoleConfig;
  assets: Record<string, string>;
  localPreviews: Record<string, string>;

  loadDoc: (doc: WhackAMoleConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<Meta>) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setApology: (patch: Partial<Apology>) => void;
  setHitQuips: (quips: string[]) => void;
  setFace: (fileId: string, previewUrl: string) => void;
  removeFace: () => void;
  urlFor: (ref: { fileId: string } | null | undefined) => string | null;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      assets: {},
      localPreviews: {},

      loadDoc: (doc, assets = {}) => set({ doc, assets }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      setDifficulty: (difficulty) =>
        set((s) => ({ doc: { ...s.doc, difficulty } })),

      setApology: (patch) =>
        set((s) => ({
          doc: { ...s.doc, apology: { ...s.doc.apology, ...patch } },
        })),

      setHitQuips: (quips) =>
        set((s) => ({ doc: { ...s.doc, hitQuips: quips } })),

      setFace: (fileId, previewUrl) =>
        set((s) => ({
          doc: { ...s.doc, face: { fileId } },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removeFace: () => set((s) => ({ doc: { ...s.doc, face: null } })),

      urlFor: (ref) => {
        if (!ref) return null;
        const { localPreviews, assets } = get();
        return localPreviews[ref.fileId] ?? assets[ref.fileId] ?? null;
      },

      reset: () => set({ doc: starterDoc(), localPreviews: {} }),
    }),
    {
      name: "kyndl:whack-a-mole-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
