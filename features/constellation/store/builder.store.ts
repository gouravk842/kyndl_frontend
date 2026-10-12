import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fileService } from "@/services/files/file.service";

import {
  type GroundKind,
  type GroupGrain,
  PLACEHOLDER_STAR_LABEL,
  PLACEHOLDER_STAR_MEMORY,
  SKY_CONFIG,
  type SkyConfig,
  type SkyOrganization,
  type Star,
  type StarSize,
} from "../config";
import { completeSky } from "../lib/complete-sky";
import { looseArrange, nearestStar, placeInGap } from "../lib/field";
import { applyMood, MOONLIT, type SkyMood } from "../lib/moods";
import { edgesOf } from "../lib/sky";

function currentEdges(doc: SkyConfig): [number, number][] {
  if (doc.customEdges) return doc.customEdges;
  return edgesOf(doc);
}

/** A new sky: one placeholder star, the author's words still to be written. */
export function starterDoc(): SkyConfig {
  const {
    stars: _stars,
    wish: _wish,
    customEdges: _edges,
    ...art
  } = SKY_CONFIG;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sky-${Date.now()}`;
  return applyMood(
    {
      ...art,
      id,
      recipientName: "",
      constellationName: "",
      subtitle: "tap a star to open a memory",
      allStarsOpenedMessage: "",
      organization: "constellations",
      groupBy: "month",
      stars: [blankStar(1, { x: 40, y: 32 })],
      wish: undefined,
    },
    MOONLIT,
  );
}

/** Next star id — one past the current max so removals never collide. */
function nextStarId(stars: Star[]): number {
  return stars.reduce((max, s) => Math.max(max, s.id), 0) + 1;
}

/** A new star — slot is a hint; `addStar` immediately reblooms the whole sky. */
function blankStar(id: number, slot: { x: number; y: number }): Star {
  return {
    id,
    x: slot.x,
    y: slot.y,
    size: "medium",
    label: PLACEHOLDER_STAR_LABEL,
    date: "",
    memory: PLACEHOLDER_STAR_MEMORY,
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
  /**
   * True once the sky was loaded from the server (`?id=`). Stops a late
   * localStorage rehydrate from wiping those stars with a stale draft.
   */
  cloudLoaded: boolean;

  loadDoc: (doc: SkyConfig, assets?: Record<string, string>) => void;
  /** Remember a freshly-uploaded photo's local preview URL by its fileId. */
  registerPreview: (fileId: string, previewUrl: string) => void;
  setMeta: (patch: Partial<SkyMeta>) => void;
  setOrganization: (organization: SkyOrganization) => void;
  setGroupBy: (groupBy: GroupGrain) => void;
  setFinale: (patch: Partial<SkyConfig["finale"]>) => void;
  setMood: (mood: SkyMood) => void;
  setGround: (ground: GroundKind) => void;
  setSong: (song: { fileId: string } | null) => void;
  setWish: (message: string) => void;
  /** Replace every line that touches this star. Other lines stay. */
  setStarLinks: (id: number, linkedIds: number[]) => void;

  /** Append a star (optionally seeded with data) and return its new id.
   * Reblooms the whole sky so the asterism stays balanced as memories grow. */
  addStar: (data?: Partial<Omit<Star, "id">>) => number;
  updateStar: (id: number, patch: Partial<Omit<Star, "id">>) => void;
  setStarPosition: (id: number, x: number, y: number) => void;
  removeStar: (id: number) => void;
  /** Re-run Celestial Bloom on the current star set (positions + edges). */
  rearrangeSky: () => void;
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
      cloudLoaded: false,

      loadDoc: (doc, assets = {}) =>
        set((s) => {
          // A converted sky stores the memories and may omit the art the
          // panel reads (finale, tour, sound, scene). Fill only what's missing.
          // Preserve selection across asset-URL refreshes (same doc, new URLs).
          const next = completeSky(doc);
          const keepSelected =
            s.selectedId && next.stars.some((st) => st.id === s.selectedId)
              ? s.selectedId
              : (next.stars[0]?.id ?? null);
          return {
            doc: next,
            assets,
            selectedId: keepSelected,
            cloudLoaded: true,
          };
        }),

      registerPreview: (fileId, previewUrl) =>
        set((s) => ({
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      setOrganization: (organization) =>
        set((s) => ({
          doc: { ...s.doc, organization, groupBy: s.doc.groupBy ?? "month" },
        })),

      setGroupBy: (groupBy) => set((s) => ({ doc: { ...s.doc, groupBy } })),

      setFinale: (patch) =>
        set((s) => ({
          doc: { ...s.doc, finale: { ...s.doc.finale, ...patch } },
        })),

      setMood: (mood) => set((s) => ({ doc: applyMood(s.doc, mood) })),

      setGround: (ground) =>
        set((s) => ({ doc: { ...s.doc, scene: { ...s.doc.scene, ground } } })),

      setSong: (song) =>
        set((s) => {
          const prev = s.doc.sound.song?.fileId;
          const next = song?.fileId;
          if (prev && prev !== next) fileService.release(prev);
          return { doc: { ...s.doc, sound: { ...s.doc.sound, song } } };
        }),

      setWish: (message) =>
        set((s) => ({
          doc: {
            ...s.doc,
            wish: message.trim() ? { message } : undefined,
          },
        })),

      addStar: (data) => {
        const existing = get().doc.stars;
        const id = nextStarId(existing);
        const slot = placeInGap(existing);
        const star = { ...blankStar(id, slot), ...data, id };
        const near = nearestStar(existing, { x: star.x, y: star.y });
        set((s) => {
          const edges = currentEdges(s.doc);
          return {
            doc: {
              ...s.doc,
              stars: [...s.doc.stars, star],
              customEdges: near ? [...edges, [near.id, id]] : edges,
            },
            selectedId: id,
          };
        });
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

      setStarLinks: (id, linkedIds) =>
        set((s) => {
          const edges = currentEdges(s.doc).filter(
            ([a, b]) => a !== id && b !== id,
          );
          for (const other of linkedIds) {
            if (other !== id) edges.push([id, other]);
          }
          return { doc: { ...s.doc, customEdges: edges } };
        }),

      setStarPosition: (id, x, y) =>
        set((s) => ({
          doc: {
            ...s.doc,
            stars: s.doc.stars.map((st) =>
              st.id === id
                ? {
                    ...st,
                    // Backend rejects positions outside 0–100; keep drags saveable.
                    x: Math.min(100, Math.max(0, x)),
                    y: Math.min(100, Math.max(0, y)),
                  }
                : st,
            ),
          },
        })),

      removeStar: (id) =>
        set((s) => {
          const doomed = s.doc.stars.find((st) => st.id === id);
          fileService.release(doomed?.image?.fileId);
          const stars = s.doc.stars
            .filter((st) => st.id !== id)
            .map((st) =>
              st.requires?.includes(id)
                ? { ...st, requires: st.requires.filter((r) => r !== id) }
                : st,
            );
          return {
            doc: {
              ...s.doc,
              stars,
              customEdges: currentEdges(s.doc).filter(
                ([a, b]) => a !== id && b !== id,
              ),
            },
            selectedId: s.selectedId === id ? null : s.selectedId,
          };
        }),

      rearrangeSky: () =>
        set((s) => {
          const edges = currentEdges(s.doc);
          return {
            doc: {
              ...s.doc,
              stars: looseArrange(s.doc.stars, edges),
              customEdges: edges,
            },
          };
        }),

      selectStar: (id) => set({ selectedId: id }),

      reset: () =>
        set({
          doc: starterDoc(),
          selectedId: null,
          cloudLoaded: false,
          assets: {},
          localPreviews: {},
        }),
    }),
    {
      name: "kyndl:constellation-builder",
      partialize: (s) => ({ doc: s.doc }),
      merge: (persisted, current) => {
        // A server load won the race — keep it. Otherwise a stale draft from
        // localStorage would replace the stars that just arrived from `?id=`.
        if (current.cloudLoaded) return current;
        const saved = (persisted ?? {}) as Partial<BuilderState>;
        return {
          ...current,
          ...saved,
          doc: saved.doc ? completeSky(saved.doc) : current.doc,
          cloudLoaded: false,
        };
      },
    },
  ),
);

export const STAR_SIZES: { value: StarSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Anchor" },
];
