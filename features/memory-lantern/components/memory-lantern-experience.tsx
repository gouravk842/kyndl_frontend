"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { type LanternConfig, SAMPLE_LANTERN } from "../config";
import { hasWebGL, type PerfTier, perfTier } from "../lib/device";
import { LanternFallback } from "./lantern-fallback";

// R3F touches the DOM/WebGL on mount, so the canvas is client-only. `ssr: false`
// must live inside a Client Component (Next 16 rule) — same pattern as Memory
// City's canvas.
const LanternCanvas = dynamic(
  () => import("./lantern-canvas").then((m) => m.LanternCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0710]">
        <p className="animate-pulse font-serif text-2xl text-[#f0c48a]">
          lighting the lantern…
        </p>
      </div>
    ),
  },
);

/**
 * Entry point for the Memory Lantern experience.
 *
 * Reads a {@link LanternConfig} (defaults to the bundled sample so the marketing
 * page renders without wiring); the public viewer of a saved creation and the
 * builder's live preview both pass their own config here.
 *
 * Chooses its renderer by capability: the WebGL lantern where it's supported (at
 * a device-appropriate perf tier), the CSS-3D {@link LanternFallback} where it
 * isn't. Both honour `prefers-reduced-motion`.
 */
export function MemoryLanternExperience({
  config = SAMPLE_LANTERN,
  assets,
}: {
  config?: LanternConfig;
  /** Resolved photo URLs keyed by fileId (presigned assets + local previews). */
  assets?: Record<string, string>;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  // Detected on mount (client-only) — `null` until then, so we render the WebGL
  // path optimistically and only swap to the fallback if it's genuinely absent.
  const [env, setEnv] = useState<{ webgl: boolean; tier: PerfTier } | null>(null);
  useEffect(() => {
    // One-shot client capability probe. Kept in an effect (not a lazy initializer)
    // so the server and first client paint agree on the optimistic WebGL path and
    // we only swap to the fallback after hydration — no mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnv({ webgl: hasWebGL(), tier: perfTier() });
  }, []);

  if (env && !env.webgl) {
    return (
      <LanternFallback
        config={config}
        mediaUrls={assets}
        reducedMotion={reducedMotion}
      />
    );
  }

  return (
    <LanternCanvas
      config={config}
      mediaUrls={assets}
      tier={env?.tier ?? "high"}
      reducedMotion={reducedMotion}
    />
  );
}
