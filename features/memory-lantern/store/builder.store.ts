import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_MATERIAL,
  DEFAULT_MOTION,
  type LanternAmbience,
  type LanternConfig,
  type LanternFinale,
  type LanternMaterial,
  type LanternMotion,
  type Pane,
  SAMPLE_LANTERN,
} from "../config";

/** The plain text fields edited directly in the panel (no media). */
type LanternMeta = Pick<
  LanternConfig,
  "recipientName" | "title" | "subtitle"
>;

/** A fresh, unique id for a new facet. */
function newPaneId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pane-${Math.floor(performance.now() * 1000).toString(36)}`;
}

/** A fresh document — seeded titles from the sample, but no facets (added by hand). */
export function starterDoc(): LanternConfig {
  return {
    id: "my-lantern",
    recipientName: "",
    title: SAMPLE_LANTERN.title,
    subtitle: SAMPLE_LANTERN.subtitle,
    panes: [],
    material: { ...DEFAULT_MATERIAL },
    motion: { ...DEFAULT_MOTION },
    ambience: { timeOfDayAware: true },
    finale: { heading: "", body: "" },
  };
}

interface BuilderState {
  doc: LanternConfig;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: LanternConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<LanternMeta>) => void;
  setMaterial: (patch: Partial<LanternMaterial>) => void;
  setMotion: (patch: Partial<LanternMotion>) => void;
  setAmbience: (patch: Partial<LanternAmbience>) => void;
  setFinale: (patch: Partial<LanternFinale>) => void;

  /** Add a facet from an uploaded photo (glow sampled from the image). */
  addPane: (fileId: string, previewUrl: string, glowColor: string) => void;
  updatePane: (id: string, patch: Partial<Pane>) => void;
  removePane: (id: string) => void;
  movePane: (id: string, dir: -1 | 1) => void;

  /** Resolve a facet's fileId to a renderable URL (local preview wins). */
  urlFor: (fileId: string | null) => string | null;
  /** The full fileId→URL map handed to the live preview. */
  mediaUrls: () => Record<string, string>;

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

      setMaterial: (patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            material: { ...(s.doc.material ?? DEFAULT_MATERIAL), ...patch },
          },
        })),

      setMotion: (patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            motion: { ...(s.doc.motion ?? DEFAULT_MOTION), ...patch },
          },
        })),

      setAmbience: (patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            ambience: { ...(s.doc.ambience ?? { timeOfDayAware: true }), ...patch },
          },
        })),

      setFinale: (patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            finale: { ...(s.doc.finale ?? { heading: "", body: "" }), ...patch },
          },
        })),

      addPane: (fileId, previewUrl, glowColor) =>
        set((s) => ({
          doc: {
            ...s.doc,
            panes: [
              ...s.doc.panes,
              { id: newPaneId(), fileId, caption: "", date: "", glowColor },
            ],
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      updatePane: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            panes: s.doc.panes.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          },
        })),

      removePane: (id) =>
        set((s) => ({
          doc: { ...s.doc, panes: s.doc.panes.filter((p) => p.id !== id) },
        })),

      movePane: (id, dir) =>
        set((s) => {
          const panes = [...s.doc.panes];
          const i = panes.findIndex((p) => p.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= panes.length) return {};
          const a = panes[i];
          const b = panes[j];
          if (!a || !b) return {};
          panes[i] = b;
          panes[j] = a;
          return { doc: { ...s.doc, panes } };
        }),

      urlFor: (fileId) => {
        if (!fileId) return null;
        const { localPreviews, assets } = get();
        return localPreviews[fileId] ?? assets[fileId] ?? null;
      },

      mediaUrls: () => {
        const { assets, localPreviews } = get();
        return { ...assets, ...localPreviews };
      },

      reset: () => set({ doc: starterDoc() }),
    }),
    {
      name: "kyndl:memory-lantern-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
