import type { ScrapbookStory } from "../types";
import { body, makeElements } from "./content";
import type { TemplateDefinition } from "./types";

export const babyTemplate: TemplateDefinition = {
  id: "little-one",
  name: "Little One",
  tagline: "A new baby's first chapters.",
  accent: "#3f7cad",
  build: (): ScrapbookStory => {
    const e = makeElements("baby");
    return {
      templateId: "little-one",
      locked: true,
      title: "Hello, Little One",
      subtitle: "Your story, from the very start",
      dedication: "For our little one, with love",
      coverColor: "#355c7d",
      pages: [
        {
          id: "baby-1",
          chapter: "Welcome",
          eyebrow: "Day one",
          heading: "Welcome to the world",
          paper: "grid",
          background: "#f3f8fd",
          body: body(
            "The day you arrived — the time, the weight, who was there to meet you.",
          ),
          elements: [
            e.sticker("star", { x: 74, y: 12, rotate: 8, scale: 1.1 }),
            e.photo({
              x: 24,
              y: 30,
              width: 48,
              rotate: -3,
              caption: "hello, you",
            }),
            e.sticker("heart", { x: 16, y: 70, rotate: -6 }),
          ],
        },
        {
          id: "baby-2",
          chapter: "Tiny Milestones",
          eyebrow: "First times",
          heading: "Tiny milestones",
          paper: "grid",
          background: "#f3f8fd",
          body: body(
            "First smile, first laugh, first everything — note them as they come.",
          ),
          elements: [
            e.photo({
              x: 10,
              y: 20,
              width: 40,
              rotate: 5,
              caption: "first smile",
            }),
            e.photo({
              x: 54,
              y: 50,
              width: 40,
              rotate: -5,
              caption: "first steps",
            }),
            e.sticker("flower", { x: 80, y: 22, rotate: 10 }),
          ],
        },
        {
          id: "baby-3",
          chapter: "Watching You Grow",
          eyebrow: "Every day",
          heading: "Watching you grow",
          paper: "grid",
          background: "#f3f8fd",
          body: body(
            "A note about who you're becoming, and everything we hope for you.",
          ),
          elements: [
            e.sticker("heart", { x: 70, y: 60, rotate: 8, scale: 1.4 }),
            e.photo({
              x: 16,
              y: 28,
              width: 44,
              rotate: -3,
              caption: "growing up",
            }),
          ],
        },
      ],
    };
  },
};
