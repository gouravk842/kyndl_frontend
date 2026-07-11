import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  TIME_CAPSULE_CONFIG,
  type TimeCapsuleConfig,
  type TimeCapsuleLetter,
  type TimeCapsuleThemeKey,
} from "../config";

/** The single-value fields edited directly in the panel. */
type CapsuleMeta = Pick<
  TimeCapsuleConfig,
  "title" | "recipientName" | "senderName" | "unlockDate" | "teaser"
>;

/** A fresh document, seeded from the sample with no photos. */
export function starterDoc(): TimeCapsuleConfig {
  return {
    title: TIME_CAPSULE_CONFIG.title,
    recipientName: TIME_CAPSULE_CONFIG.recipientName,
    senderName: TIME_CAPSULE_CONFIG.senderName,
    unlockDate: TIME_CAPSULE_CONFIG.unlockDate,
    theme: TIME_CAPSULE_CONFIG.theme,
    teaser: TIME_CAPSULE_CONFIG.teaser,
    letter: { ...TIME_CAPSULE_CONFIG.letter },
    photos: [],
  };
}

interface BuilderState {
  doc: TimeCapsuleConfig;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: TimeCapsuleConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<CapsuleMeta>) => void;
  setLetter: (patch: Partial<TimeCapsuleLetter>) => void;
  setTheme: (theme: TimeCapsuleThemeKey) => void;

  addPhoto: (fileId: string, previewUrl: string) => void;
  removePhoto: (fileId: string) => void;

  setMusic: (fileId: string, previewUrl: string) => void;
  removeMusic: () => void;

  /** Resolve a media ref to a renderable URL (local preview wins, else asset). */
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

      setLetter: (patch) =>
        set((s) => ({ doc: { ...s.doc, letter: { ...s.doc.letter, ...patch } } })),

      setTheme: (theme) => set((s) => ({ doc: { ...s.doc, theme } })),

      addPhoto: (fileId, previewUrl) =>
        set((s) => ({
          doc: { ...s.doc, photos: [...s.doc.photos, { fileId }] },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removePhoto: (fileId) =>
        set((s) => ({
          doc: {
            ...s.doc,
            photos: s.doc.photos.filter((p) => p.fileId !== fileId),
          },
        })),

      setMusic: (fileId, previewUrl) =>
        set((s) => ({
          doc: { ...s.doc, music: { fileId } },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removeMusic: () => set((s) => ({ doc: { ...s.doc, music: undefined } })),

      urlFor: (ref) => {
        if (!ref) return null;
        const { localPreviews, assets } = get();
        return localPreviews[ref.fileId] ?? assets[ref.fileId] ?? null;
      },

      reset: () => set({ doc: starterDoc() }),
    }),
    {
      name: "kyndl:time-capsule-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
