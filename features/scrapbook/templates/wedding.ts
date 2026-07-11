import type { ScrapbookStory } from "../types";
import { body, makeElements } from "./content";
import type { TemplateDefinition } from "./types";

export const weddingTemplate: TemplateDefinition = {
  id: "wedding",
  name: "Our Wedding",
  tagline: "The big day, kept forever.",
  accent: "#8a2d4a",
  build: (): ScrapbookStory => {
    const e = makeElements("wed");
    return {
      templateId: "wedding",
      locked: true,
      title: "The Day We Married",
      subtitle: "Our happily ever after",
      dedication: "To the start of forever",
      coverColor: "#6b1f3a",
      pages: [
        {
          id: "wed-1",
          chapter: "The Big Day",
          eyebrow: "At last",
          heading: "The big day",
          paper: "plain",
          background: "#fdf6f0",
          body: body(
            "Set the scene — the morning, the nerves, the moment you saw each other.",
          ),
          elements: [
            e.sticker("flower", { x: 22, y: 9, rotate: -10, scale: 1.1 }),
            e.sticker("flower", { x: 76, y: 12, rotate: 12, scale: 1.1 }),
            e.photo({ x: 28, y: 30, width: 46, rotate: -2, caption: "I do" }),
          ],
        },
        {
          id: "wed-2",
          chapter: "Vows & Moments",
          eyebrow: "The ceremony",
          heading: "Vows & moments",
          paper: "plain",
          background: "#fdf6f0",
          body: body(
            "The words you said, the people who came, the first dance.",
          ),
          elements: [
            e.photo({ x: 9, y: 20, width: 40, rotate: 4, caption: "our vows" }),
            e.photo({
              x: 53,
              y: 48,
              width: 40,
              rotate: -5,
              caption: "first dance",
            }),
            e.sticker("heart", { x: 80, y: 22, rotate: 6 }),
          ],
        },
        {
          id: "wed-3",
          chapter: "Forever",
          eyebrow: "And on",
          heading: "Here's to forever",
          paper: "plain",
          background: "#fdf6f0",
          body: body(
            "A note to your future selves, reading this years from now.",
          ),
          elements: [
            e.sticker("flower", { x: 70, y: 60, rotate: 8, scale: 1.4 }),
            e.photo({
              x: 16,
              y: 28,
              width: 44,
              rotate: -3,
              caption: "just married",
            }),
          ],
        },
      ],
    };
  },
};
