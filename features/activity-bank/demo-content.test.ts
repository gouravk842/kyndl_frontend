import { describe, expect, it } from "vitest";

import {
  applyDesireDeck,
  applyLudoActivities,
  applySnakes,
  applyThisOrThat,
} from "./demo-content";
import type { BankItem } from "./types";

function item(
  partial: Partial<BankItem> & Pick<BankItem, "kind" | "text">,
): BankItem {
  return {
    id: partial.id ?? 1,
    kind: partial.kind,
    text: partial.text,
    detail: partial.detail ?? "",
    type: partial.type ?? {
      slug: "romantic",
      label: "Romantic",
      isAdult: false,
    },
    tags: partial.tags ?? [],
    imageFileId: null,
    imageUrl: null,
    choices: partial.choices ?? [],
  };
}

describe("demo bank mapping", () => {
  it("fills deck cards from choiceless lines and leaves the rest of the sample", () => {
    const base = {
      recipientName: "you",
      deckTitle: "for us",
      intro: "intro",
      outro: "outro",
      cards: [
        { id: 1, heat: "wild" as const, rotation: 1, prompt: "sample one" },
        { id: 2, heat: "sweet" as const, rotation: 2, prompt: "sample two" },
      ],
    };
    const next = applyDesireDeck(
      [
        item({
          id: 7,
          kind: "dare",
          text: "From the bank",
          type: { slug: "sexual", label: "Sexual", isAdult: true },
        }),
      ],
      base,
    );
    expect(next.cards[0]?.prompt).toBe("From the bank");
    expect(next.cards[0]?.heat).toBe("spicy");
    expect(next.cards[1]?.prompt).toBe("sample two");
  });

  it("keeps the snakes finale and writes dares onto earlier squares", () => {
    const base = {
      recipientName: "you",
      gameTitle: "Snakes",
      intro: "intro",
      squares: [
        { id: 1, heat: "sweet" as const, name: "Old", note: "old" },
        { id: 100, heat: "wild" as const, name: "Climax", note: "finale" },
      ],
    };
    const next = applySnakes(
      [item({ kind: "dare", text: "New dare", detail: "How to" })],
      base,
    );
    expect(next.squares[0]).toMatchObject({
      name: "New dare",
      note: "How to",
      heat: "sweet",
    });
    expect(next.squares[1]).toMatchObject({ name: "Climax", note: "finale" });
  });

  it("turns two-choice truths into this-or-that pairs", () => {
    const base = {
      title: "This or That",
      intro: "intro",
      pairs: [{ id: "p1", left: "A", right: "B" }],
      resultBlurb: "done",
    };
    const next = applyThisOrThat(
      [
        item({
          kind: "truth",
          text: "Chai or Coffee?",
          choices: ["Chai", "Coffee"],
        }),
      ],
      base,
    );
    expect(next.pairs).toEqual([{ id: "p1", left: "Chai", right: "Coffee" }]);
  });

  it("sorts non-adult lines into ludo decks and skips choice pairs", () => {
    const base = {
      enabled: true,
      intensity: "mixed" as const,
      triggers: { star: true, capture: true, home: true, sixes: true },
      decks: { sweet: ["keep"], fun: ["keep"], spicy: ["keep"] },
    };
    const next = applyLudoActivities(
      [
        item({
          kind: "dare",
          text: "A playful dare for the board",
          type: { slug: "playful", label: "Playful", isAdult: false },
        }),
        item({
          kind: "truth",
          text: "Chai or Coffee?",
          choices: ["Chai", "Coffee"],
        }),
        item({
          kind: "dare",
          text: "Adult only",
          type: { slug: "sexual", label: "Sexual", isAdult: true },
        }),
      ],
      base,
    );
    expect(next.decks.fun).toEqual(["A playful dare for the board"]);
    expect(next.decks.sweet).toEqual(["keep"]);
    expect(next.decks.spicy).toEqual(["keep"]);
  });
});
