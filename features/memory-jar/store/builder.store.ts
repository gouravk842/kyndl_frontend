import { create } from "zustand";
import { persist } from "zustand/middleware";

import { JAR_CONFIG, type JarConfig, type JarNote } from "../config";

/** Per-note paper warmths, offered as swatches in the note form so a freshly
 *  built jar still reads as hand-placed rather than uniform. */
export const PAPER_TONES = [
  "#fdf8f0",
  "#fef9ec",
  "#fdfaf5",
  "#fef8ee",
  "#fdf7eb",
  "#fefaf3",
  "#fdf9ef",
  "#fef9ed",
];

/** A gentle, deterministic tilt for a note, seeded by its id so the layout is
 *  stable across renders (the experience's scatter relies on `rotation`). */
function tiltFor(id: number): number {
  // Spread across [-13, 13] without ever sitting perfectly upright.
  const steps = [-12, 7, -4, 15, -9, 4, 11, -6];
  return steps[id % steps.length]!;
}

/** Sensible art-direction defaults for a brand-new note, seeded by the next id
 *  so successive notes don't all look identical. */
export function noteDefaults(nextId: number): Pick<JarNote, "rotation" | "paperTone"> {
  return {
    rotation: tiltFor(nextId),
    paperTone: PAPER_TONES[nextId % PAPER_TONES.length]!,
  };
}

/** A fresh document — the jar starts empty; notes are added by hand via the
 *  note form. The jar meta is seeded from the sample so the fields aren't blank. */
export function starterDoc(): JarConfig {
  return {
    recipientName: JAR_CONFIG.recipientName,
    jarLabel: JAR_CONFIG.jarLabel,
    openingMessage: JAR_CONFIG.openingMessage,
    closingMessage: JAR_CONFIG.closingMessage,
    notes: [],
  };
}

/** Notes carry numeric ids (the experience's scatter math uses `id % n`); the
 *  next id is one past the current max so removals never collide. */
export function nextNoteId(notes: JarNote[]): number {
  return notes.reduce((max, n) => Math.max(max, n.id), 0) + 1;
}

type JarMeta = Pick<
  JarConfig,
  "recipientName" | "jarLabel" | "openingMessage" | "closingMessage"
>;

/** A note's editable payload (everything but its id). */
export type NoteInput = Omit<JarNote, "id">;

interface BuilderState {
  doc: JarConfig;
  /** The note currently being edited. */
  selectedId: number | null;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;

  loadDoc: (doc: JarConfig, assets?: Record<string, string>) => void;
  setMeta: (patch: Partial<JarMeta>) => void;

  /** Add a fully-formed note (from the note form); returns its new id. */
  addNote: (note: NoteInput) => number;
  updateNote: (id: number, patch: Partial<NoteInput>) => void;
  removeNote: (id: number) => void;
  moveNote: (id: number, dir: -1 | 1) => void;
  selectNote: (id: number | null) => void;

  setNoteImage: (id: number, fileId: string, previewUrl: string) => void;
  removeNoteImage: (id: number) => void;

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
            notes: s.doc.notes.map((n) =>
              n.id === id ? { ...n, ...patch } : n,
            ),
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

      setNoteImage: (id, fileId, previewUrl) =>
        set((s) => ({
          doc: {
            ...s.doc,
            notes: s.doc.notes.map((n) =>
              n.id === id ? { ...n, image: { fileId } } : n,
            ),
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removeNoteImage: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            notes: s.doc.notes.map((n) =>
              n.id === id ? { ...n, image: undefined } : n,
            ),
          },
        })),

      setMusic: (fileId, previewUrl) =>
        set((s) => ({
          doc: { ...s.doc, music: { fileId } },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      removeMusic: () =>
        set((s) => ({ doc: { ...s.doc, music: undefined } })),

      urlFor: (ref) => {
        if (!ref) return null;
        const { localPreviews, assets } = get();
        return localPreviews[ref.fileId] ?? assets[ref.fileId] ?? null;
      },

      reset: () => set({ doc: starterDoc(), selectedId: null }),
    }),
    {
      name: "kyndl:memory-jar-builder",
      // Persist only the document; presigned/object URLs are session-bound.
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
