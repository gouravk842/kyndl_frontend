/**
 * Unlock modules — the registry.
 *
 * A single process-wide map from module `type` to its contract. Every host
 * (Memory City's 3D world, the Constellation sky, …) resolves a node's
 * `gate`/`reward` refs through here, the loader validates configs through here,
 * and the builder lists placeable modules through here. Because lookup is by
 * string key, a new gate becomes available the moment its module file is
 * imported and registered — nothing else in the codebase needs to know it
 * exists.
 *
 * Modules self-register on import. The barrel (`index.ts`) imports each one so a
 * single `import "@/features/unlocks"` wires the whole catalogue.
 */

import type { MemoryModule, ModuleKind } from "./types";

// Generic-erased storage; typed access is restored at the register/get edges.
const registry = new Map<string, MemoryModule<unknown>>();

/**
 * Register a module. Throws on a duplicate `type` so collisions surface at
 * startup rather than silently shadowing an existing game.
 */
export function registerModule<TConfig>(module: MemoryModule<TConfig>): void {
  if (registry.has(module.type)) {
    throw new Error(
      `Memory City: module type "${module.type}" is already registered.`,
    );
  }
  registry.set(module.type, module as MemoryModule<unknown>);
}

/** Look up a module by type, or `undefined` if none is registered. */
export function getModule(type: string): MemoryModule<unknown> | undefined {
  return registry.get(type);
}

/** Look up a module by type, throwing if it is missing (loader / renderer use). */
export function requireModule(type: string): MemoryModule<unknown> {
  const found = registry.get(type);
  if (!found) {
    throw new Error(
      `Memory City: no module registered for type "${type}". ` +
        `Did you forget to import it in modules/index.ts?`,
    );
  }
  return found;
}

/** True if a module type is registered. */
export function hasModule(type: string): boolean {
  return registry.has(type);
}

/**
 * All registered modules, optionally filtered by the role they can play. Used by
 * the builder to populate the gate / reward palettes.
 */
export function listModules(kind?: ModuleKind): MemoryModule<unknown>[] {
  const all = [...registry.values()];
  if (!kind) return all;
  return all.filter((m) => m.kind === kind || m.kind === "both");
}
