/**
 * Shared TipTap extension set for the scrapbook page editor.
 *
 * The SAME set must back both the live editor (builder) and the static HTML
 * render (viewer via `@tiptap/html`), so the document JSON round-trips through an
 * identical schema. Keep this list as the single source of truth.
 */

import type { Extensions } from "@tiptap/core";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Color, FontFamily, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

/** Handwriting / ink presets surfaced in the toolbar. */
export const FONT_OPTIONS = [
  { label: "Casual", value: "var(--font-hand)" },
  { label: "Cursive", value: "var(--font-cursive)" },
  { label: "Typed", value: "ui-sans-serif, system-ui, sans-serif" },
] as const;

export const INK_OPTIONS = [
  { label: "Cocoa", value: "#3a2a25" },
  { label: "Ink blue", value: "#2f4a73" },
  { label: "Berry", value: "#8a2d4a" },
  { label: "Forest", value: "#3a5a40" },
  { label: "Sepia", value: "#9c6b3f" },
] as const;

/** Build the extension list. `placeholder` is optional so the static renderer
 *  (which never shows a placeholder) can omit it. */
export function scrapbookExtensions(opts?: {
  placeholder?: string;
}): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      // A keepsake notebook doesn't need code, rules or links — keep it gentle.
      code: false,
      codeBlock: false,
      horizontalRule: false,
      link: false,
    }),
    TextStyle,
    Color,
    FontFamily,
  ];
  if (opts?.placeholder) {
    extensions.push(Placeholder.configure({ placeholder: opts.placeholder }));
  }
  return extensions;
}
