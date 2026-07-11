/**
 * Registry of predefined scrapbook templates. Add a theme by writing a
 * `TemplateDefinition` file and listing it here — the gallery and loader pick it
 * up automatically.
 */

import { babyTemplate } from "./baby";
import { birthdayTemplate } from "./birthday";
import { friendshipTemplate } from "./friendship";
import { loveTemplate } from "./love";
import { travelTemplate } from "./travel";
import type { TemplateDefinition } from "./types";
import { weddingTemplate } from "./wedding";

export const TEMPLATES: TemplateDefinition[] = [
  loveTemplate,
  travelTemplate,
  birthdayTemplate,
  weddingTemplate,
  babyTemplate,
  friendshipTemplate,
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export type { TemplateDefinition } from "./types";
