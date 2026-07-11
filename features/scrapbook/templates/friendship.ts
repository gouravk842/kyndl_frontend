import type { ScrapbookStory } from "../types";
import { body, makeElements } from "./content";
import type { TemplateDefinition } from "./types";

export const friendshipTemplate: TemplateDefinition = {
  id: "best-friends",
  name: "Best Friends",
  tagline: "For the friend who's family.",
  accent: "#c2622c",
  build: (): ScrapbookStory => {
    const e = makeElements("bff");
    return {
      templateId: "best-friends",
      locked: true,
      title: "You & Me",
      subtitle: "A book about us",
      dedication: "To my person — always",
      coverColor: "#b5532a",
      pages: [
        {
          id: "bff-1",
          chapter: "How It Started",
          eyebrow: "Once upon a time",
          heading: "How it started",
          paper: "dotted",
          body: body(
            "Where you met, the moment you knew you'd be friends for good.",
          ),
          elements: [
            e.sticker("washi", { x: 26, y: 8, rotate: -4 }),
            e.photo({ x: 52, y: 24, width: 42, rotate: 5, caption: "day one" }),
            e.sticker("star", { x: 14, y: 70, rotate: -8, scale: 1.2 }),
          ],
        },
        {
          id: "bff-2",
          chapter: "Our Adventures",
          eyebrow: "The good stuff",
          heading: "All our adventures",
          paper: "dotted",
          body: body(
            "The inside jokes, the late nights, the trouble you got into together.",
          ),
          elements: [
            e.photo({
              x: 9,
              y: 20,
              width: 40,
              rotate: -5,
              caption: "us being us",
            }),
            e.photo({ x: 54, y: 50, width: 40, rotate: 6, caption: "classic" }),
            e.sticker("heart", { x: 80, y: 20, rotate: 8 }),
          ],
        },
        {
          id: "bff-3",
          chapter: "Always",
          eyebrow: "No matter what",
          heading: "Always",
          paper: "dotted",
          body: body(
            "What this friendship means to you — and a promise for the years ahead.",
          ),
          elements: [
            e.sticker("star", { x: 70, y: 60, rotate: 6, scale: 1.4 }),
            e.photo({
              x: 16,
              y: 28,
              width: 44,
              rotate: -3,
              caption: "forever",
            }),
          ],
        },
      ],
    };
  },
};
