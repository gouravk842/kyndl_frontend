import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";

import {
  postAuthDestination,
  safeInternalPath,
  withCallbackUrl,
} from "./navigation";

describe("safeInternalPath", () => {
  it("allows same-origin relative paths", () => {
    expect(safeInternalPath("/checkout")).toBe("/checkout");
    expect(safeInternalPath("/dashboard?new=scrapbook")).toBe(
      "/dashboard?new=scrapbook",
    );
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeInternalPath("https://evil.com")).toBeNull();
    expect(safeInternalPath("//evil.com")).toBeNull();
    expect(safeInternalPath("/\\evil.com")).toBeNull();
  });
});

describe("withCallbackUrl", () => {
  it("appends a validated callback", () => {
    expect(withCallbackUrl("/login", "/checkout")).toBe(
      "/login?callbackUrl=%2Fcheckout",
    );
  });

  it("drops unsafe callbacks", () => {
    expect(withCallbackUrl("/login", "https://evil.com")).toBe("/login");
  });
});

describe("postAuthDestination", () => {
  it("returns the callback when it is a safe internal path", () => {
    expect(postAuthDestination("/checkout")).toBe("/checkout");
    expect(postAuthDestination("/gifts/orders?recommend=1")).toBe(
      "/gifts/orders?recommend=1",
    );
  });

  it("falls back to the dashboard when the callback is missing or unsafe", () => {
    expect(postAuthDestination(null)).toBe(ROUTES.dashboard);
    expect(postAuthDestination("https://evil.com")).toBe(ROUTES.dashboard);
  });

  it("does not send a signed-in user back onto an auth page", () => {
    expect(postAuthDestination("/login")).toBe(ROUTES.dashboard);
    expect(postAuthDestination("/register?callbackUrl=%2Fcheckout")).toBe(
      ROUTES.dashboard,
    );
    expect(postAuthDestination("/forgot-password")).toBe(ROUTES.dashboard);
  });
});
