"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useEffect } from "react";
import { ACESFilmicToneMapping } from "three";

import { useAmbientAudio } from "../hooks/use-ambient-audio";
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
 * top (the correct R3F split: 3D in `<Canvas>`, prompts/HUD as DOM siblings).
 * Entering both starts the tour and unlocks audio in the same user gesture.
 */
export function MemoryCityCanvas({
  city,
  autoStart = false,
}: {
  city: CityConfig;
  /** Skip the enter ceremony and begin the revolve immediately (builder preview). */
  autoStart?: boolean;
}) {
  const audio = useAmbientAudio();
  const start = useMemoryCityStore((s) => s.start);

  const onEnter = () => {
    audio.start();
    start();
  };

  // Builder preview: start the revolve on mount, without unlocking audio (browser
  // autoplay policy blocks it anyway, and a silent preview is the right default).
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
      >
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
