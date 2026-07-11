/**
 * Memory Pages — a page-turning photo album. The content model mirrors the
 * backend `experiences/types/memory_pages.py` serializers. Photos are stored as
 * `{ fileId }` media references and resolved to URLs via a creation's `assets`
 * map (or a local object URL while a just-uploaded photo hasn't been saved yet).
 */

/**
 * 1 photo / 2 photos side-by-side rows / 2 photos stacked as a collage /
 * "feature" — a single memory with a long write-up given the whole leaf, with a
 * large image and the description flowing full-width.
 */
export type PageLayout = "single" | "duo" | "stack" | "feature";

/** Default surface look. "desk" is the wooden-desk + polaroid reference style. */
export type PageTheme = "desk" | "paper";

export interface MemoryPhoto {
  fileId: string;
}

export interface MemoryEntry {
  id: string;
  photo?: MemoryPhoto;
  /** Bold accent heading, e.g. "INCEPTION (2010)". */
  title?: string;
  /** Handwritten line under the polaroid, e.g. a place name. */
  caption?: string;
  /** Description paragraph. */
  body?: string;
  /**
   * Id of the user who added this memory (server-stamped). Blank/absent means the
   * album owner. Contributors may only edit memories whose `authorId` is theirs.
   */
  authorId?: string;
}

export interface MemoryPage {
  id: string;
  layout: PageLayout;
  theme?: PageTheme;
  /** 1–2 entries depending on the layout. */
  entries: MemoryEntry[];
}

export interface MemoryPagesDoc {
  title: string;
  subtitle?: string;
  coverPhoto?: MemoryPhoto;
  coverColor?: string;
  pages: MemoryPage[];
}

/** Resolves a media reference's fileId to a renderable URL, or null if missing. */
export type ResolvePhoto = (fileId: string | undefined) => string | null;

/** Resolves a memory's `authorId` to a display name, or null if unknown. */
export type ResolveAuthor = (authorId: string | undefined) => string | null;
