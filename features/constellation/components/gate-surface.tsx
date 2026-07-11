"use client";

import "@/features/unlocks"; // ensure every gate is registered before we map surfaces.

import type { ComponentType } from "react";
import { createElement, lazy, Suspense } from "react";

import type { ModuleInteractionProps } from "@/features/unlocks";
import { listModules } from "@/features/unlocks";

/**
 * The overlay host for a star's gate challenge.
 *
 * A lazy interaction component per gate type is built once at module load (not
 * during render — React needs stable component identities), so a new gate's
 * surface is wired the moment its module is imported. When a gated star is
 * tapped, the experience mounts this with the resolved `type` + `config`;
 * `onSolve` clears the gate (the memory opens) and `onClose` dismisses it.
 */
const SURFACES = new Map<string, ComponentType<ModuleInteractionProps>>(
  listModules("gate")
    .filter((m) => m.Interaction)
    .map((m) => [m.type, lazy(m.Interaction!)]),
);

type GateSurfaceProps = {
  type: string;
  config: unknown;
  onSolve: () => void;
  onClose: () => void;
};

export function GateSurface({
  type,
  config,
  onSolve,
  onClose,
}: GateSurfaceProps) {
  const surface = SURFACES.get(type);
  if (!surface) return null;

  return (
    <Suspense fallback={null}>
      {createElement(surface, { config, onSolve, onClose })}
    </Suspense>
  );
}
