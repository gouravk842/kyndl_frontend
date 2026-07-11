import { create } from "zustand";

import { PLACES } from "./config";

/**
 * Feature-scoped state for Our Places.
 *
 * The single source of truth is `activeId`. A pin click, a sidebar click, and a
 * keyboard open all do the same thing — set `activeId` — and the map controller
 * reacts to that one value (flying to the pin, dimming the others). Closing sets
 * it back to null. Kept in a Zustand store rather than React context so the
 * Leaflet event handlers (which live outside React's render tree) and the DOM UI
 * read and write the same state — consistent with the other Kyndl experiences.
 *
 * Story Mode (the cinematic "play our story" tour) is layered on top of the same
 * `activeId`: while playing, a timer walks `storyIndex` through the places in
 * chronological order and opens each one, so the existing fly-and-reveal machinery
 * is reused untouched. `storyIndex` ranges 0..N-1 over the scenes, equals
 * `PLACES.length` on the closing card, and is `null` in free-roam. Any *manual*
 * interaction (a pin/sidebar click, a map-background click) drops out of the film
 * back into free-roam — that's the escape hatch.
 */
interface OurPlacesState {
  /** Id of the place whose story card is open (null = exploring the map). */
  activeId: string | null;
  /** Sidebar / place-list open on desktop. */
  sidebarOpen: boolean;

  /** Current Story Mode scene: 0..N-1 = a place, N = closing card, null = off. */
  storyIndex: number | null;
  /** Whether Story Mode is auto-advancing (vs paused). */
  isPlaying: boolean;

  openPlace: (id: string) => void;
  closePlace: () => void;
  toggleSidebar: () => void;

  /** Begin (or restart) the film from the first place. */
  startStory: () => void;
  /** Pause / resume auto-advance. */
  togglePlay: () => void;
  /** Advance to the next scene, or the closing card past the last place. */
  nextScene: () => void;
  /** Step back a scene (no-op before the first). */
  prevScene: () => void;
  /** Leave Story Mode for free-roam, keeping whatever is on screen. */
  exitStory: () => void;
}

export const useOurPlacesStore = create<OurPlacesState>((set) => ({
  activeId: null,
  sidebarOpen: true,
  storyIndex: null,
  isPlaying: false,

  // Manual opens always drop out of the film into free-roam.
  openPlace: (id) => set({ activeId: id, storyIndex: null, isPlaying: false }),
  closePlace: () => set({ activeId: null, storyIndex: null, isPlaying: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  startStory: () =>
    set({
      storyIndex: 0,
      isPlaying: true,
      activeId: PLACES[0]?.id ?? null,
    }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  nextScene: () =>
    set((s) => {
      if (s.storyIndex === null || s.storyIndex >= PLACES.length) return {};
      const next = s.storyIndex + 1;
      if (next >= PLACES.length) {
        // Past the last place → closing card; pull the camera back to the whole route.
        return { storyIndex: PLACES.length, isPlaying: false, activeId: null };
      }
      return { storyIndex: next, activeId: PLACES[next]?.id ?? null };
    }),
  prevScene: () =>
    set((s) => {
      if (s.storyIndex === null) return {};
      const clamped = Math.min(s.storyIndex, PLACES.length - 1);
      const prev = Math.max(0, clamped - 1);
      return { storyIndex: prev, activeId: PLACES[prev]?.id ?? null };
    }),
  exitStory: () => set({ storyIndex: null, isPlaying: false }),
}));
