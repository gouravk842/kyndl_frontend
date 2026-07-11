import type { ScrapbookStory } from "../types";
import { body, makeElements } from "./content";
import type { TemplateDefinition } from "./types";

export const birthdayTemplate: TemplateDefinition = {
  id: "birthday",
  name: "Happy Birthday",
  tagline: "Celebrate someone's special day.",
  accent: "#7b3fb0",
  build: (): ScrapbookStory => {
    const e = makeElements("bday");
    return {
      templateId: "birthday",
      locked: true,
      title: "Happy Birthday!",
      subtitle: "A little book of wishes",
      dedication: "To you, on your special day",
      coverColor: "#5b2a86",
      pages: [
        {
          id: "bday-1",
          chapter: "Another Year",
          eyebrow: "Celebrating you",
          heading: "Another year of you",
          paper: "plain",
          background: "#fdf3fb",
          body: body(
            "Say what makes them so easy to celebrate — the things everyone loves about them.",
          ),
          elements: [
            e.sticker("star", { x: 20, y: 10, rotate: -8, scale: 1.2 }),
            e.sticker("star", { x: 78, y: 16, rotate: 10, scale: 0.9 }),
            e.photo({
              x: 28,
              y: 32,
              width: 46,
              rotate: -3,
              caption: "the birthday star",
            }),
          ],
        },
        {
          id: "bday-2",
          chapter: "Favourite Memories",
          eyebrow: "This year",
          heading: "Favourite memories",
          paper: "plain",
          background: "#fdf3fb",
          body: body(
            "The moments that made the year — the funny ones, the proud ones, the small ones.",
          ),
          elements: [
            e.photo({
              x: 10,
              y: 22,
              width: 40,
              rotate: 5,
              caption: "remember this?",
            }),
            e.photo({
              x: 54,
              y: 50,
              width: 40,
              rotate: -6,
              caption: "and this!",
            }),
            e.sticker("heart", { x: 80, y: 20, rotate: 8 }),
          ],
        },
        {
          id: "bday-3",
          chapter: "Wishes",
          eyebrow: "From me to you",
          heading: "My wish for you",
          paper: "plain",
          background: "#fdf3fb",
          body: body("Everything you hope this next year brings them."),
          elements: [
            e.sticker("star", { x: 68, y: 58, rotate: 6, scale: 1.4 }),
            e.photo({
              x: 16,
              y: 28,
              width: 44,
              rotate: -3,
              caption: "make a wish",
            }),
          ],
        },
      ],
    };
  },
};
