import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDateLocal, formatDateTimeLocal, parseApiDate } from "./datetime";

describe("parseApiDate", () => {
  it("keeps Z-suffixed UTC instants", () => {
    const d = parseApiDate("2026-10-11T06:58:00Z");
    expect(d?.toISOString()).toBe("2026-10-11T06:58:00.000Z");
  });

  it("treats offset-less API strings as UTC", () => {
    const d = parseApiDate("2026-10-11T06:58:00");
    expect(d?.toISOString()).toBe("2026-10-11T06:58:00.000Z");
  });

  it("parses YYYY-MM-DD as a local calendar day", () => {
    const d = parseApiDate("2026-10-11");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(9);
    expect(d!.getDate()).toBe(11);
  });

  it("returns null for junk", () => {
    expect(parseApiDate("not-a-date")).toBeNull();
    expect(parseApiDate("")).toBeNull();
    expect(parseApiDate(null)).toBeNull();
  });
});

describe("formatInUserTz", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders UTC in the viewer timezone", () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      ...new Intl.DateTimeFormat().resolvedOptions(),
      timeZone: "Asia/Kolkata",
    });

    // 06:58 UTC → 12:28 IST
    expect(formatDateTimeLocal("2026-10-11T06:58:00Z")).toMatch(/12:28/);
    expect(formatDateLocal("2026-10-11T06:58:00Z")).toMatch(/Oct/);
  });
});
