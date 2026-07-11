import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  cloneActivities,
  LUDO_CONFIG,
  type LudoConfig,
  type LudoPlayerConfig,
  SEATS_FOR,
} from "../config";
import type {
  ActivityIntensity,
  ActivityTrigger,
  SeatColorKey,
} from "../types";

/** A seat-agnostic player slot, remembered across player-count changes. */
type Draft = Pick<LudoPlayerConfig, "name" | "color" | "isBot">;

/** Four slots so growing/shrinking the roster never loses a name. */
const DEFAULT_DRAFTS: Draft[] = [
  { name: "You", color: "rose", isBot: false },
  { name: "Partner", color: "teal", isBot: false },
  { name: "Player 3", color: "amber", isBot: true },
  { name: "Player 4", color: "plum", isBot: true },
];

/** Materialise the active players from the drafts + count, seating them. */
function seatPlayers(drafts: Draft[], count: number): LudoPlayerConfig[] {
  const seats = SEATS_FOR[count] ?? SEATS_FOR[2]!;
  return seats.map((seat, i) => ({ seat, ...drafts[i]! }));
}

/** Rebuild drafts from a loaded doc, padding to four slots. */
function draftsFromDoc(doc: LudoConfig): Draft[] {
  const drafts = DEFAULT_DRAFTS.map((d) => ({ ...d }));
  doc.players.forEach((p, i) => {
    if (i < drafts.length) {
      drafts[i] = { name: p.name, color: p.color, isBot: p.isBot };
    }
  });
  return drafts;
}

/** A fresh document, seeded from the sample. */
export function starterDoc(): LudoConfig {
  return { ...LUDO_CONFIG, activities: cloneActivities(LUDO_CONFIG.activities) };
}

interface BuilderState {
  doc: LudoConfig;
  /** Seat-agnostic roster (length 4) backing the active players. */
  drafts: Draft[];

  loadDoc: (doc: LudoConfig) => void;
  setMeta: (patch: Partial<Pick<LudoConfig, "title" | "intro">>) => void;

  setCount: (count: number) => void;
  updatePlayer: (index: number, patch: Partial<Draft>) => void;
  setPlayerColor: (index: number, color: SeatColorKey) => void;

  setActivitiesEnabled: (enabled: boolean) => void;
  setIntensity: (intensity: ActivityIntensity | "mixed") => void;
  toggleTrigger: (trigger: ActivityTrigger) => void;
  setDeck: (key: ActivityIntensity, lines: string[]) => void;

  reset: () => void;
}

/** Recompute `doc.players` after a roster or count change. */
function withPlayers(doc: LudoConfig, drafts: Draft[]): LudoConfig {
  return { ...doc, players: seatPlayers(drafts, doc.players.length) };
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      doc: starterDoc(),
      drafts: DEFAULT_DRAFTS.map((d) => ({ ...d })),

      loadDoc: (doc) =>
        set({
          doc: { ...doc, activities: cloneActivities(doc.activities) },
          drafts: draftsFromDoc(doc),
        }),

      setMeta: (patch) => set((s) => ({ doc: { ...s.doc, ...patch } })),

      setCount: (count) =>
        set((s) => ({
          doc: { ...s.doc, players: seatPlayers(s.drafts, count) },
        })),

      updatePlayer: (index, patch) =>
        set((s) => {
          const drafts = s.drafts.map((d, i) =>
            i === index ? { ...d, ...patch } : d,
          );
          return { drafts, doc: withPlayers(s.doc, drafts) };
        }),

      // Keep colours unique across active players by swapping with the taker.
      setPlayerColor: (index, color) =>
        set((s) => {
          const count = s.doc.players.length;
          const taker = s.drafts.findIndex(
            (d, i) => i !== index && i < count && d.color === color,
          );
          const drafts = s.drafts.map((d, i) => {
            if (i === index) return { ...d, color };
            if (i === taker) return { ...d, color: s.drafts[index]!.color };
            return d;
          });
          return { drafts, doc: withPlayers(s.doc, drafts) };
        }),

      setActivitiesEnabled: (enabled) =>
        set((s) => ({
          doc: { ...s.doc, activities: { ...s.doc.activities, enabled } },
        })),

      setIntensity: (intensity) =>
        set((s) => ({
          doc: { ...s.doc, activities: { ...s.doc.activities, intensity } },
        })),

      toggleTrigger: (trigger) =>
        set((s) => ({
          doc: {
            ...s.doc,
            activities: {
              ...s.doc.activities,
              triggers: {
                ...s.doc.activities.triggers,
                [trigger]: !s.doc.activities.triggers[trigger],
              },
            },
          },
        })),

      setDeck: (key, lines) =>
        set((s) => ({
          doc: {
            ...s.doc,
            activities: {
              ...s.doc.activities,
              decks: { ...s.doc.activities.decks, [key]: lines },
            },
          },
        })),

      reset: () =>
        set({
          doc: starterDoc(),
          drafts: DEFAULT_DRAFTS.map((d) => ({ ...d })),
        }),
    }),
    {
      name: "kyndl:ludo-builder",
      // Persist only the document; drafts are rebuilt from it on load.
      partialize: (s) => ({ doc: s.doc }),
      onRehydrateStorage: () => (state) => {
        // Rebuild the seat-agnostic roster from the persisted doc.
        if (state) state.drafts = draftsFromDoc(state.doc);
      },
    },
  ),
);
