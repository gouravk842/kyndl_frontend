"use client";

import { useReducedMotion } from "framer-motion";

import { type LanternConfig, SAMPLE_LANTERN } from "../config";
import { MemoryStage } from "./stage/memory-stage";

/**
 * Entry point for the Memory Lantern.
 *
 * `ceremony` plays the full opening — curtains, the searching light, the
 * dedication — which is what a recipient and the catalog embed see. The
 * builder's side-by-side preview passes `ceremony={false}` so the podium is
 * already lit while captions are typed.
 */
export function MemoryLanternExperience({
  config = SAMPLE_LANTERN,
  assets,
  ceremony = true,
}: {
  config?: LanternConfig;
  /** Resolved photo URLs keyed by fileId (presigned assets + local previews). */
  assets?: Record<string, string>;
  /** When false, skip the closed-curtain opening and start on the podium. */
  ceremony?: boolean;
}) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MemoryStage
      config={config}
      assets={assets}
      reducedMotion={reducedMotion}
      ceremony={ceremony}
    />
  );
}
