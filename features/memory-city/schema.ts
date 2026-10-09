/**
 * Memory City — config validation + loading.
 *
 * `parseCityConfig` is the trust boundary: it validates the structural shape of
 * a `CityConfig` and then validates every node's `gate`/`reward` config against
 * the *registered module's own* Zod schema. The seed uses it today; the share
 * flow will reuse it verbatim when loading a `CityConfig` from the backend.
 *
 * Importing this module also imports the module catalogue, guaranteeing the
 * registry is populated before any parse runs.
 */

import "./modules"; // side-effect: register every module before we resolve refs.

import { z } from "zod";

import { requireModule } from "./modules";
import type { CityConfig } from "./types";
import { MOODS } from "./types";

const vec3 = z.tuple([z.number(), z.number(), z.number()]);

const moduleRefSchema = z.object({
  type: z.string().min(1),
  // Validated per-module below; structurally it is just opaque config.
  config: z.unknown(),
});

const nodeShellSchema = z.object({
  kind: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
});

const memoryNodeSchema = z.object({
  id: z.string().min(1),
  districtId: z.string().min(1),
  transform: z.object({
    position: vec3,
    rotationY: z.number().optional(),
    scale: z.number().optional(),
  }),
  shell: nodeShellSchema,
  gate: moduleRefSchema.optional(),
  reward: moduleRefSchema,
  requires: z.array(z.string()).optional(),
});

const themeSchema = z.object({
  horizon: z.string(),
  sky: z.string(),
  accent: z.string(),
  locked: z.string(),
  fogDensity: z.number(),
});

const fillerSchema = z.object({
  position: vec3,
  size: vec3,
  rotationY: z.number(),
  tint: z.number(),
});

const fabricSchema = z.object({
  fillers: z.array(fillerSchema),
  roads: z.array(z.array(vec3)),
  radius: z.number(),
});

const cityConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  from: z.string().optional(),
  to: z.string().optional(),
  theme: themeSchema,
  layout: z.object({
    spline: z.array(vec3).min(2),
    districts: z.array(
      z.object({ id: z.string(), name: z.string(), center: vec3 }),
    ),
  }),
  nodes: z.array(memoryNodeSchema),
  fabric: fabricSchema.optional(),
  mode: z.enum(["play", "edit"]).optional(),
  layoutEngineVersion: z.number().optional(),
});

/** Mood enum exposed for modules that want to reuse it in their own schemas. */
export const moodSchema = z.enum(MOODS);

/**
 * Validate and load a city. Structural errors and per-module config errors both
 * throw a `ZodError`, so a malformed gift fails loudly at load instead of
 * rendering a half-broken world.
 */
export function parseCityConfig(raw: unknown): CityConfig {
  const city = cityConfigSchema.parse(raw) as CityConfig;

  for (const node of city.nodes) {
    validateRef(node.reward, `nodes.${node.id}.reward`);
    if (node.gate) validateRef(node.gate, `nodes.${node.id}.gate`);
  }

  return city;
}

/** Resolve a ref's module and validate its config against that module's schema. */
function validateRef(
  ref: { type: string; config: unknown },
  path: string,
): void {
  const mod = requireModule(ref.type);
  const result = mod.schema.safeParse(ref.config);
  if (!result.success) {
    throw new Error(
      `Memory City: invalid config at ${path} for module "${ref.type}":\n` +
        z.prettifyError(result.error),
    );
  }
  ref.config = result.data; // normalise (defaults applied, extras stripped).
}
