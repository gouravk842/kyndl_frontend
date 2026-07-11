/**
 * Authoring helpers for template stories — keep the template files terse and
 * consistent. `body()` builds a TipTap document; `makeElements()` hands out
 * id'd photo slots and decorations with auto-incrementing stacking order.
 */

import type { JSONContent } from "@tiptap/core";

import type { DecorationType, PhotoStyle, PlacedElement } from "../types";

type Line = string | { h: 1 | 2 | 3; text: string };

/** Build a page body from a sequence of paragraphs / headings. */
export function body(...lines: Line[]): JSONContent {
  return {
    type: "doc",
    content: lines.map((l) =>
      typeof l === "object"
        ? {
            type: "heading",
            attrs: { level: l.h },
            content: l.text ? [{ type: "text", text: l.text }] : [],
          }
        : { type: "paragraph", content: l ? [{ type: "text", text: l }] : [] },
    ),
  };
}

export function makeElements(prefix: string) {
  let n = 0;
  let z = 0;
  const nextId = () => `${prefix}-${n++}`;
  return {
    photo: (o: {
      x: number;
      y: number;
      width?: number;
      rotate?: number;
      caption?: string;
      style?: PhotoStyle;
    }): PlacedElement => ({
      id: nextId(),
      kind: "photo",
      style: o.style ?? "polaroid",
      caption: o.caption,
      width: o.width ?? 42,
      x: o.x,
      y: o.y,
      rotate: o.rotate ?? 0,
      z: ++z,
    }),
    sticker: (
      type: DecorationType,
      o: {
        x: number;
        y: number;
        rotate?: number;
        scale?: number;
        color?: string;
        label?: string;
      },
    ): PlacedElement => ({
      id: nextId(),
      kind: "decoration",
      type,
      label: o.label,
      color: o.color,
      x: o.x,
      y: o.y,
      rotate: o.rotate ?? 0,
      scale: o.scale ?? 1,
      z: ++z,
    }),
  };
}
