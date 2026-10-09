import { describe, expect, it } from "vitest";

import { placeholderSlug } from "./placeholder";

describe("placeholderSlug", () => {
  it("is stable for the same seed", () => {
    expect(placeholderSlug("asha")).toBe(placeholderSlug("asha"));
  });

  it("picks from the keepsake set", () => {
    expect(placeholderSlug("memory-1")).toMatch(
      /^(fox|hare|swan|dove|cat|moon|lantern|star)$/,
    );
  });
});
