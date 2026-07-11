import type { ScrapbookStory } from "../types";
import { body, makeElements } from "./content";
import type { TemplateDefinition } from "./types";

export const loveTemplate: TemplateDefinition = {
  id: "love-story",
  name: "Love Story",
  tagline: "For an anniversary, a partner, the one.",
  accent: "#7c2230",
  build: (): ScrapbookStory => {
    const e = makeElements("love");
    return {
      templateId: "love-story",
      locked: true,
      title: "Our Love Story",
      subtitle: "Every moment worth keeping",
      dedication: "For you, with all my heart",
      coverColor: "#5e1722",
      pages: [
        {
          id: "love-1",
          chapter: "How We Met",
          eyebrow: "Chapter One",
          heading: "How we met",
          paper: "ruled",
          body: body(
            "Write about the day your paths first crossed — where you were, the very first thing you noticed…",
          ),
          elements: [
            e.sticker("washi", { x: 28, y: 7, rotate: -4 }),
            e.photo({
              x: 54,
              y: 24,
              width: 40,
              rotate: 4,
              caption: "the beginning",
            }),
            e.sticker("heart", { x: 14, y: 70, rotate: -8, scale: 1.3 }),
          ],
        },
        {
          id: "love-2",
          chapter: "Favourite Moments",
          eyebrow: "Chapter Two",
          heading: "Moments I'll never forget",
          paper: "ruled",
          body: body(
            "The little things — a laugh, a trip, an ordinary Tuesday that turned out to matter.",
          ),
          elements: [
            e.photo({ x: 8, y: 20, width: 40, rotate: -5, caption: "us" }),
            e.photo({
              x: 52,
              y: 52,
              width: 40,
              rotate: 6,
              caption: "this day",
            }),
            e.sticker("flower", { x: 78, y: 16, rotate: 10 }),
          ],
        },
        {
          id: "love-3",
          chapter: "To The Future",
          eyebrow: "Chapter Three",
          heading: "Here's to forever",
          paper: "ruled",
          body: body("Everything I'm still looking forward to, with you…"),
          elements: [
            e.sticker("heart", { x: 70, y: 60, rotate: 8, scale: 1.5 }),
            e.photo({ x: 14, y: 26, width: 44, rotate: -3, caption: "to us" }),
          ],
        },
      ],
    };
  },
};
