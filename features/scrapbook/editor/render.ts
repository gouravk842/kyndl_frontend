/**
 * Render a page's rich-text body to static HTML for the read-only viewer.
 *
 * Uses the same extension schema as the live editor so the document round-trips
 * exactly. Only known TipTap nodes/marks are emitted (no raw-HTML node), so the
 * output is safe to inject even for shared scrapbooks.
 */

import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";

import { scrapbookExtensions } from "./extensions";

export function bodyToHtml(body?: JSONContent): string {
  if (!body?.content?.length) return "";
  return generateHTML(body, scrapbookExtensions());
}

/** True when the body has no real content (so the viewer can skip the layer). */
export function isEmptyBody(body?: JSONContent): boolean {
  if (!body?.content?.length) return true;
  return !body.content.some(
    (node) => node.content?.length || node.type === "horizontalRule",
  );
}
