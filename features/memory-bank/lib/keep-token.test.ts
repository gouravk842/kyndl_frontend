import { describe, expect, it } from "vitest";

import { decodeKeepToken } from "@/features/memory-bank/lib/keep-token";

const token =
  "eyJ1IjoiMTIiLCJwIjoia2VlcCJ9:1xDjwq:4ymHM1kgeQXPvOKFSUz9DqKvNz9p6fzOppl9HL3mU74";

describe("decodeKeepToken", () => {
  it("leaves a decoded signature alone", () => {
    expect(decodeKeepToken(token)).toBe(token);
  });

  it("unwraps the encoding a page param can still be holding", () => {
    expect(decodeKeepToken(encodeURIComponent(token))).toBe(token);
    expect(decodeKeepToken(encodeURIComponent(encodeURIComponent(token)))).toBe(
      token,
    );
  });
});
