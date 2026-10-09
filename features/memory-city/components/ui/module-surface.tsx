"use client";

import "../../modules"; // ensure every module is registered before we map surfaces.

import type { ComponentType } from "react";
import { createElement, lazy, Suspense } from "react";

import type { ModuleInteractionProps } from "../../modules";
import { listModules } from "../../modules";
import { useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";

/**
 * Lazy interaction surface per module type, built once at module load (not
 * during render — React requires component identities to be stable). Every
 * registered module with an `Interaction` gets an entry, so a new game's surface
 * is wired automatically the moment its module is imported.
 */
const SURFACES = new Map<string, ComponentType<ModuleInteractionProps>>(
  listModules()
    .filter((m) => m.Interaction)
    .map((m) => [m.type, lazy(m.Interaction!)]),
);

/**
 * The single overlay host for every module interaction.
 *
 * It reads the active node + phase from the store, resolves the matching
 * `ModuleRef` (the node's `gate` while solving, its `reward` once unlocked), and
 * mounts that module's `Interaction` surface — passing `onSolve` (advance a
 * gate) and `onClose`. The host knows nothing about specific games.
 */
export function ModuleSurface({ city }: { city: CityConfig }) {
  const activeNodeId = useMemoryCityStore((s) => s.activeNodeId);
  const activePhase = useMemoryCityStore((s) => s.activePhase);
  const solveGate = useMemoryCityStore((s) => s.solveGate);
  const close = useMemoryCityStore((s) => s.close);

  const node = activeNodeId
    ? city.nodes.find((n) => n.id === activeNodeId)
    : null;
  const ref = node && activePhase === "gate" ? node.gate : node?.reward;
  // Pre-built lazy component (stable identity from SURFACES); not created here.
  const surface = ref ? SURFACES.get(ref.type) : undefined;

  if (!ref || !surface) return null;

  return (
    <Suspense fallback={null}>
      {createElement(surface, {
        config: ref.config,
        onSolve: solveGate,
        onClose: close,
      })}
    </Suspense>
  );
}
