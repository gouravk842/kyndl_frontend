import { describe, expect, it } from "vitest";

import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

import {
  anyOverlap,
  CLUSTER_AT,
  layoutSolarBank,
  layoutSolarSky,
  LIST_SUGGEST_AT,
  planetRingCount,
  skyFitsView,
  timeRingCount,
} from "./layout";

function circle(id: string, extras: Partial<MemoryCircle> = {}): MemoryCircle {
  return {
    id,
    name: extras.name ?? id,
    is_loose: extras.is_loose ?? false,
    memory_count: extras.memory_count ?? 3,
    latest_memory: null,
    cover: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
    ...extras,
  };
}

function memory(id: string, extras: Partial<BankMemory> = {}): BankMemory {
  return {
    id,
    circle_id: "c1",
    title: extras.title ?? id,
    note: extras.note ?? "",
    occurred_on: extras.occurred_on ?? "2024-06-01",
    location: extras.location ?? null,
    photos: [],
    created_at: extras.created_at ?? "2024-06-01T00:00:00Z",
    updated_at: extras.updated_at ?? "2024-06-01T00:00:00Z",
    ...extras,
  };
}

const VIEW = { w: 1200, h: 800 };
const MOBILE = { w: 390, h: 720 };

describe("planetRingCount", () => {
  it("scales rings with bank count", () => {
    expect(planetRingCount(1, VIEW.w)).toBe(1);
    expect(planetRingCount(3, VIEW.w)).toBe(1);
    expect(planetRingCount(12, VIEW.w)).toBe(4);
    expect(planetRingCount(12, MOBILE.w)).toBe(3);
  });
});

describe("layoutSolarSky", () => {
  it("places one bank without overlapping You", () => {
    const layout = layoutSolarSky([circle("a", { memory_count: 4 })], VIEW);
    expect(layout.planets).toHaveLength(1);
    expect(layout.rings).toHaveLength(1);
    const planet = layout.planets[0]!;
    const dx = planet.x - layout.cx;
    const dy = planet.y - layout.cy;
    expect(Math.hypot(dx, dy)).toBeGreaterThan(layout.youR + planet.r);
    expect(anyOverlap(layout.planets)).toBe(false);
  });

  it("keeps three banks on one roomy ring", () => {
    const layout = layoutSolarSky(
      [circle("a"), circle("b"), circle("c")],
      VIEW,
    );
    expect(layout.rings).toHaveLength(1);
    expect(layout.planets).toHaveLength(3);
    expect(anyOverlap(layout.planets, 8)).toBe(false);
  });

  it("makes planets larger when few banks orbit", () => {
    const few = layoutSolarSky([circle("a"), circle("b")], VIEW);
    const many = layoutSolarSky(
      Array.from({ length: 12 }, (_, i) => circle(`p-${i}`)),
      VIEW,
    );
    expect(few.planets[0]!.r).toBeGreaterThan(many.planets[0]!.r);
  });

  it("fits twelve banks on four desktop rings without overlap", () => {
    const banks = Array.from({ length: 12 }, (_, i) =>
      circle(`bank-${i}`, { memory_count: i + 1 }),
    );
    const layout = layoutSolarSky(banks, VIEW);
    expect(layout.rings).toHaveLength(4);
    expect(layout.planets).toHaveLength(12);
    expect(anyOverlap(layout.planets, 6)).toBe(false);
    expect(
      new Set(layout.planets.filter((p) => p.ring === 0).map((p) => p.period))
        .size,
    ).toBe(1);
    const zoomed = layoutSolarSky(banks, VIEW, 1.5);
    expect(zoomed.rings[0]!.rx).toBeGreaterThan(layout.rings[0]!.rx);
  });

  it("keeps the default map inside the viewport", () => {
    const banks = Array.from({ length: 8 }, (_, i) =>
      circle(`bank-${i}`, { memory_count: i + 2 }),
    );
    const layout = layoutSolarSky(banks, VIEW);
    expect(skyFitsView(layout, VIEW)).toBe(true);
  });
});

describe("time rings and clustering", () => {
  it("uses one ring for a single memory", () => {
    const memories = [memory("one")];
    expect(timeRingCount(memories)).toBe(1);
    const layout = layoutSolarBank(memories, VIEW);
    expect(layout.rings).toHaveLength(1);
    expect(layout.moons).toHaveLength(1);
    expect(layout.suggestList).toBe(false);
  });

  it("enlarges moons when a bank has few memories", () => {
    const few = layoutSolarBank([memory("same"), memory("other")], VIEW);
    const many = layoutSolarBank(
      Array.from({ length: 8 }, (_, i) => memory(i === 0 ? "same" : `m-${i}`)),
      VIEW,
    );
    const fewMoon = few.moons.find((moon) => moon.id === "same")!;
    const manyMoon = many.moons.find((moon) => moon.id === "same")!;
    expect(fewMoon.r).toBeGreaterThan(manyMoon.r);
  });

  it("returns an empty sun field for zero memories", () => {
    const layout = layoutSolarBank([], VIEW);
    expect(layout.moons).toHaveLength(0);
    expect(layout.rings).toHaveLength(0);
  });

  it("splits a long date span into more rings than a short span", () => {
    const short = Array.from({ length: 12 }, (_, i) =>
      memory(`s-${i}`, {
        occurred_on: `2024-06-${String(i + 1).padStart(2, "0")}`,
      }),
    );
    const long = Array.from({ length: 12 }, (_, i) =>
      memory(`l-${i}`, {
        occurred_on: `${2018 + Math.floor(i / 3)}-06-01`,
      }),
    );
    expect(timeRingCount(short)).toBeLessThan(timeRingCount(long));
    expect(timeRingCount(long)).toBe(4);
    const laid = layoutSolarBank(long, VIEW);
    expect(laid.rings.length).toBeGreaterThanOrEqual(3);
    expect(anyOverlap(laid.moons, 4)).toBe(false);
  });

  it("clusters a crowded ring and can expand it", () => {
    const memories = Array.from({ length: CLUSTER_AT + 4 }, (_, i) =>
      memory(`m-${i}`, { occurred_on: "2024-01-01" }),
    );
    const clustered = layoutSolarBank(memories, VIEW);
    expect(clustered.moons.some((moon) => moon.clustered)).toBe(true);
    expect(clustered.hiddenCount).toBeGreaterThan(0);
    const expanded = layoutSolarBank(memories, VIEW, {}, { expandRing: 0 });
    expect(expanded.moons.every((moon) => !moon.clustered)).toBe(true);
    expect(expanded.moons).toHaveLength(memories.length);
  });

  it("suggests list past 60 memories and still lays out", () => {
    const memories = Array.from({ length: LIST_SUGGEST_AT + 1 }, (_, i) =>
      memory(`big-${i}`, {
        occurred_on: `${2010 + (i % 14)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
      }),
    );
    const layout = layoutSolarBank(memories, VIEW);
    expect(layout.suggestList).toBe(true);
    expect(layout.moons.length).toBeGreaterThan(0);
    expect(layout.moons.length).toBeLessThan(memories.length);
    expect(anyOverlap(layout.moons, 2)).toBe(false);
  });
});
