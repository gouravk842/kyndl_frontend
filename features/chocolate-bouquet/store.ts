import { create } from "zustand";

/**
 * Runtime state for one live bouquet — shared by the WebGL scene (inside
 * `<Canvas>`) and the DOM overlays (entrance, HUD, tear/reveal) stacked on top.
 * A zustand store is the clean bridge across that boundary: R3F meshes subscribe
 * to it just like React components do.
 *
 * `selectedId` is the chocolate the visitor has lifted out and is tearing open;
 * `openedIds` are the ones already read (their memory has been seen at least
 * once). The bouquet is content-agnostic — it holds no memory text, only which
 * chocolate is active and which are done.
 */
interface RuntimeState {
  entered: boolean;
  selectedId: number | null;
  openedIds: Set<number>;

  begin: () => void;
  select: (id: number) => void;
  /** Mark the selected chocolate as read (called when its wrapper fully tears). */
  markOpened: (id: number) => void;
  /** Dismiss the reveal and send the chocolate back to the bouquet. */
  close: () => void;
  reset: () => void;
}

export const useBouquetStore = create<RuntimeState>((set) => ({
  entered: false,
  selectedId: null,
  openedIds: new Set<number>(),

  begin: () => set({ entered: true }),
  select: (id) => set({ selectedId: id }),
  markOpened: (id) =>
    set((s) => {
      const openedIds = new Set(s.openedIds);
      openedIds.add(id);
      return { openedIds };
    }),
  close: () => set({ selectedId: null }),
  reset: () => set({ entered: false, selectedId: null, openedIds: new Set() }),
}));
