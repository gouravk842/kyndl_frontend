import { describe, expect, it } from "vitest";

import {
  canonicalShareUrl,
  guestCanOpen,
  shareText,
  whatsappShareHref,
} from "./share-link";

describe("guestCanOpen", () => {
  it("allows public links with no invites", () => {
    expect(guestCanOpen("public", [])).toBe(true);
  });

  it("blocks invite-only with an empty list", () => {
    expect(guestCanOpen("invite", [])).toBe(false);
    expect(guestCanOpen("invite", ["  "])).toBe(false);
  });

  it("allows invite-only once an email is listed", () => {
    expect(guestCanOpen("invite", ["partner@example.com"])).toBe(true);
  });
});

describe("canonicalShareUrl", () => {
  it("prefers an absolute server share_url", () => {
    expect(
      canonicalShareUrl({
        share_url: "https://kyndl.in/v/abc123",
        public_token: "abc123",
      }),
    ).toBe("https://kyndl.in/v/abc123");
  });

  it("builds an absolute URL when share_url is missing or relative", () => {
    expect(
      canonicalShareUrl({ share_url: "/v/abc123", public_token: "abc123" }),
    ).toMatch(/\/v\/abc123$/);
    expect(canonicalShareUrl({ public_token: "abc123" })).toMatch(
      /\/v\/abc123$/,
    );
  });
});

describe("whatsappShareHref", () => {
  it("encodes a paste-ready message", () => {
    const href = whatsappShareHref("https://kyndl.in/v/abc", "Our year");
    expect(href.startsWith("https://wa.me/?text=")).toBe(true);
    expect(decodeURIComponent(href.split("text=")[1])).toBe(
      shareText("Our year", "https://kyndl.in/v/abc"),
    );
  });
});
