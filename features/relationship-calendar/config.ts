import type {
  CalendarEvent,
  EventCategory,
  RelationshipCalendarDoc,
} from "./types";

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  anniversary: "Anniversary",
  date: "Date night",
  trip: "Trip",
  milestone: "Milestone",
  everyday: "Everyday",
  custom: "Custom",
};

/** Soft gold / rose glyphs drawn as CSS — no emoji, no religious iconography. */
export const CATEGORY_GLYPH: Record<EventCategory, string> = {
  anniversary: "♥",
  date: "✦",
  trip: "◈",
  milestone: "❋",
  everyday: "◌",
  custom: "✧",
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  anniversary: "#B11226",
  date: "#C75B39",
  trip: "#8B6B4A",
  milestone: "#D4A373",
  everyday: "#92786C",
  custom: "#6B4F45",
};

export const MAX_VISIBLE_TITLES = 2;

/** Guided starter ideas — open the add-memory form with title/category filled in. */
export type MemoryPrompt = {
  id: string;
  title: string;
  /** Soft placeholder for the note field — user rewrites in their voice. */
  hint: string;
  category: EventCategory;
  recursYearly?: boolean;
};

export const MEMORY_PROMPTS: MemoryPrompt[] = [
  {
    id: "first-met",
    title: "The day we met",
    hint: "Where were you? What do you still remember about that first hello?",
    category: "milestone",
  },
  {
    id: "first-date",
    title: "Our first date",
    hint: "The place, the nerves, the moment it started to feel easy.",
    category: "date",
  },
  {
    id: "said-it",
    title: "The day I knew",
    hint: "When it stopped being casual — what tipped you over?",
    category: "milestone",
  },
  {
    id: "first-trip",
    title: "First trip together",
    hint: "A city, a train, a wrong turn that became the story.",
    category: "trip",
  },
  {
    id: "anniversary",
    title: "Our anniversary",
    hint: "The date you keep coming back to — every year.",
    category: "anniversary",
    recursYearly: true,
  },
  {
    id: "hard-day",
    title: "A hard day we got through",
    hint: "Not perfect — just us, still choosing each other.",
    category: "everyday",
  },
  {
    id: "favorite-ordinary",
    title: "An ordinary favorite day",
    hint: "Nothing big happened. That’s why it mattered.",
    category: "everyday",
  },
  {
    id: "laugh",
    title: "We couldn’t stop laughing",
    hint: "The joke, the place, the tears — write it before you forget.",
    category: "date",
  },
];

/** Marketing / embed sample — August 2026 vignette matching the reference layout. */
export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "s1",
    date: "2026-08-02",
    title: "Friendship Day",
    note: "The day we stopped pretending we were just friends.",
    category: "milestone",
  },
  {
    id: "s2",
    date: "2026-08-09",
    title: "First dinner",
    note: "That tiny place with the bad lighting and perfect pasta.",
    category: "date",
  },
  {
    id: "s3",
    date: "2026-08-15",
    title: "Independence Day",
    note: "Flags, fireworks, and your hand in mine.",
    category: "everyday",
  },
  {
    id: "s4",
    date: "2026-08-17",
    title: "Rain walk",
    note: "We got soaked and didn't mind.",
    category: "everyday",
  },
  {
    id: "s5",
    date: "2026-08-22",
    title: "Beach trip",
    note: "Salt air and a shared playlist.",
    category: "trip",
  },
  {
    id: "s6",
    date: "2026-08-28",
    title: "Our anniversary",
    note: "One year of choosing each other.",
    category: "anniversary",
    recursYearly: true,
  },
];

export const SAMPLE_DOC: RelationshipCalendarDoc = {
  title: "Our Calendar",
  subtitle: "moments that made us",
  partnerNames: "",
  weekStartsOn: 0,
  togetherSince: "2024-08-28",
  events: SAMPLE_EVENTS,
};

export function starterDoc(): RelationshipCalendarDoc {
  return {
    title: "Our Calendar",
    subtitle: "moments that made us",
    partnerNames: "",
    weekStartsOn: 0,
    togetherSince: "",
    events: [],
  };
}
