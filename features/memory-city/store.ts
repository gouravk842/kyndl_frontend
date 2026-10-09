import { create } from "zustand";

import { loadProgress, saveProgress } from "./lib/progress";
import type { MemoryNode } from "./types";

/**
 * Feature-scoped state for Memory City.
 *
 * Like the original lane, the R3F `<Canvas>` runs its own reconciler, so the 3D
 * controllers (tour camera, roam player, node shells) and the DOM UI (HUD, tour
 * controls, module surfaces) share one Zustand store rather than React context.
 */

export type CityMode = "revolve" | "roam";
export type ActivePhase = "gate" | "reward";
export type RenderQuality = "low" | "med" | "high";

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

  /** localStorage key id (creation id or public token). */
  progressKey: string | null;
  /** GPU / post budget tier. */
  quality: RenderQuality;
  /** Prefers-reduced-motion. */
  reducedMotion: boolean;
  /** Desktop roam allowed (hidden on coarse/mobile). */
  roamAllowed: boolean;
  /** DoF focus distance in world units (updated by RevolveCamera). */
  focusDistance: number;
  /** Node ids currently playing a growth rise animation. */
  growingNodeIds: Set<string>;
  /** Force 2D gallery instead of WebGL (context loss / sustained low FPS). */
  forceGallery: boolean;

  start: () => void;
  focus: (index: number) => void;
  setArrived: (arrived: boolean) => void;
  enterRoam: () => void;
  exitRoam: () => void;
  activate: (node: MemoryNode) => void;
  solveGate: () => void;
  close: () => void;
  toggleMuted: () => void;

  setProgressKey: (key: string | null) => void;
  hydrateProgress: (key: string | null) => void;
  setQuality: (q: RenderQuality) => void;
  setReducedMotion: (v: boolean) => void;
  setRoamAllowed: (v: boolean) => void;
  setFocusDistance: (d: number) => void;
  setGrowingNodeIds: (ids: string[]) => void;
  clearGrowing: (id: string) => void;
  setForceGallery: (v: boolean) => void;
}

function persist(s: MemoryCityState) {
  saveProgress(s.progressKey, {
    solved: [...s.solved],
    recalled: [...s.recalled],
  });
}

/** A node is locked while it has an unsolved gate. */
export function isNodeLocked(node: MemoryNode, solved: Set<string>): boolean {
  return Boolean(node.gate) && !solved.has(node.id);
}

/** Ids in `requires` that have not been recalled yet. */
export function missingRequires(
  node: MemoryNode,
  recalled: Set<string>,
): string[] {
  if (!node.requires?.length) return [];
  return node.requires.filter((id) => !recalled.has(id));
}

/** True if prerequisites or an unsolved gate block activation. */
export function isNodeBlocked(
  node: MemoryNode,
  solved: Set<string>,
  recalled: Set<string>,
): boolean {
  return (
    missingRequires(node, recalled).length > 0 || isNodeLocked(node, solved)
  );
}

export const useMemoryCityStore = create<MemoryCityState>((set, get) => ({
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

  progressKey: null,
  quality: "med",
  reducedMotion: false,
  roamAllowed: true,
  focusDistance: 12,
  growingNodeIds: new Set<string>(),
  forceGallery: false,

  start: () =>
    set((s) =>
      s.started ? s : { started: true, currentIndex: 0, arrived: false },
    ),
  focus: (index) => set({ currentIndex: index, arrived: false }),
  setArrived: (arrived) =>
    set((s) => (s.arrived === arrived ? s : { arrived })),
  enterRoam: () => {
    if (!get().roamAllowed) return;
    set({ mode: "roam", activeNodeId: null, activePhase: null });
  },
  exitRoam: () => set({ mode: "revolve", arrived: false }),

  activate: (node) =>
    set((s) => {
      const missing = missingRequires(node, s.recalled);
      if (missing.length > 0) {
        // Soft block — UI shows the hint; do not open a surface.
        return s;
      }
      if (isNodeLocked(node, s.solved)) {
        return { activeNodeId: node.id, activePhase: "gate" };
      }
      const next = {
        activeNodeId: node.id,
        activePhase: "reward" as const,
        recalled: new Set(s.recalled).add(node.id),
        lastRecalledId: node.id,
      };
      persist({ ...s, ...next });
      return next;
    }),
  solveGate: () =>
    set((s) => {
      if (!s.activeNodeId) return s;
      const next = {
        activePhase: "reward" as const,
        solved: new Set(s.solved).add(s.activeNodeId),
        recalled: new Set(s.recalled).add(s.activeNodeId),
        lastRecalledId: s.activeNodeId,
      };
      persist({ ...s, ...next });
      return next;
    }),
  close: () => set({ activeNodeId: null, activePhase: null }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  setProgressKey: (key) => set({ progressKey: key }),
  hydrateProgress: (key) => {
    const saved = loadProgress(key);
    set({
      progressKey: key,
      solved: new Set(saved?.solved ?? []),
      recalled: new Set(saved?.recalled ?? []),
    });
  },
  setQuality: (q) => set({ quality: q }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setRoamAllowed: (v) => set({ roamAllowed: v }),
  setFocusDistance: (d) => set({ focusDistance: d }),
  setGrowingNodeIds: (ids) => set({ growingNodeIds: new Set(ids) }),
  clearGrowing: (id) =>
    set((s) => {
      if (!s.growingNodeIds.has(id)) return s;
      const next = new Set(s.growingNodeIds);
      next.delete(id);
      return { growingNodeIds: next };
    }),
  setForceGallery: (v) => set({ forceGallery: v }),
}));
