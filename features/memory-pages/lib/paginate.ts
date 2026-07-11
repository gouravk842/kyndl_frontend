import type { MemoryEntry, MemoryPage, PageTheme } from "../types";

/**
 * A description longer than this (in characters) doesn't read well squeezed into
 * a half-leaf next to another memory, so it's given its own "feature" page where
 * the image can be large and the text can breathe full-width.
 */
export const LONG_BODY = 150;

/** Whether a memory's write-up is long enough to deserve its own leaf. */
export function isLongEntry(entry: MemoryEntry): boolean {
  return (entry.body?.length ?? 0) > LONG_BODY;
}

function makePage(
  layout: MemoryPage["layout"],
  surface: PageTheme,
  entries: MemoryEntry[],
): MemoryPage {
  // Id derived from the first entry so a page keeps a stable identity (and React
  // key) across edits.
  return { id: `page-${entries[0]!.id}`, layout, theme: surface, entries };
}

/**
 * Auto-arrange a flat, ordered list of memories into album pages. Two short
 * memories share a leaf (a "duo" spread); a memory with a long write-up takes a
 * whole "feature" leaf; a leftover short memory gets a "single". Pure and
 * deterministic, so the builder preview and the audience viewer agree.
 */
export function packPages(
  memories: MemoryEntry[],
  surface: PageTheme,
): MemoryPage[] {
  const pages: MemoryPage[] = [];
  let i = 0;
  while (i < memories.length) {
    const a = memories[i]!;

    // A long write-up fills the leaf on its own.
    if (isLongEntry(a)) {
      pages.push(makePage("feature", surface, [a]));
      i += 1;
      continue;
    }

    // Pair two short memories; but never drag a long neighbour onto a shared
    // leaf — let it start its own feature page next round.
    const b = memories[i + 1];
    if (b && !isLongEntry(b)) {
      pages.push(makePage("duo", surface, [a, b]));
      i += 2;
    } else {
      pages.push(makePage("single", surface, [a]));
      i += 1;
    }
  }
  return pages;
}
