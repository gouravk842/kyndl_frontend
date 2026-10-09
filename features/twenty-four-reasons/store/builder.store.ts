import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  blankContent,
  girlfriendDayAnchorAt,
  type MediaRef,
  type Reason,
  STARTER_MESSAGES,
  type TwentyFourReasonsContent,
} from "../config";
import { applySchedule, reasonsFromMessages } from "../lib/schedule";

/** Stable id for a new reason (SSR-safe; uniqueness within the list is enough). */
function mintId(existing: Reason[]): string {
  const max = existing.reduce((m, r) => {
    const n = Number(r.id.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `r${max + 1}`;
}

export function starterDoc(): TwentyFourReasonsContent {
  return blankContent();
}

type DocMeta = Pick<
  TwentyFourReasonsContent,
  | "recipientName"
  | "ownerName"
  | "title"
  | "intro"
  | "occasion"
  | "timezoneLabel"
>;

type SchedulePatch = {
  anchorAt?: string;
  intervalHours?: number;
};

interface BuilderState {
  doc: TwentyFourReasonsContent;
  selectedId: string | null;
  /** Presigned media URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded media, so they preview before a reload. */
  localPreviews: Record<string, string>;
  /** Scrubber offset added to Date.now() for builder preview. */
  previewOffsetMs: number;

  loadDoc: (
    doc: TwentyFourReasonsContent,
    assets?: Record<string, string>,
  ) => void;
  setMeta: (patch: Partial<DocMeta>) => void;
  setSchedule: (patch: SchedulePatch) => void;
  applyScheduleNow: () => void;
  /** Toggle Girlfriend Day packaging; when enabling, snap anchor to Aug 1 local midnight. */
  setGirlfriendDay: (enabled: boolean) => void;
  loadStarterPack: () => void;

  addReason: () => string | null;
  updateReason: (id: string, patch: Partial<Omit<Reason, "id">>) => void;
  removeReason: (id: string) => void;
  moveReason: (id: string, dir: -1 | 1) => void;
  selectReason: (id: string | null) => void;

  setReasonImage: (id: string, fileId: string, previewUrl: string) => void;
  clearReasonImage: (id: string) => void;
  setReasonAudio: (id: string, fileId: string, previewUrl: string) => void;
  clearReasonAudio: (id: string) => void;

  urlFor: (ref: MediaRef | null | undefined) => string | null;

  setPreviewOffsetMs: (ms: number) => void;
  previewNow: () => number;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: starterDoc(),
      selectedId: null,
      assets: {},
      localPreviews: {},
      previewOffsetMs: 0,

      loadDoc: (doc, assets = {}) =>
        set({
          doc,
          assets,
          selectedId: doc.reasons[0]?.id ?? null,
          previewOffsetMs: 0,
        }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      setSchedule: (patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            ...(patch.anchorAt !== undefined
              ? { anchorAt: patch.anchorAt }
              : {}),
            ...(patch.intervalHours !== undefined
              ? { intervalHours: patch.intervalHours }
              : {}),
          },
        })),

      applyScheduleNow: () => set((s) => ({ doc: applySchedule(s.doc) })),

      setGirlfriendDay: (enabled) =>
        set((s) => {
          if (!enabled) {
            return { doc: { ...s.doc, occasion: "none" } };
          }
          const anchorAt = girlfriendDayAnchorAt();
          const next = applySchedule({
            ...s.doc,
            occasion: "girlfriend-day",
            anchorAt,
          });
          return { doc: next };
        }),

      loadStarterPack: () =>
        set((s) => {
          const enablingGf = s.doc.occasion === "none";
          const occasion = enablingGf ? "girlfriend-day" : s.doc.occasion;
          const anchorAt = enablingGf
            ? girlfriendDayAnchorAt()
            : s.doc.anchorAt;
          const base = { ...s.doc, occasion, anchorAt };
          const reasons = reasonsFromMessages(STARTER_MESSAGES, base);
          return {
            doc: { ...base, reasons },
            selectedId: reasons[0]?.id ?? null,
          };
        }),

      addReason: () => {
        const { doc } = get();
        if (doc.reasons.length >= 24) return null;
        const id = mintId(doc.reasons);
        const reason: Reason = {
          id,
          n: doc.reasons.length + 1,
          label: "",
          message: "New reason",
          image: null,
          audio: null,
          unlockAt: doc.anchorAt,
          teaser: "",
        };
        set((s) => ({
          doc: applySchedule({
            ...s.doc,
            reasons: [...s.doc.reasons, reason],
          }),
          selectedId: id,
        }));
        return id;
      },

      updateReason: (id, patch) =>
        set((s) => ({
          doc: {
            ...s.doc,
            reasons: s.doc.reasons.map((r) =>
              r.id === id ? { ...r, ...patch } : r,
            ),
          },
        })),

      removeReason: (id) =>
        set((s) => {
          const reasons = s.doc.reasons.filter((r) => r.id !== id);
          return {
            doc: applySchedule({ ...s.doc, reasons }),
            selectedId: s.selectedId === id ? null : s.selectedId,
          };
        }),

      moveReason: (id, dir) =>
        set((s) => {
          const reasons = [...s.doc.reasons];
          const i = reasons.findIndex((r) => r.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= reasons.length) return {};
          const a = reasons[i];
          const b = reasons[j];
          if (!a || !b) return {};
          reasons[i] = b;
          reasons[j] = a;
          return { doc: applySchedule({ ...s.doc, reasons }) };
        }),

      selectReason: (id) => set({ selectedId: id }),

      setReasonImage: (id, fileId, previewUrl) =>
        set((s) => ({
          doc: {
            ...s.doc,
            reasons: s.doc.reasons.map((r) =>
              r.id === id ? { ...r, image: { fileId } } : r,
            ),
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      clearReasonImage: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            reasons: s.doc.reasons.map((r) =>
              r.id === id ? { ...r, image: null } : r,
            ),
          },
        })),

      setReasonAudio: (id, fileId, previewUrl) =>
        set((s) => ({
          doc: {
            ...s.doc,
            reasons: s.doc.reasons.map((r) =>
              r.id === id ? { ...r, audio: { fileId } } : r,
            ),
          },
          localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
        })),

      clearReasonAudio: (id) =>
        set((s) => ({
          doc: {
            ...s.doc,
            reasons: s.doc.reasons.map((r) =>
              r.id === id ? { ...r, audio: null } : r,
            ),
          },
        })),

      urlFor: (ref) => {
        if (!ref) return null;
        const { localPreviews, assets } = get();
        return localPreviews[ref.fileId] ?? assets[ref.fileId] ?? null;
      },

      setPreviewOffsetMs: (ms) => set({ previewOffsetMs: ms }),

      previewNow: () => Date.now() + get().previewOffsetMs,

      reset: () =>
        set({
          doc: starterDoc(),
          selectedId: null,
          assets: {},
          localPreviews: {},
          previewOffsetMs: 0,
        }),
    }),
    {
      name: "kyndl:twenty-four-reasons-builder",
      partialize: (s) => ({
        doc: s.doc,
        previewOffsetMs: s.previewOffsetMs,
      }),
    },
  ),
);
