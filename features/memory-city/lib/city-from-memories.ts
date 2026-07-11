/**
 * Build a renderable `CityConfig` from meaning-only memories.
 *
 * This is the bridge between authoring and rendering: the builder/backend deal in
 * `CityMemory[]` (dates, moods, words — no coordinates), and this runs the layout
 * engine to derive every world position, district, camera path, road, and filler
 * building, then hands the existing renderer a config it already understands.
 *
 * The result is validated through `parseCityConfig`, so a malformed memory fails
 * loudly rather than rendering a half-broken world.
 */

import { parseCityConfig } from "../schema";
import {
  type CityConfig,
  type CityMemory,
  DEFAULT_THEME,
  type DreamTechTheme,
  type MemoryNode,
  type ModuleRef,
} from "../types";
import { generateLayout, type LayoutParams } from "./layout/generate";
import { makeRng } from "./layout/prng";

/** Meaning-only city document — the shape the builder edits and the backend stores. */
export interface CityDoc {
  id: string;
  title: string;
  from?: string;
  to?: string;
  theme?: DreamTechTheme;
  memories: CityMemory[];
}

const SHELL_KINDS = ["tower", "pavilion", "lantern", "vault"] as const;

/** A default reward built from a memory's own fields when none is authored. */
function defaultReward(m: CityMemory): ModuleRef {
  return {
    type: "message",
    config: {
      title: m.title,
      date: m.date || undefined,
      body: m.body,
      person: m.person || undefined,
      mood: m.mood,
      imageUrl: m.imageUrl || undefined,
    },
  };
}

/**
 * Turn a meaning-only city document into a validated, renderable `CityConfig`.
 * Deterministic: same doc → identical city.
 */
export function buildCityConfig(
  doc: CityDoc,
  params: Partial<LayoutParams> = {},
): CityConfig {
  const layout = generateLayout(
    doc.memories.map((m) => ({ id: m.id, date: m.date })),
    { seed: doc.id, ...params },
  );

  const shellRng = makeRng(`${doc.id}:shells`);
  const byId = new Map(doc.memories.map((m) => [m.id, m]));

  // Emit nodes in chronological order so the tour/index walks the timeline.
  const nodes: MemoryNode[] = layout.order.map((id) => {
    const m = byId.get(id)!;
    const place = layout.placed[id]!;
    return {
      id,
      districtId: `era-${place.eraIndex}`,
      transform: { position: place.position, rotationY: place.rotationY },
      shell: { kind: m.shellKind ?? shellRng.pick(SHELL_KINDS) },
      gate: m.gate,
      reward: m.reward ?? defaultReward(m),
      requires: m.requires,
    };
  });

  const districts = layout.eras.map((era) => ({
    id: `era-${era.index}`,
    name: eraName(era.startDate, era.endDate),
    center: era.center,
  }));

  return parseCityConfig({
    id: doc.id,
    title: doc.title,
    from: doc.from,
    to: doc.to,
    theme: doc.theme ?? DEFAULT_THEME,
    layout: { spline: layout.path, districts },
    nodes,
    fabric: { fillers: layout.fillers, roads: layout.roads, radius: layout.radius },
  });
}

/** Human district name from an era's date range, e.g. "2019" or "2019 – 2021". */
function eraName(startDate: string, endDate: string): string {
  const a = yearOf(startDate);
  const b = yearOf(endDate);
  if (!a && !b) return "The early days";
  if (a && b && a !== b) return `${a} – ${b}`;
  return a || b || "";
}

function yearOf(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  return String(new Date(t).getUTCFullYear());
}
