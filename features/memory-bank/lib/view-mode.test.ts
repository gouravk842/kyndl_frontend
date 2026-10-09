import { describe, expect, it } from "vitest";

import { nextMemoryBankView } from "./view-mode";

describe("nextMemoryBankView", () => {
  it("cycles solar → molecule → list → solar", () => {
    expect(nextMemoryBankView("solar")).toBe("molecule");
    expect(nextMemoryBankView("molecule")).toBe("list");
    expect(nextMemoryBankView("list")).toBe("solar");
  });
});
