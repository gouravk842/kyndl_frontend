import type { ScrapbookStory } from "../types";

/** A predefined scrapbook the user fills in (locked, content-only editing). */
export interface TemplateDefinition {
  /** Stable id stored on the story (`templateId`). */
  id: string;
  /** Display name shown in the gallery. */
  name: string;
  /** One-line description of the theme. */
  tagline: string;
  /** Accent colour for the gallery card. */
  accent: string;
  /** Fresh, fully-designed story for this template (always `locked: true`). */
  build: () => ScrapbookStory;
}
