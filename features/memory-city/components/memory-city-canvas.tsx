"use client";

import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect, useRef } from "react";
import { ACESFilmicToneMapping } from "three";

import { useAmbientAudio } from "../hooks/use-ambient-audio";
import { useRenderQualityBootstrap } from "../hooks/use-render-quality";
import { useMemoryCityStore } from "../store";
import type { CityConfig } from "../types";
import { CityScene } from "./scene/city-scene";
import { EnterPrompt } from "./ui/enter-prompt";
import { Hud } from "./ui/hud";
import { ModuleSurface } from "./ui/module-surface";
import { CityFinale, CollectedToast } from "./ui/progression";
import { TourControls } from "./ui/tour-controls";

/**
 * Mounts the WebGL city inside a Rapier physics world and layers the DOM UI on
 * top. Adaptive DPR + PerformanceMonitor drive the quality tier.
 */
export function MemoryCityCanvas({
  city,
  autoStart = false,
  progressKey,
}: {
  city: CityConfig;
  /** Skip the enter ceremony and begin the revolve immediately (builder preview). */
  autoStart?: boolean;
  /** localStorage progress id (creation id or public token). */
  progressKey?: string | null;
}) {
  const audio = useAmbientAudio();
  const start = useMemoryCityStore((s) => s.start);
  const hydrateProgress = useMemoryCityStore((s) => s.hydrateProgress);
  const setForceGallery = useMemoryCityStore((s) => s.setForceGallery);
  const setGrowingNodeIds = useMemoryCityStore((s) => s.setGrowingNodeIds);
  const prevNodeIds = useRef<Set<string>>(new Set());

  useRenderQualityBootstrap();

  // Clear any sticky gallery fallback from a prior mount in this tab.
  useEffect(() => {
    setForceGallery(false);
  }, [setForceGallery]);

  useEffect(() => {
    hydrateProgress(progressKey ?? city.id);
  }, [progressKey, city.id, hydrateProgress]);

  // Growth choreography: newly appeared node ids rise from the ground.
  useEffect(() => {
    const ids = city.nodes.map((n) => n.id);
    const prev = prevNodeIds.current;
    if (prev.size > 0) {
      const added = ids.filter((id) => !prev.has(id));
      if (added.length) setGrowingNodeIds(added);
    }
    prevNodeIds.current = new Set(ids);
  }, [city.nodes, setGrowingNodeIds]);

  const onEnter = () => {
    audio.start();
    start();
  };

  useEffect(() => {
    if (autoStart) start();
  }, [autoStart, start]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b0a1a]">
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        camera={{ fov: 66, near: 0.1, far: 240, position: [0, 7, 4] }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ gl }) => {
          const el = gl.domElement;
          const onLost = (e: Event) => {
            e.preventDefault();
            setForceGallery(true);
          };
          el.addEventListener("webglcontextlost", onLost);
        }}
      >
        <AdaptiveDpr pixelated />
        <PerformanceMonitor
          onDecline={() => {
            // Soften quality only — never force the 2D gallery on load stutter
            // (asset loading tanks FPS and would blank the gift).
            useMemoryCityStore.setState((s) => ({
              quality:
                s.quality === "high"
                  ? "med"
                  : s.quality === "med"
                    ? "low"
                    : "low",
            }));
          }}
          onIncline={() => {
            useMemoryCityStore.setState((s) => ({
              quality:
                s.quality === "low"
                  ? "med"
                  : s.quality === "med"
                    ? "high"
                    : "high",
            }));
          }}
        />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} timeStep="vary">
            <CityScene city={city} audio={audio} />
          </Physics>
        </Suspense>
      </Canvas>

      <EnterPrompt city={city} onEnter={onEnter} />
      <Hud city={city} />
      <TourControls city={city} />
      <CollectedToast city={city} />
      <ModuleSurface city={city} />
      <CityFinale city={city} />
    </div>
  );
}
