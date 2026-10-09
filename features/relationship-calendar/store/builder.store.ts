import { create } from "zustand";
import { persist } from "zustand/middleware";

import { starterDoc } from "../config";
import type {
  CalendarEvent,
  RelationshipCalendarDoc,
  WeekStartsOn,
} from "../types";

export type ViewerRole = "owner" | "admin" | "contributor" | null;

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `ev-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

interface BuilderState {
  doc: RelationshipCalendarDoc;
  selectedId: string | null;
  assets: Record<string, string>;
  localPreviews: Record<string, string>;
  viewYear: number;
  viewMonth: number;
  viewerId: string | null;
  viewerRole: ViewerRole;

  loadDoc: (
    doc: RelationshipCalendarDoc,
    assets?: Record<string, string>,
  ) => void;
  setViewer: (viewerId: string | null, viewerRole: ViewerRole) => void;
  canEditEvent: (event: CalendarEvent) => boolean;
  canEditMeta: () => boolean;

  setMeta: (
    patch: Partial<
      Pick<
        RelationshipCalendarDoc,
        "title" | "subtitle" | "partnerNames" | "weekStartsOn" | "togetherSince"
      >
    >,
  ) => void;
  setWeekStartsOn: (weekStartsOn: WeekStartsOn) => void;
  setViewMonth: (year: number, monthIndex: number) => void;

  createEvent: (event: Omit<CalendarEvent, "id" | "authorId">) => string;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  removeEvent: (id: string) => void;
  selectEvent: (id: string | null) => void;

  setPhoto: (id: string, fileId: string, previewUrl: string) => void;
  removePhoto: (id: string) => void;
  photoUrl: (event: CalendarEvent) => string | null;
}

const now = new Date();

function normalizeDoc(doc: RelationshipCalendarDoc): RelationshipCalendarDoc {
  return {
    ...starterDoc(),
    ...doc,
    togetherSince: doc.togetherSince ?? "",
    events: doc.events ?? [],
  };
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,
      assets: {},
      localPreviews: {},
      viewYear: now.getFullYear(),
      viewMonth: now.getMonth(),
      viewerId: null,
      viewerRole: "owner",

      loadDoc: (doc, assets = {}) =>
        set({
          doc: normalizeDoc(doc),
          assets,
          selectedId: doc.events[0]?.id ?? null,
        }),

      setViewer: (viewerId, viewerRole) => set({ viewerId, viewerRole }),

      canEditEvent: (event) => {
        const { viewerRole, viewerId } = get();
        if (viewerRole !== "contributor") return true;
        return Boolean(event.authorId) && event.authorId === viewerId;
      },

      canEditMeta: () => get().viewerRole !== "contributor",

      setMeta: (patch) => {
        if (!get().canEditMeta()) return;
        set((s) => ({ doc: { ...s.doc, ...patch } }));
      },

      setWeekStartsOn: (weekStartsOn) => {
        if (!get().canEditMeta()) return;
        set((s) => ({ doc: { ...s.doc, weekStartsOn } }));
      },

      setViewMonth: (year, monthIndex) =>
        set({ viewYear: year, viewMonth: monthIndex }),

      createEvent: (event) => {
        const id = newId();
        const { viewerRole, viewerId } = get();
        set((s) => ({
          doc: {
            ...s.doc,
            events: [
              ...s.doc.events,
              {
                ...event,
                id,
                ...(viewerRole === "contributor" && viewerId
                  ? { authorId: viewerId }
                  : {}),
              },
            ],
          },
          selectedId: id,
        }));
        return id;
      },

      updateEvent: (id, patch) => {
        const event = get().doc.events.find((e) => e.id === id);
        if (event && !get().canEditEvent(event)) return;
        set((s) => ({
          doc: {
            ...s.doc,
            events: s.doc.events.map((e) =>
              e.id === id ? { ...e, ...patch } : e,
            ),
          },
        }));
      },

      removeEvent: (id) => {
        const event = get().doc.events.find((e) => e.id === id);
        if (event && !get().canEditEvent(event)) return;
        set((s) => ({
          doc: {
            ...s.doc,
            events: s.doc.events.filter((e) => e.id !== id),
          },
          selectedId: s.selectedId === id ? null : s.selectedId,
        }));
      },

      selectEvent: (id) => set({ selectedId: id }),

      setPhoto: (id, fileId, previewUrl) => {
        const event = get().doc.events.find((e) => e.id === id);
        if (event && !get().canEditEvent(event)) return;
        set((s) => ({
          doc: {
            ...s.doc,
            events: s.doc.events.map((e) =>
              e.id === id ? { ...e, photo: { fileId } } : e,
            ),
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        }));
      },

      removePhoto: (id) => {
        const event = get().doc.events.find((e) => e.id === id);
        if (event && !get().canEditEvent(event)) return;
        set((s) => ({
          doc: {
            ...s.doc,
            events: s.doc.events.map((e) =>
              e.id === id ? { ...e, photo: undefined } : e,
            ),
          },
        }));
      },

      photoUrl: (event) => {
        if (!event.photo) return null;
        const { localPreviews, assets } = get();
        return (
          localPreviews[event.photo.fileId] ??
          assets[event.photo.fileId] ??
          null
        );
      },
    }),
    {
      name: "kyndl:relationship-calendar-builder",
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
