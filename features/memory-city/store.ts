import { create } from "zustand";

import type { MemoryNode } from "./types";

/**
 * Feature-scoped state for Memory City.
 *
 * Like the original lane, the R3F `<Canvas>` runs its own reconciler, so the 3D
 * controllers (tour camera, roam player, node shells) and the DOM UI (HUD, tour
 * controls, module surfaces) share one Zustand store rather than React context.
 *
 * The store is a small state machine for the **revolve / roam** navigation:
 *
 *   intro ──start──▶ revolve(traveling ⇄ arrived) ──stepOff──▶ roam
 *                                  ▲                              │
 *                                  └──────────rejoin─────────────┘
 *
 * …and for **activation**: engaging a node opens its `gate` challenge (if any,
 * and not yet solved); solving it — or engaging an ungated node — reveals the
 * `reward`. `activePhase` says which surface is up; `solved` / `recalled` track
 * progress (gate cleared / memory revealed).
 */

export type CityMode = "revolve" | "roam";
export type ActivePhase = "gate" | "reward";

interface MemoryCityState {
  /** Has the recipient entered (first gesture)? Gates audio + controls. */
  started: boolean;
  /** Revolve along the spline vs. free-roam a district on foot. */
  mode: CityMode;
  /** Index of the focused node in `city.nodes`; -1 before the first move. */
  currentIndex: number;
  /** True once the camera has settled at the focused node's stage pose. */
  arrived: boolean;
  /** Id of the node whose surface is open (null = exploring). */
  activeNodeId: string | null;
  /** Which surface is showing for the active node. */
  activePhase: ActivePhase | null;
  /** Ids of nodes whose gate has been solved (ungated nodes are implicitly so). */
  solved: Set<string>;
  /** Ids of nodes whose reward has been revealed. */
  recalled: Set<string>;
  /** Most recently recalled node id (drives the "collected" toast). */
  lastRecalledId: string | null;
  /** Ambient audio muted? */
  muted: boolean;

  start: () => void;
  /** Focus a node by index (clamped by the caller to valid range). */
  focus: (index: number) => void;
  setArrived: (arrived: boolean) => void;
  enterRoam: () => void;
  exitRoam: () => void;
  /** Engage a node: opens its gate, or reveals its reward if already unlocked. */
  activate: (node: MemoryNode) => void;
  /** Mark the active node's gate solved and advance to its reward. */
  solveGate: () => void;
  close: () => void;
  toggleMuted: () => void;
}

/** A node is locked while it has an unsolved gate. */
export function isNodeLocked(node: MemoryNode, solved: Set<string>): boolean {
  return Boolean(node.gate) && !solved.has(node.id);
}

export const useMemoryCityStore = create<MemoryCityState>((set) => ({
  started: false,
  mode: "revolve",
  currentIndex: -1,
  arrived: false,
  activeNodeId: null,
  activePhase: null,
  solved: new Set<string>(),
  recalled: new Set<string>(),
  lastRecalledId: null,
  muted: false,

  start: () =>
    set((s) =>
      s.started ? s : { started: true, currentIndex: 0, arrived: false },
    ),
  focus: (index) => set({ currentIndex: index, arrived: false }),
  setArrived: (arrived) =>
    set((s) => (s.arrived === arrived ? s : { arrived })),
  enterRoam: () => set({ mode: "roam", activeNodeId: null, activePhase: null }),
  exitRoam: () => set({ mode: "revolve", arrived: false }),

  activate: (node) =>
    set((s) => {
      if (isNodeLocked(node, s.solved)) {
        return { activeNodeId: node.id, activePhase: "gate" };
      }
      return {
        activeNodeId: node.id,
        activePhase: "reward",
        recalled: new Set(s.recalled).add(node.id),
        lastRecalledId: node.id,
      };
    }),
  solveGate: () =>
    set((s) => {
      if (!s.activeNodeId) return s;
      return {
        activePhase: "reward",
        solved: new Set(s.solved).add(s.activeNodeId),
        recalled: new Set(s.recalled).add(s.activeNodeId),
        lastRecalledId: s.activeNodeId,
      };
    }),
  close: () => set({ activeNodeId: null, activePhase: null }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
}));
