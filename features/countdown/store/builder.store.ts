import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  COUNTDOWN_CONFIG,
  type CountdownConfig,
  type CountdownNote,
  type CountdownReveal,
  type CountdownThemeKey,
} from "../config";

/** Everything but the clock's notes — the single fields edited in the panel. */
type CountdownMeta = Pick<
  CountdownConfig,
  | "recipientName"
  | "title"
  | "occasion"
  | "targetDate"
  | "theme"
  | "anticipationMessage"
>;

/** A note's editable payload (everything but its id). */
export type NoteInput = Omit<CountdownNote, "id">;

/** A fresh document, seeded from the sample so the fields aren't blank — but
 *  with no notes (they're added by hand) and a target a little way out so the
 *  preview clock has something to count. */
export function starterDoc(): CountdownConfig {
  return {
    recipientName: COUNTDOWN_CONFIG.recipientName,
    title: COUNTDOWN_CONFIG.title,
    occasion: COUNTDOWN_CONFIG.occasion,
    targetDate: COUNTDOWN_CONFIG.targetDate,
    theme: COUNTDOWN_CONFIG.theme,
    anticipationMessage: COUNTDOWN_CONFIG.anticipationMessage,
    reveal: { headline: COUNTDOWN_CONFIG.reveal.headline, message: "" },
    notes: [],
  };
}

/** The next id is one past the current max so removals never collide. */
export function nextNoteId(notes: CountdownNote[]): number {
  return notes.reduce((max, n) => Math.max(max, n.id), 0) + 1;
}

interface BuilderState {
  doc: CountdownConfig;
  /** The note currently being edited, if any. */
  selectedId: number | null;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: CountdownConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<CountdownMeta>) => void;
  setReveal: (patch: Partial<Pick<CountdownReveal, "headline" | "message">>) => void;
  setTheme: (theme: CountdownThemeKey) => void;

  addNote: (note: NoteInput) => number;
  updateNote: (id: number, patch: Partial<NoteInput>) => void;
  removeNote: (id: number) => void;
  moveNote: (id: number, dir: -1 | 1) => void;
  selectNote: (id: number | null) => void;

  setRevealImage: (fileId: string, previewUrl: string) => void;
  removeRevealImage: () => void;

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
      selectedId: null,
      assets: {},
      localPreviews: {},

      loadDoc: (doc, assets = {}) =>
        set({ doc, assets, selectedId: doc.notes[0]?.id ?? null }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      setReveal: (patch) =>
        set((s) => ({ doc: { ...s.doc, reveal: { ...s.doc.reveal, ...patch } } })),

      setTheme: (theme) => set((s) => ({ doc: { ...s.doc, theme } })),

      addNote: (note) => {
        const id = nextNoteId(get().doc.notes);
        set((s) => ({
          doc: { ...s.doc, notes: [...s.doc.notes, { ...note, id }] },
          selectedId: id,
        }));
        return id;
      },

      updateNote: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            notes: s.doc.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
          },
        })),

      removeNote: (id) =>
        set((s) => ({
          doc: { ...s.doc, notes: s.doc.notes.filter((n) => n.id !== id) },
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      moveNote: (id, dir) =>
        set((s) => {
          const notes = [...s.doc.notes];
          const i = notes.findIndex((n) => n.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= notes.length) return {};
          const a = notes[i];
          const b = notes[j];
          if (!a || !b) return {};
          notes[i] = b;
          notes[j] = a;
          return { doc: { ...s.doc, notes } };
        }),

      selectNote: (id) => set({ selectedId: id }),

      setRevealImage: (fileId, previewUrl) =>
        set((s) => ({
          doc: { ...s.doc, reveal: { ...s.doc.reveal, image: { fileId } } },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removeRevealImage: () =>
        set((s) => ({
          doc: { ...s.doc, reveal: { ...s.doc.reveal, image: undefined } },
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

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:countdown-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
