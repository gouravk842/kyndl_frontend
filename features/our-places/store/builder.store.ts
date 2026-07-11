import { create } from "zustand";
import { persist } from "zustand/middleware";

import { MAP_CONFIG } from "../config";
import type { OurPlacesDoc, PlaceDoc, TileStyleKey } from "../types";

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `pl-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

/** A fresh, empty document — places are added by hand via the "Add place" form. */
export function starterDoc(): OurPlacesDoc {
  return {
    map: {
      title: MAP_CONFIG.title,
      subtitle: MAP_CONFIG.subtitle,
      centerLat: MAP_CONFIG.centerLat,
      centerLng: MAP_CONFIG.centerLng,
      defaultZoom: MAP_CONFIG.defaultZoom,
      tileStyle: "positron",
    },
    places: [],
  };
}

interface BuilderState {
  doc: OurPlacesDoc;
  /** The place currently being edited (and highlighted on the map). */
  selectedId: string | null;
  /** Presigned photo URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded photos, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: OurPlacesDoc, assets?: Record<string, string>) => void;
  setMap: (patch: Partial<OurPlacesDoc["map"]>) => void;
  setTileStyle: (tileStyle: TileStyleKey) => void;

  /** Add a fully-formed place (from the Add place form); returns its new id. */
  createPlace: (place: Omit<PlaceDoc, "id">) => string;
  updatePlace: (id: string, patch: Partial<PlaceDoc>) => void;
  setPlaceLocation: (id: string, lat: number, lng: number) => void;
  removePlace: (id: string) => void;
  movePlace: (id: string, dir: -1 | 1) => void;
  selectPlace: (id: string | null) => void;

  setPhoto: (id: string, fileId: string, previewUrl: string) => void;
  removePhoto: (id: string) => void;

  /** Photo URL to render for a place (local preview wins, else loaded asset). */
  photoUrl: (place: PlaceDoc) => string | null;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,
      assets: {},
      localPreviews: {},

      loadDoc: (doc, assets = {}) =>
        set({ doc, assets, selectedId: doc.places[0]?.id ?? null }),

      setMap: (patch) =>
        set((s) => ({ doc: { ...s.doc, map: { ...s.doc.map, ...patch } } })),
      setTileStyle: (tileStyle) =>
        set((s) => ({ doc: { ...s.doc, map: { ...s.doc.map, tileStyle } } })),

      createPlace: (place) => {
        const id = newId();
        set((s) => ({
          doc: { ...s.doc, places: [...s.doc.places, { ...place, id }] },
          selectedId: id,
        }));
        return id;
      },

      updatePlace: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            places: s.doc.places.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
          },
        })),

      setPlaceLocation: (id, lat, lng) =>
        set((s) => ({
          doc: {
            ...s.doc,
            places: s.doc.places.map((p) =>
              p.id === id ? { ...p, lat, lng } : p,
            ),
          },
        })),

      removePlace: (id) =>
        set((s) => ({
          doc: { ...s.doc, places: s.doc.places.filter((p) => p.id !== id) },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      movePlace: (id, dir) =>
        set((s) => {
          const places = [...s.doc.places];
          const i = places.findIndex((p) => p.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= places.length) return {};
          const a = places[i];
          const b = places[j];
          if (!a || !b) return {};
          places[i] = b;
          places[j] = a;
          return { doc: { ...s.doc, places } };
        }),

      selectPlace: (id) => set({ selectedId: id }),

      setPhoto: (id, fileId, previewUrl) =>
        set((s) => ({
          doc: {
            ...s.doc,
            places: s.doc.places.map((p) =>
              p.id === id ? { ...p, photo: { fileId } } : p,
            ),
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removePhoto: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            places: s.doc.places.map((p) =>
              p.id === id ? { ...p, photo: undefined } : p,
            ),
          },
        })),

      photoUrl: (place) => {
        if (!place.photo) return null;
        const { localPreviews, assets } = get();
        return localPreviews[place.photo.fileId] ?? assets[place.photo.fileId] ?? null;
      },
    }),
    {
      name: "kyndl:our-places-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
