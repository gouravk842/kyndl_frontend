import type { ScrapbookStory } from "../types";
import { body, makeElements } from "./content";
import type { TemplateDefinition } from "./types";

export const travelTemplate: TemplateDefinition = {
  id: "adventures",
  name: "Adventures",
  tagline: "Trips, road trips, and far-off places.",
  accent: "#1f6f63",
  build: (): ScrapbookStory => {
    const e = makeElements("trip");
    return {
      templateId: "adventures",
      locked: true,
      title: "Our Adventures",
      subtitle: "Maps, miles, and memories",
      dedication: "To everywhere we went together",
      coverColor: "#1c4a44",
      pages: [
        {
          id: "trip-1",
          chapter: "The Journey Begins",
          eyebrow: "Day one",
          heading: "Where it started",
          paper: "dotted",
          body: body(
            "How the trip came together, the excitement of setting off, the first place you landed…",
          ),
          elements: [
            e.sticker("stamp", { x: 70, y: 10, rotate: 6, label: "DEPART" }),
            e.photo({
              x: 12,
              y: 26,
              width: 44,
              rotate: -4,
              caption: "off we go",
            }),
            e.sticker("ticket", {
              x: 60,
              y: 64,
              rotate: -6,
              label: "BOARDING",
            }),
          ],
        },
        {
          id: "trip-2",
          chapter: "Places We Wandered",
          eyebrow: "Along the way",
          heading: "Places we wandered",
          paper: "dotted",
          body: body(
            "The views, the food, the wrong turns that became the best part.",
          ),
          elements: [
            e.photo({
              x: 8,
              y: 18,
              width: 38,
              rotate: 4,
              caption: "this view",
            }),
            e.photo({
              x: 54,
              y: 30,
              width: 38,
              rotate: -5,
              caption: "right here",
            }),
            e.photo({
              x: 30,
              y: 60,
              width: 38,
              rotate: 3,
              caption: "and this",
            }),
          ],
        },
        {
          id: "trip-3",
          chapter: "Until Next Time",
          eyebrow: "Heading home",
          heading: "Until next time",
          paper: "dotted",
          body: body(
            "What you'll remember most — and where you're going next.",
          ),
          elements: [
            e.sticker("star", { x: 74, y: 18, rotate: 0, scale: 1.3 }),
            e.photo({
              x: 16,
              y: 30,
              width: 44,
              rotate: -3,
              caption: "last one",
            }),
          ],
        },
      ],
    };
  },
};
