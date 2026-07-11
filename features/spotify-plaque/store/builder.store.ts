import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type HiddenMessage,
  PLAQUE_CONFIG,
  type PlaqueConfig,
  type PlaqueThemeKey,
} from "../config";

/** The single text fields edited directly in the panel (no media, no photos). */
type PlaqueMeta = Pick<
  PlaqueConfig,
  "title" | "caption" | "date" | "songLabel" | "artist"
>;

/** A fresh, unique id for a new photo slide. */
function newPhotoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Math.floor(performance.now() * 1000).toString(36)}`;
}

/** A fresh document, seeded from the sample so the fields aren't blank — but
 *  with no photos or music (those are added by hand). */
export function starterDoc(): PlaqueConfig {
  return {
    title: PLAQUE_CONFIG.title,
    caption: PLAQUE_CONFIG.caption,
    date: PLAQUE_CONFIG.date,
    theme: PLAQUE_CONFIG.theme,
    songLabel: PLAQUE_CONFIG.songLabel,
    artist: PLAQUE_CONFIG.artist,
    photos: [],
    hidden: { heading: PLAQUE_CONFIG.hidden.heading, body: "" },
  };
}

interface BuilderState {
  doc: PlaqueConfig;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: PlaqueConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<PlaqueMeta>) => void;
  setTheme: (theme: PlaqueThemeKey) => void;
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
      name: "kyndl:spotify-plaque-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
