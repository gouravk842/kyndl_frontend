"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useMemo } from "react";
import { ACESFilmicToneMapping } from "three";

import type { LanternConfig } from "../config";
import { useLanternDrag } from "../hooks/use-lantern-drag";
import { computeAmbience } from "../lib/ambience";
import type { PerfTier } from "../lib/device";
import { useLanternStore } from "../store";
import { Lantern } from "./scene/lantern";
import { RoomLight } from "./scene/room-light";

/**
 * Mounts the WebGL lantern and layers the DOM UI on top (the R3F split: 3D in
 * `<Canvas>`, title/caption as DOM siblings). The front-facet caption is driven
 * off the shared store — the lantern publishes which facet is turned toward the
 * viewer, and it fades in here below the glass.
 */
export function LanternCanvas({
  config,
  mediaUrls,
  tier = "high",
  reducedMotion = false,
}: {
  config: LanternConfig;
  mediaUrls?: Record<string, string>;
  tier?: PerfTier;
  reducedMotion?: boolean;
}) {
  const low = tier === "low";

  const activeId = useLanternStore((s) => s.activePaneId);
  const active = config.panes.find((p) => p.id === activeId) ?? null;

  // Reduced motion: stop the idle spin. Dragging still works, so the keepsake
  // stays explorable — it just never moves on its own.
  const setPaused = useLanternStore((s) => s.setPaused);
  useEffect(() => setPaused(reducedMotion), [reducedMotion, setPaused]);

  const seen = useLanternStore((s) => s.seen);
  const total = config.panes.length;
  const allSeen = total > 0 && Object.keys(seen).length >= total;
  const finale = config.finale;
  const showFinale = allSeen && !!finale?.heading;

  // Computed once on mount: dims/warms by the viewer's local hour, flares on the
  // anniversary. Static per view, so it never touches the per-frame path.
  const ambience = useMemo(() => computeAmbience(config.ambience), [config.ambience]);

  const drag = useLanternDrag();

  return (
    <div
      className="relative h-full w-full cursor-grab touch-none overflow-hidden bg-[#0a0710] select-none active:cursor-grabbing"
      {...drag}
    >
      <Canvas
        dpr={low ? [1, 1.5] : [1, 2]}
        camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0.15, 4.4] }}
        gl={{
          antialias: !low,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Seed colours — RoomLight mutates these toward the front memory's glow. */}
        <color attach="background" args={["#0a0710"]} />
        <fog attach="fog" args={["#0a0710", 5, 12]} />
        <RoomLight intensity={ambience.intensity + (ambience.flare ? 0.25 : 0)} />

        <Suspense fallback={null}>
          <Lantern
            config={config}
            mediaUrls={mediaUrls}
            reducedMotion={reducedMotion}
          />
        </Suspense>

        {/* Low tier keeps the glow (the whole point) but drops the pricey
            multisampling + mipmap bloom for frame rate on phones. */}
        <EffectComposer multisampling={low ? 0 : 4}>
          <Bloom
            intensity={ambience.flare ? 1.35 : low ? 0.75 : 0.9}
            luminanceThreshold={0.35}
            luminanceSmoothing={0.3}
            mipmapBlur={!low}
          />
          <Vignette eskil={false} offset={0.28} darkness={0.86} />
        </EffectComposer>
      </Canvas>

      {/* Title */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[max(2rem,env(safe-area-inset-top))] text-center">
        <h1 className="font-serif text-2xl tracking-wide text-[#f6efdd] sm:text-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.7)]">
          {config.title}
        </h1>
        <p className="font-serif mt-1 text-sm text-[#cdbfb0] [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">
          {config.subtitle}
        </p>
      </header>

      {/* The front facet's caption — wakes as it turns to face the viewer.
          Gives way to the finale once every facet has been seen. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-[max(2.2rem,env(safe-area-inset-bottom))] text-center">
        <AnimatePresence mode="wait">
          {showFinale ? (
            <motion.div
              key="finale"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-md"
            >
              <p className="font-serif text-xl text-[#f6efdd] [text-shadow:0_1px_14px_rgba(0,0,0,0.9)]">
                {finale?.heading}
              </p>
              {finale?.body ? (
                <p className="font-serif mt-1.5 text-base leading-relaxed text-[#e7d8c4] [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
                  {finale.body}
                </p>
              ) : null}
            </motion.div>
          ) : active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-serif text-lg text-[#f6efdd] [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
                {active.caption}
              </p>
              {active.date ? (
                <p className="mt-0.5 text-xs font-medium tracking-[0.2em] text-[#b8a68f] uppercase">
                  {active.date}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
