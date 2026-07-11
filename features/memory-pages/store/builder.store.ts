import { create } from "zustand";
import { persist } from "zustand/middleware";

import { packPages } from "../lib/paginate";
import type {
  MemoryEntry,
  MemoryPagesDoc,
  MemoryPhoto,
  PageTheme,
} from "../types";

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `mp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

/** Album-level fields the builder tracks alongside the flat memory list. */
export interface AlbumMeta {
  title: string;
  subtitle?: string;
  coverColor?: string;
  /** Preserved across load/save; not yet editable in the builder UI. */
  coverPhoto?: MemoryPhoto;
}

/** A fresh, empty album — the author starts by adding their first memory. */
export function starterMemories(): MemoryEntry[] {
  return [];
}

/** Assemble the saved/viewer-facing document from the builder's editing state. */
function buildDoc(
  album: AlbumMeta,
  memories: MemoryEntry[],
  surface: PageTheme,
): MemoryPagesDoc {
  return {
    title: album.title,
    subtitle: album.subtitle,
    coverColor: album.coverColor,
    coverPhoto: album.coverPhoto,
    pages: packPages(memories, surface),
  };
}

/** Flatten a loaded page-shaped document back into a flat memory list. */
function flattenDoc(doc: MemoryPagesDoc): {
  album: AlbumMeta;
  memories: MemoryEntry[];
  surface: PageTheme;
} {
  return {
    album: {
      title: doc.title,
      subtitle: doc.subtitle,
      coverColor: doc.coverColor,
      coverPhoto: doc.coverPhoto,
    },
    memories: doc.pages.flatMap((p) => p.entries),
    // The album has one surface; recover it from the first page.
    surface: doc.pages[0]?.theme ?? "paper",
  };
}

/** Who is editing, for author attribution + contributor gating. */
export type ViewerRole = "owner" | "admin" | "contributor" | null;

interface BuilderState {
  /** Album-level fields (title, subtitle, cover colour). */
  album: AlbumMeta;
  /** The ordered memories — the single source of truth the author edits. */
  memories: MemoryEntry[];
  /** One surface look applied to every leaf. */
  surface: PageTheme;
  /** Derived, page-shaped document kept in sync for saving + the viewer. */
  doc: MemoryPagesDoc;

  /** Presigned photo URLs by fileId, from a loaded creation's `assets` map. */
  assets: Record<string, string>;
  /** Object URLs for just-uploaded photos, so they preview before a reload. */
  localPreviews: Record<string, string>;

  /** The signed-in editor's id + role on this album (session-only, not persisted). */
  viewerId: string | null;
  viewerRole: ViewerRole;

  loadDoc: (doc: MemoryPagesDoc, assets?: Record<string, string>) => void;
  setViewer: (id: string | null, role: ViewerRole) => void;
  /** Whether the current viewer may edit/remove a given memory. */
  canEditMemory: (memory: MemoryEntry) => boolean;
  setAlbum: (patch: Partial<AlbumMeta>) => void;
  setSurface: (surface: PageTheme) => void;

  /** Append a new memory and return its id. */
  addMemory: (memory?: Partial<Omit<MemoryEntry, "id">>) => string;
  updateMemory: (id: string, patch: Partial<Omit<MemoryEntry, "id">>) => void;
  removeMemory: (id: string) => void;
  moveMemory: (id: string, dir: -1 | 1) => void;

  setPhoto: (id: string, fileId: string, previewUrl: string) => void;
  removePhoto: (id: string) => void;

  setCoverPhoto: (fileId: string, previewUrl: string) => void;
  removeCoverPhoto: () => void;

  /** Resolve a fileId to a URL (local preview wins, else loaded asset). */
  photoUrl: (fileId: string | undefined) => string | null;

  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => {
      /** Re-derive `doc` after any change to album/memories/surface. */
      const sync = (
        next: Pick<BuilderState, "album" | "memories" | "surface">,
      ) => ({
        ...next,
        doc: buildDoc(next.album, next.memories, next.surface),
      });

      const initialAlbum: AlbumMeta = { title: "Our Album", subtitle: "" };
      const initialMemories = starterMemories();
      const initialSurface: PageTheme = "paper";

      return {
        album: initialAlbum,
        memories: initialMemories,
        surface: initialSurface,
        doc: buildDoc(initialAlbum, initialMemories, initialSurface),
        assets: {},
        localPreviews: {},
        viewerId: null,
        viewerRole: "owner",

        loadDoc: (doc, assets = {}) => {
          const { album, memories, surface } = flattenDoc(doc);
          set({ ...sync({ album, memories, surface }), assets });
        },

        setViewer: (viewerId, viewerRole) => set({ viewerId, viewerRole }),

        canEditMemory: (memory) => {
          const { viewerRole, viewerId } = get();
          // Owner/admin (and the local pre-sign-in draft) edit anything; a
          // contributor may only touch memories they themselves added — which is
          // exactly the memories stamped with their own id.
          if (viewerRole !== "contributor") return true;
          return Boolean(memory.authorId) && memory.authorId === viewerId;
        },

        setAlbum: (patch) =>
          set((s) => sync({ ...s, album: { ...s.album, ...patch } })),

        setSurface: (surface) => set((s) => sync({ ...s, surface })),

        addMemory: (memory = {}) => {
          const id = newId();
          set((s) =>
            sync({
              ...s,
              // Stamp the author so a contributor's new memory reads as theirs
              // (and stays editable) before the server confirms it. The owner's
              // own additions carry no authorId — blank means owner.
              memories: [
                ...s.memories,
                {
                  id,
                  ...(s.viewerRole === "contributor" && s.viewerId
                    ? { authorId: s.viewerId }
                    : {}),
                  ...memory,
                },
              ],
            }),
          );
          return id;
        },

        updateMemory: (id, patch) =>
          set((s) =>
            sync({
              ...s,
              memories: s.memories.map((m) =>
                m.id === id ? { ...m, ...patch } : m,
              ),
            }),
          ),

        removeMemory: (id) =>
          set((s) =>
            sync({ ...s, memories: s.memories.filter((m) => m.id !== id) }),
          ),

        moveMemory: (id, dir) =>
          set((s) => {
            const memories = [...s.memories];
            const i = memories.findIndex((m) => m.id === id);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= memories.length) return {};
            const a = memories[i];
            const b = memories[j];
            if (!a || !b) return {};
            memories[i] = b;
            memories[j] = a;
            return sync({ ...s, memories });
          }),

        setPhoto: (id, fileId, previewUrl) =>
          set((s) => ({
            ...sync({
              ...s,
              memories: s.memories.map((m) =>
                m.id === id ? { ...m, photo: { fileId } } : m,
              ),
            }),
            localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
          })),

        removePhoto: (id) =>
          set((s) =>
            sync({
              ...s,
              memories: s.memories.map((m) =>
                m.id === id ? { ...m, photo: undefined } : m,
              ),
            }),
          ),

        setCoverPhoto: (fileId, previewUrl) =>
          set((s) => ({
            ...sync({ ...s, album: { ...s.album, coverPhoto: { fileId } } }),
            localPreviews: { ...s.localPreviews, [fileId]: previewUrl },
          })),

        removeCoverPhoto: () =>
          set((s) =>
            sync({ ...s, album: { ...s.album, coverPhoto: undefined } }),
          ),

        photoUrl: (fileId) => {
          if (!fileId) return null;
          const { localPreviews, assets } = get();
          return localPreviews[fileId] ?? assets[fileId] ?? null;
        },

        reset: () =>
          set(
            sync({
              album: { title: "Our Album", subtitle: "" },
              memories: starterMemories(),
              surface: "paper",
            }),
          ),
      };
    },
    {
      name: "kyndl:memory-pages-builder",
      // Persist only the editing state; the derived doc is rebuilt on rehydrate,
      // and presigned/object URLs are session-bound.
      partialize: (s) => ({
        album: s.album,
        memories: s.memories,
        surface: s.surface,
      }),
      // Older drafts persisted a page-shaped `doc`; flatten it forward.
      migrate: (persisted: unknown) => {
        const p = persisted as
          | { doc?: MemoryPagesDoc; memories?: MemoryEntry[] }
          | undefined;
        if (p && !p.memories && p.doc) return flattenDoc(p.doc);
        return p as never;
      },
      version: 1,
      // Rebuild the derived doc from the rehydrated editing state.
      onRehydrateStorage: () => (state) => {
        if (state)
          state.doc = buildDoc(state.album, state.memories, state.surface);
      },
    },
  ),
);
