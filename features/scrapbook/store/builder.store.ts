import type { JSONContent } from "@tiptap/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getTemplate } from "../templates";
import type {
  PageElementContent,
  PlacedElement,
  ScrapbookPage,
  ScrapbookStory,
} from "../types";

/** Element kinds the user can drop onto a page, with friendly labels. */
export const ELEMENT_PALETTE: {
  kind: PageElementContent["kind"];
  label: string;
  icon: string;
}[] = [
  { kind: "photo", label: "Photo", icon: "🖼️" },
  { kind: "note", label: "Note", icon: "✍️" },
  { kind: "memoryCard", label: "Memory card", icon: "🗒️" },
  { kind: "decoration", label: "Sticker", icon: "✨" },
  { kind: "secret", label: "Secret note", icon: "🤫" },
  { kind: "scratch", label: "Scratch card", icon: "🎟️" },
  { kind: "audio", label: "Audio", icon: "🎙️" },
  { kind: "video", label: "Video", icon: "🎞️" },
];

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

/** Default content for a freshly-added element of the given kind. */
function defaultContent(kind: PageElementContent["kind"]): PageElementContent {
  switch (kind) {
    case "photo":
      return { kind: "photo", style: "polaroid", caption: "a memory" };
    case "note":
      return { kind: "note", text: "Write something sweet…", font: "hand" };
    case "memoryCard":
      return {
        kind: "memoryCard",
        body: "A little moment worth keeping.",
        variant: "journal",
        date: "",
        place: "",
      };
    case "decoration":
      return { kind: "decoration", type: "heart" };
    case "audio":
      return { kind: "audio", title: "A voice note", player: "cassette" };
    case "video":
      return { kind: "video", title: "A video memory", frame: "tv" };
    case "secret":
      return {
        kind: "secret",
        teaser: "Open me",
        message: "A hidden little message.",
      };
    case "scratch":
      return {
        kind: "scratch",
        prompt: "Scratch here",
        reveal: { text: "Surprise!" },
      };
    default:
      return { kind: "note", text: "…", font: "hand" };
  }
}

function blankPage(index: number): ScrapbookPage {
  return {
    id: newId(),
    chapter: `Chapter ${index}`,
    eyebrow: "",
    heading: `Chapter ${index}`,
    elements: [],
  };
}

/** A minimal starting story so the canvas isn't empty. */
function starterStory(): ScrapbookStory {
  return {
    title: "Our Story",
    subtitle: "A keepsake made just for you",
    dedication: "For you, with love",
    coverPhoto: undefined,
    pages: [
      {
        id: newId(),
        chapter: "Chapter 1",
        eyebrow: "Chapter One",
        heading: "How we met",
        elements: [
          {
            id: newId(),
            kind: "note",
            text: "Start your story here…",
            font: "cursive",
            x: 16,
            y: 28,
            rotate: -2,
            z: 2,
          },
          {
            id: newId(),
            kind: "decoration",
            type: "heart",
            x: 66,
            y: 60,
            rotate: 8,
            z: 1,
            scale: 1.3,
          },
        ],
      },
    ],
  };
}

interface BuilderState {
  story: ScrapbookStory;
  selectedPageId: string;
  selectedElementId: string | null;
  /** Whether the user has picked a starting point (blank or a template). When
   *  false the builder shows the start screen instead of the workspace. */
  chosen: boolean;

  // selection
  selectPage: (id: string) => void;
  selectElement: (id: string | null) => void;

  // start screen / templates
  /** Begin a blank, free-form scrapbook. */
  startBlank: () => void;
  /** Seed the builder from a template (guided, locked editing). */
  loadTemplate: (id: string) => void;
  /** Turn a locked template into a free build (components become editable). */
  unlockLayout: () => void;
  /** Return to the start screen without discarding the current draft. */
  backToChooser: () => void;

  // cover / story meta
  updateCover: (
    patch: Partial<
      Pick<
        ScrapbookStory,
        "title" | "subtitle" | "dedication" | "coverPhoto" | "coverColor"
      >
    >,
  ) => void;

  // pages
  addPage: () => void;
  removePage: (id: string) => void;
  movePage: (id: string, dir: -1 | 1) => void;
  updatePage: (
    id: string,
    patch: Partial<Omit<ScrapbookPage, "id" | "elements">>,
  ) => void;
  /** Replace a page's rich-text writing surface. */
  updatePageBody: (id: string, body: JSONContent) => void;
  /**
   * Insert a fresh page directly after `id` (used by overflow pagination) and
   * return its id. The new page inherits the source page's paper style so the
   * notebook reads consistently as it fills up.
   */
  addPageAfter: (id: string, body?: JSONContent) => string;

  // elements
  addElement: (kind: PageElementContent["kind"]) => void;
  updateElement: (elementId: string, patch: Record<string, unknown>) => void;
  removeElement: (elementId: string) => void;

  // whole-story
  reset: () => void;
  loadStory: (story: ScrapbookStory) => void;
}

