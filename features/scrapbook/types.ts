/**
 * Scrapbook content model.
 *
 * A story is authored entirely as data: every page lists positioned elements,
 * and the renderer maps each element `kind` to a component. Asset references
 * (`src`) point at files under `public/scrapbook/` — see `data/ASSETS.md`.
 *
 * Each page also carries a rich-text `body` (TipTap/ProseMirror JSON) — the
 * notebook-style writing surface that sits beneath the placed elements.
 */

import type { JSONContent } from "@tiptap/core";

/** A decoration motif layered onto the page. */
export type DecorationType =
  | "washi"
  | "heart"
  | "star"
  | "flower"
  | "stamp"
  | "ticket";

/** Handwriting voice for notes. */
export type HandFont = "hand" | "cursive";

/** Surface ruling for a page. */
export type PageStyle = "plain" | "ruled" | "dotted" | "grid";

export type PhotoStyle = "single" | "polaroid" | "overlap";
export type MemoryCardVariant = "sticky" | "torn" | "journal";
export type AudioPlayer = "cassette" | "vinyl";
export type VideoFrame = "tv" | "photo";

/** Discriminated union of everything that can sit on a page. */
export type PageElementContent =
  | {
      kind: "photo";
      /** Path under /scrapbook (e.g. "/scrapbook/first-date.jpg"). Optional → renders an asset slot. */
      src?: string;
      alt?: string;
      caption?: string;
      style?: PhotoStyle;
      /** Width in page units (% of page width). */
      width?: number;
    }
  | {
      kind: "note";
      text: string;
      font?: HandFont;
      /** Ink colour; defaults to a deep cocoa ink. */
      ink?: string;
      /** Animate the text in as if being written. */
      draw?: boolean;
    }
  | {
      kind: "memoryCard";
      body: string;
      date?: string;
      place?: string;
      variant?: MemoryCardVariant;
    }
  | {
      kind: "decoration";
      type: DecorationType;
      /** Label for stamps / tickets. */
      label?: string;
      /** Tailwind/CSS colour token override. */
      color?: string;
    }
  | {
      kind: "audio";
      src?: string;
      title: string;
      player?: AudioPlayer;
    }
  | {
      kind: "video";
      src?: string;
      poster?: string;
      title: string;
      frame?: VideoFrame;
    }
  | {
      kind: "secret";
      /** Teaser shown on the folded note. */
      teaser?: string;
      /** Revealed message. */
      message: string;
    }
  | {
      kind: "scratch";
      /** Prompt shown over the scratch surface. */
      prompt?: string;
      reveal: { text?: string; src?: string };
    };

/** Placement of an element on the page (percentages of the page box). */
export interface ElementPlacement {
  /** Left offset, 0–100 (% of page width). */
  x: number;
  /** Top offset, 0–100 (% of page height). */
  y: number;
  /** Stacking order within the page. */
  z?: number;
  /** Rotation in degrees for a hand-placed feel. */
  rotate?: number;
  /** Scale multiplier. */
  scale?: number;
}

export type PlacedElement = PageElementContent &
  ElementPlacement & { id: string };

/** A single leaf of the book. */
export interface ScrapbookPage {
  id: string;
  /** Chapter this page belongs to (for narrative grouping / progress). */
  chapter: string;
  /** Optional eyebrow shown at the top of the page. */
  eyebrow?: string;
  /** Optional page heading. */
  heading?: string;
  /** Background tint override (CSS colour). Defaults to the paper surface. */
  background?: string;
  /** Surface ruling. Defaults to "plain". */
  paper?: PageStyle;
  /** Rich-text writing surface (TipTap document JSON). */
  body?: JSONContent;
  elements: PlacedElement[];
}

/** The complete authored story. */
export interface ScrapbookStory {
  title: string;
  subtitle?: string;
  /** Names embossed on the cover / dedication. */
  dedication?: string;
  /** Cover photo slot. */
  coverPhoto?: string;
  /** Base colour for the cover board (CSS colour). Defaults to deep maroon. */
  coverColor?: string;
  /** Id of the template this story was started from (if any). */
  templateId?: string;
  /**
   * Guided "template" mode: components are fixed and only content (page text,
   * photo images, captions) is editable. Cleared when the user customises the
   * layout, turning it into a free build.
   */
  locked?: boolean;
  pages: ScrapbookPage[];
}

/** The nine narrative chapters, in order. */
export const CHAPTERS = [
  "How We Met",
  "First Date",
  "Favorite Memories",
  "Trips Together",
  "Funny Moments",
  "Special Messages",
  "Future Dreams",
  "Final Love Letter",
] as const;

export type Chapter = (typeof CHAPTERS)[number];
