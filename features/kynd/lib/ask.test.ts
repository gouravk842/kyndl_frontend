import { describe, expect, it } from "vitest";

import {
  answerFor,
  ASK_EMPTY,
  keywordsFrom,
  type KyndFact,
  matchFact,
} from "@/features/kynd/lib/ask";

const facts: KyndFact[] = [
  {
    id: "1",
    label: "Lipstick",
    value: "MAC Velvet Teddy",
    keywords: keywordsFrom("Lipstick"),
  },
  {
    id: "2",
    label: "Favourite colour",
    value: "Ivory",
    keywords: keywordsFrom("Favourite colour"),
  },
  {
    id: "3",
    label: "Shoe size",
    value: "UK 5",
    keywords: keywordsFrom("Shoe size"),
  },
  {
    id: "4",
    label: "Restaurant",
    value: "Izumi",
    keywords: keywordsFrom("Restaurant"),
  },
];

describe("matchFact", () => {
  it("matches shade, colour, size, and restaurant wording", () => {
    expect(matchFact("What's her lipstick shade?", facts)?.value).toBe(
      "MAC Velvet Teddy",
    );
    expect(matchFact("What's her favorite color?", facts)?.value).toBe("Ivory");
    expect(matchFact("What size does he wear?", facts)?.value).toBe("UK 5");
    expect(matchFact("Where should we eat?", facts)?.value).toBe("Izumi");
  });

  it("says when nothing is saved", () => {
    expect(answerFor("What's her middle name?", facts)).toBe(ASK_EMPTY);
  });
});
