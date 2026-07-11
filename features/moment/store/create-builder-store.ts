import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  MomentBeat,
  MomentCelebration,
  MomentDoc,
  MomentPlan,
  MomentQuestion,
} from "../types";

/**
 * Factory for a Moment builder store. The two Moment flavours (proposal,
 * date-ask) share one engine and one document shape, so they share this logic —
 * but each gets its own instance with its own localStorage key and starter, so
 * a draft of one never clobbers the other.
 */

type BeatPatch = Partial<Omit<MomentBeat, "id" | "kind">>;

export interface MomentBuilderState {
  doc: MomentDoc;
  /** The approach beat currently being edited. */
  selectedBeatId: string | null;

  loadDoc: (doc: MomentDoc) => void;
  setTheme: (theme: MomentDoc["theme"]) => void;
  setSealLabel: (label: string) => void;
  setQuestion: (patch: Partial<MomentQuestion>) => void;
  setCelebration: (patch: Partial<MomentCelebration>) => void;
  setPlan: (patch: Partial<MomentPlan>) => void;

  addBeat: (kind: MomentBeat["kind"]) => void;
  updateBeat: (id: string, patch: BeatPatch) => void;
  removeBeat: (id: string) => void;
  moveBeat: (id: string, dir: -1 | 1) => void;
  selectBeat: (id: string | null) => void;

  reset: () => void;
}

function newId(): string {
  // Browser-only store; crypto.randomUUID keeps beat ids stable and collision-free.
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `b${Date.now()}`;
}

function blankBeat(kind: MomentBeat["kind"]): MomentBeat {
  const id = newId();
  if (kind === "line") return { id, kind, text: "Say something here…" };
  if (kind === "photo") return { id, kind, fileId: "", caption: "" };
  return { id, kind, label: "days since…", sinceDate: "2024-01-01" };
}

export function createMomentBuilder(
  persistName: string,
  starter: () => MomentDoc,
) {
  return create<MomentBuilderState>()(
    persist(
      (set) => ({
        doc: starter(),
        selectedBeatId: null,

        loadDoc: (doc) =>
          set({ doc, selectedBeatId: doc.approach[0]?.id ?? null }),

        setTheme: (theme) => set((s) => ({ doc: { ...s.doc, theme } })),
        setSealLabel: (sealLabel) => set((s) => ({ doc: { ...s.doc, sealLabel } })),

        setQuestion: (patch) =>
          set((s) => ({ doc: { ...s.doc, question: { ...s.doc.question, ...patch } } })),
        setCelebration: (patch) =>
          set((s) => ({
            doc: { ...s.doc, celebration: { ...s.doc.celebration, ...patch } },
          })),
        setPlan: (patch) =>
          set((s) => ({ doc: { ...s.doc, plan: { ...(s.doc.plan ?? {}), ...patch } } })),

        addBeat: (kind) =>
          set((s) => {
            const beat = blankBeat(kind);
            return {
              doc: { ...s.doc, approach: [...s.doc.approach, beat] },
              selectedBeatId: beat.id,
            };
          }),

        updateBeat: (id, patch) =>
          set((s) => ({
            doc: {
              ...s.doc,
              approach: s.doc.approach.map((b) =>
                b.id === id ? ({ ...b, ...patch } as MomentBeat) : b,
              ),
            },
          })),

        removeBeat: (id) =>
          set((s) => ({
            doc: {
              ...s.doc,
              approach: s.doc.approach.filter((b) => b.id !== id),
            },
            selectedBeatId: s.selectedBeatId === id ? null : s.selectedBeatId,
          })),

        moveBeat: (id, dir) =>
          set((s) => {
            const beats = [...s.doc.approach];
            const i = beats.findIndex((b) => b.id === id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= beats.length) return s;
            [beats[i], beats[j]] = [beats[j]!, beats[i]!];
            return { doc: { ...s.doc, approach: beats } };
          }),

        selectBeat: (id) => set({ selectedBeatId: id }),

        reset: () => set({ doc: starter(), selectedBeatId: null }),
      }),
      {
        name: persistName,
        partialize: (s) => ({ doc: s.doc }),
      },
    ),
  );
}

export type MomentBuilderStore = ReturnType<typeof createMomentBuilder>;
