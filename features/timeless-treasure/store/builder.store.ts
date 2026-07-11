import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type Letter,
  type ReelFrame,
  type Tag,
  TIMELESS_TREASURE_CONFIG,
  type TimelessTreasureConfig,
  type TreasureThemeKey,
} from "../config";

/** The plain text fields edited directly in the panel (no media). */
type TreasureMeta = Pick<TimelessTreasureConfig, "recipientName" | "senderName">;

/** A fresh, unique id for a new film frame. */
function newFrameId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f-${Math.floor(performance.now() * 1000).toString(36)}`;
}

/** A fresh document, seeded from the sample so the fields aren't blank — but
 *  with no frames or music (those are added by hand). */
export function starterDoc(): TimelessTreasureConfig {
  return {
    recipientName: TIMELESS_TREASURE_CONFIG.recipientName,
    senderName: TIMELESS_TREASURE_CONFIG.senderName,
    theme: TIMELESS_TREASURE_CONFIG.theme,
    tag: { ...TIMELESS_TREASURE_CONFIG.tag },
    frames: [],
    letter: { heading: TIMELESS_TREASURE_CONFIG.letter.heading, body: "" },
  };
}

interface BuilderState {
  doc: TimelessTreasureConfig;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: TimelessTreasureConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<TreasureMeta>) => void;
  setTheme: (theme: TreasureThemeKey) => void;
  setTag: (patch: Partial<Tag>) => void;
  setLetter: (patch: Partial<Letter>) => void;

  addFrame: (fileId: string, previewUrl: string) => void;
  updateFrame: (id: string, patch: Partial<Pick<ReelFrame, "caption" | "date">>) => void;
  removeFrame: (id: string) => void;
  moveFrame: (id: string, dir: -1 | 1) => void;

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

      setTag: (patch) =>
        set((s) => ({ doc: { ...s.doc, tag: { ...s.doc.tag, ...patch } } })),

      setLetter: (patch) =>
        set((s) => ({ doc: { ...s.doc, letter: { ...s.doc.letter, ...patch } } })),

      addFrame: (fileId, previewUrl) =>
        set((s) => ({
          doc: {
            ...s.doc,
            frames: [
              ...s.doc.frames,
              { id: newFrameId(), fileId, caption: "", date: "" },
            ],
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      updateFrame: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            frames: s.doc.frames.map((f) =>
              f.id === id ? { ...f, ...patch } : f,
            ),
          },
        })),

      removeFrame: (id) =>
        set((s) => ({
          doc: { ...s.doc, frames: s.doc.frames.filter((f) => f.id !== id) },
        })),

      moveFrame: (id, dir) =>
        set((s) => {
          const frames = [...s.doc.frames];
          const i = frames.findIndex((f) => f.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= frames.length) return {};
          const a = frames[i];
          const b = frames[j];
          if (!a || !b) return {};
          frames[i] = b;
          frames[j] = a;
          return { doc: { ...s.doc, frames } };
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
      name: "kyndl:timeless-treasure-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