const initial = starterStory();

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      story: initial,
      selectedPageId: initial.pages[0]!.id,
      selectedElementId: null,
      chosen: false,

      selectPage: (id) => set({ selectedPageId: id, selectedElementId: null }),
      selectElement: (id) => set({ selectedElementId: id }),

      startBlank: () => {
        const fresh = starterStory();
        set({
          story: fresh,
          selectedPageId: fresh.pages[0]!.id,
          selectedElementId: null,
          chosen: true,
        });
      },

      loadTemplate: (id) => {
        const template = getTemplate(id);
        if (!template) return;
        const story = template.build();
        set({
          story,
          selectedPageId: story.pages[0]?.id ?? "",
          selectedElementId: null,
          chosen: true,
        });
      },

      unlockLayout: () =>
        set((s) => ({ story: { ...s.story, locked: false } })),

      backToChooser: () => set({ chosen: false, selectedElementId: null }),

      updateCover: (patch) => set((s) => ({ story: { ...s.story, ...patch } })),

      addPage: () =>
        set((s) => {
          const page = blankPage(s.story.pages.length + 1);
          return {
            story: { ...s.story, pages: [...s.story.pages, page] },
            selectedPageId: page.id,
            selectedElementId: null,
          };
        }),

      removePage: (id) =>
        set((s) => {
          if (s.story.pages.length <= 1) return s;
          const pages = s.story.pages.filter((p) => p.id !== id);
          const wasSelected = s.selectedPageId === id;
          return {
            story: { ...s.story, pages },
            selectedPageId: wasSelected ? pages[0]!.id : s.selectedPageId,
            selectedElementId: wasSelected ? null : s.selectedElementId,
          };
        }),

      movePage: (id, dir) =>
        set((s) => {
          const pages = [...s.story.pages];
          const i = pages.findIndex((p) => p.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= pages.length) return s;
          [pages[i], pages[j]] = [pages[j]!, pages[i]!];
          return { story: { ...s.story, pages } };
        }),

      updatePage: (id, patch) =>
        set((s) => ({
          story: {
            ...s.story,
            pages: s.story.pages.map((p) =>
              p.id === id ? { ...p, ...patch } : p,
            ),
          },
        })),

      updatePageBody: (id, body) =>
        set((s) => ({
          story: {
            ...s.story,
            pages: s.story.pages.map((p) => (p.id === id ? { ...p, body } : p)),
          },
        })),

      addPageAfter: (id, body) => {
        const newPage = blankPage(0);
        set((s) => {
          const i = s.story.pages.findIndex((p) => p.id === id);
          if (i < 0) return s;
          const source = s.story.pages[i]!;
          const page: ScrapbookPage = {
            ...newPage,
            chapter: source.chapter,
            heading: "",
            eyebrow: "",
            paper: source.paper,
            body,
          };
          const pages = [...s.story.pages];
          pages.splice(i + 1, 0, page);
          return { story: { ...s.story, pages } };
        });
        return newPage.id;
      },

      addElement: (kind) =>
        set((s) => {
          const pageId = s.selectedPageId;
          const page = s.story.pages.find((p) => p.id === pageId);
          if (!page) return s;
          const maxZ = page.elements.reduce((m, e) => Math.max(m, e.z ?? 1), 0);
          const element: PlacedElement = {
            ...defaultContent(kind),
            id: newId(),
            x: 32,
            y: 34,
            z: maxZ + 1,
            rotate: 0,
            scale: 1,
          };
          return {
            story: {
              ...s.story,
              pages: s.story.pages.map((p) =>
                p.id === pageId
                  ? { ...p, elements: [...p.elements, element] }
                  : p,
              ),
            },
            selectedElementId: element.id,
          };
        }),

      updateElement: (elementId, patch) =>
        set((s) => ({
          story: {
            ...s.story,
            pages: s.story.pages.map((p) =>
              p.id === s.selectedPageId
                ? {
                    ...p,
                    elements: p.elements.map((e) =>
                      e.id === elementId
                        ? ({ ...e, ...patch } as PlacedElement)
                        : e,
                    ),
                  }
                : p,
            ),
          },
        })),

      removeElement: (elementId) =>
        set((s) => ({
          selectedElementId:
            s.selectedElementId === elementId ? null : s.selectedElementId,
          story: {
            ...s.story,
            pages: s.story.pages.map((p) =>
              p.id === s.selectedPageId
                ? {
                    ...p,
                    elements: p.elements.filter((e) => e.id !== elementId),
                  }
                : p,
            ),
          },
        })),

      reset: () => {
        const fresh = starterStory();
        set({
          story: fresh,
          selectedPageId: fresh.pages[0]!.id,
          selectedElementId: null,
        });
      },

      loadStory: (story) =>
        set({
          story,
          selectedPageId: story.pages[0]?.id ?? "",
          selectedElementId: null,
          chosen: true,
        }),
    }),
    {
      name: "kyndl-scrapbook-draft",
      partialize: (s) => ({ story: s.story, chosen: s.chosen }),
      onRehydrateStorage: () => (state) => {
        // restored story may not contain the default-selected page id
        if (
          state &&
          !state.story.pages.some((p) => p.id === state.selectedPageId)
        ) {
          state.selectedPageId = state.story.pages[0]?.id ?? "";
        }
      },
    },
  ),
);
