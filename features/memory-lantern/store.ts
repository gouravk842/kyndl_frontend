import { Color } from "three";
import { create } from "zustand";

/**
 * Feature-scoped runtime state for Memory Lantern.
 *
 * The R3F `<Canvas>` runs its own reconciler, so the rotating lantern (inside
 * the canvas) and the DOM caption overlay (a sibling of the canvas) share one
 * Zustand store rather than React context. The lantern is the single writer of
 * `activePaneId` — it knows the spin angle and all facet angles, so it decides
 * which facet is front each frame; the DOM overlay just reads it.
 *
 * `roomColor` and `control` are *mutable* state shared the same way but on the
 * hot path — mutated in place, never reassigned, so they drive no re-renders:
 *   - `roomColor`: the lantern blends the facets' glow colours (weighted by how
 *     camera-facing each is) into this every frame, and `RoomLight` reads it to
 *     bathe the room in the memory currently facing the viewer.
 *   - `control`: the drag hook writes pointer motion here and the lantern's frame
 *     loop consumes it — `pending` is un-applied drag rotation, `velocity` is the
 *     flick momentum that decays after release, `grabbing` freezes the auto-spin
 *     while the viewer is holding the lantern still.
 *
 * `seen` is reactive (drives the finale overlay): the lantern marks each facet the
 * first time it turns to face the viewer, and once all are seen the finale shows.
 */

export interface LanternControl {
  /** Un-applied drag rotation (radians) the frame loop should add then zero. */
  pending: number;
  /** Flick momentum (radians/frame) that decays after release. */
  velocity: number;
  /** True while the viewer is holding the lantern (auto-spin frozen). */
  grabbing: boolean;
}

interface LanternState {
  /** Id of the facet currently turned toward the viewer (null before first frame). */
  activePaneId: string | null;
  /** Externally-forced pause (e.g. reduced motion). Holding uses `control.grabbing`. */
  paused: boolean;
  /** The room's live glow colour — mutated per frame, never reassigned. */
  roomColor: Color;
  /** Pointer-drag control — mutated in place by the drag hook + frame loop. */
  control: LanternControl;
  /** Facet ids that have faced the viewer at least once. */
  seen: Record<string, true>;
  setActivePane: (id: string | null) => void;
  setPaused: (paused: boolean) => void;
  markSeen: (id: string) => void;
}

export const useLanternStore = create<LanternState>((set) => ({
  activePaneId: null,
  paused: false,
  // Seeded to a warm ember so the very first frames aren't stark black.
  roomColor: new Color("#f0c48a"),
  control: { pending: 0, velocity: 0, grabbing: false },
  seen: {},
  setActivePane: (id) =>
    // Skip no-op writes so the DOM overlay only re-renders on an actual change.
    set((s) => (s.activePaneId === id ? s : { activePaneId: id })),
  setPaused: (paused) => set({ paused }),
  markSeen: (id) =>
    set((s) => (s.seen[id] ? s : { seen: { ...s.seen, [id]: true } })),
}));
