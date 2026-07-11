import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SKY_CONFIG, type SkyConfig, type Star, type StarSize } from "../config";

/** A fresh sky seeded from the sample, so a new builder isn't an empty void. */
export function starterDoc(): SkyConfig {
  return {
    ...SKY_CONFIG,
    stars: SKY_CONFIG.stars.map((s) => ({ ...s })),
    // A unique id so each saved sky replays its own first-view ceremony.
    id: "my-sky",
    // Drop the sample's hand-authored shape — edges fall back to the
    // sequential 1→2→3 path, which always matches the current star set.
    customEdges: undefined,
  };
}

/** Next star id — one past the current max so removals never collide. */
function nextStarId(stars: Star[]): number {
  return stars.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}

/** A new star dropped near the centre of the sky for the user to drag/position. */
function blankStar(id: number): Star {
  return {
    id,
    x: 50,
    y: 35,
    size: "medium",
    label: "a new memory",
    date: "",
    memory: "Write the moment this star holds…",
    imageUrl: null,
  };
}

type SkyMeta = Pick<
  SkyConfig,
  "recipientName" | "constellationName" | "subtitle" | "allStarsOpenedMessage"
>;

interface BuilderState {
  doc: SkyConfig;
  /** The star currently being edited. */
  selectedId: number | null;
  /** Presigned photo URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object-URL previews for photos uploaded this session, before the backend
   * resolves them — keyed by fileId, so the preview shows immediately. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: SkyConfig, assets?: Record<string, string>) => void;
  /** Remember a freshly-uploaded photo's local preview URL by its fileId. */
  registerPreview: (fileId: string, previewUrl: string) => void;
  setMeta: (patch: Partial<SkyMeta>) => void;
  setFinale: (patch: Partial<SkyConfig["finale"]>) => void;

  /** Append a star (optionally seeded with data) and return its new id. */
  addStar: (data?: Partial<Omit<Star, "id">>) => number;
  updateStar: (id: number, patch: Partial<Omit<Star, "id">>) => void;
  setStarPosition: (id: number, x: number, y: number) => void;
  removeStar: (id: number) => void;
  selectStar: (id: number | null) => void;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,
      assets: {},
      localPreviews: {},

      loadDoc: (doc, assets = {}) =>
        set({ doc, assets, selectedId: doc.stars[0]?.id ?? null }),

      registerPreview: (fileId, previewUrl) =>
        set((s) => ({
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      setFinale: (patch) =>
        set((s) => ({ doc: { ...s.doc, finale: { ...s.doc.finale, ...patch } } })),

      addStar: (data) => {
        const id = nextStarId(get().doc.stars);
        const star = { ...blankStar(id), ...data };
        set((s) => ({
          doc: { ...s.doc, stars: [...s.doc.stars, star] },
          selectedId: id,
        }));
        return id;
      },

      updateStar: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            stars: s.doc.stars.map((st) =>
              st.id === id ? { ...st, ...patch } : st,
            ),
          },
        })),

      setStarPosition: (id, x, y) =>
        set((s) => ({
          doc: {
            ...s.doc,
            stars: s.doc.stars.map((st) =>
              st.id === id ? { ...st, x, y } : st,
            ),
          },
        })),

      removeStar: (id) =>
        set((s) => ({
          // Drop any custom edges that referenced the removed star so the shape
          // never points at a star that no longer exists — and scrub it from any
          // other star's `requires` trail so nothing waits on a vanished star.
          doc: {
            ...s.doc,
            stars: s.doc.stars
              .filter((st) => st.id !== id)
              .map((st) =>
                st.requires?.includes(id)
                  ? { ...st, requires: st.requires.filter((r) => r !== id) }
                  : st,
              ),
            customEdges: s.doc.customEdges?.filter(
              ([a, b]) => a !== id && b !== id,
            ),
          },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      selectStar: (id) => set({ selectedId: id }),

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:constellation-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);

export const STAR_SIZES: { value: StarSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Anchor" },
];
