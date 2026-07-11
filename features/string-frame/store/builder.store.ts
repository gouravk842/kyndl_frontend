import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type FrameThemeKey,
  type HiddenMessage,
  STRING_FRAME_CONFIG,
  type StringFrameConfig,
} from "../config";

/** The single text fields edited directly in the panel (no media, no photos). */
type FrameMeta = Pick<StringFrameConfig, "name" | "caption" | "giftLabel">;

/** A fresh, unique id for a new pinned photo. */
function newPhotoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Math.floor(performance.now() * 1000).toString(36)}`;
}

/** A fresh document, seeded from the sample so the fields aren't blank — but
 *  with no photos or music (those are added by hand). */
export function starterDoc(): StringFrameConfig {
  return {
    name: STRING_FRAME_CONFIG.name,
    caption: STRING_FRAME_CONFIG.caption,
    theme: STRING_FRAME_CONFIG.theme,
    giftLabel: STRING_FRAME_CONFIG.giftLabel,
    photos: [],
    hidden: { heading: STRING_FRAME_CONFIG.hidden.heading, body: "" },
  };
}

interface BuilderState {
  doc: StringFrameConfig;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: StringFrameConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<FrameMeta>) => void;
  setTheme: (theme: FrameThemeKey) => void;
  setHidden: (patch: Partial<HiddenMessage>) => void;

  addPhoto: (fileId: string, previewUrl: string) => void;
  removePhoto: (id: string) => void;
  movePhoto: (id: string, dir: -1 | 1) => void;

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

      setTheme: (theme) => set((s) => ({ doc: { ...s.doc, theme } })),

      setHidden: (patch) =>
        set((s) => ({ doc: { ...s.doc, hidden: { ...s.doc.hidden, ...patch } } })),

      addPhoto: (fileId, previewUrl) =>
        set((s) => ({
          doc: {
            ...s.doc,
            photos: [...s.doc.photos, { id: newPhotoId(), fileId }],
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removePhoto: (id) =>
        set((s) => ({
          doc: { ...s.doc, photos: s.doc.photos.filter((p) => p.id !== id) },
        })),

      movePhoto: (id, dir) =>
        set((s) => {
          const photos = [...s.doc.photos];
          const i = photos.findIndex((p) => p.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= photos.length) return {};
          const a = photos[i];
          const b = photos[j];
          if (!a || !b) return {};
          photos[i] = b;
          photos[j] = a;
          return { doc: { ...s.doc, photos } };
        }),

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
      name: "kyndl:string-frame-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
