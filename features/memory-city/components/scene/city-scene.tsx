import {
  Bloom,
  BrightnessContrast,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  HueSaturation,
  N8AO,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense } from "react";
import { Vector2 } from "three";

import type { AmbientAudio } from "../../hooks/use-ambient-audio";
import { useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";
import { AmbientLife } from "./ambient-life";
import { CityEnvironment } from "./city-environment";
import { CityGround } from "./city-ground";
import { KitFabric } from "./kit-fabric";
import { NodeBuilding } from "./node-building";
import { RevolveCamera } from "./revolve-camera";
import { RoamPlayer } from "./roam-player";

const CA_OFFSET = new Vector2(0.0006, 0.0006);

function Navigation({
  city,
  audio,
}: {
  city: CityConfig;
  audio: AmbientAudio;
}) {
  const mode = useMemoryCityStore((s) => s.mode);
  return mode === "roam" ? (
    <RoamPlayer city={city} audio={audio} />
  ) : (
    <RevolveCamera city={city} audio={audio} />
  );
}

function CityPost() {
  const quality = useMemoryCityStore((s) => s.quality);
  const arrived = useMemoryCityStore((s) => s.arrived);
  const focusDistance = useMemoryCityStore((s) => s.focusDistance);

  if (quality === "low") {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.22} darkness={0.85} />
        <SMAA />
      </EffectComposer>
    );
  }

  if (quality === "med") {
    return (
      <EffectComposer multisampling={0}>
        <N8AO aoRadius={1.2} intensity={1.6} distanceFalloff={1} halfRes />
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.32}
          mipmapBlur
        />
        <HueSaturation saturation={0.08} hue={0} />
        <BrightnessContrast brightness={0.01} contrast={0.12} />
        <Vignette eskil={false} offset={0.22} darkness={0.9} />
        <SMAA />
      </EffectComposer>
    );
  }

  // DoF only when framed — a mis-focused CoC can wash the whole city to black.
  if (!arrived) {
    return (
      <EffectComposer multisampling={0}>
        <N8AO aoRadius={1.4} intensity={2} distanceFalloff={1} halfRes />
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.32}
          mipmapBlur
        />
        <ChromaticAberration
          offset={CA_OFFSET}
          radialModulation={false}
          modulationOffset={0}
        />
        <HueSaturation saturation={0.1} hue={0} />
        <BrightnessContrast brightness={0.01} contrast={0.14} />
        <Vignette eskil={false} offset={0.22} darkness={0.92} />
        <SMAA />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <N8AO aoRadius={1.4} intensity={2} distanceFalloff={1} halfRes />
      <Bloom
        intensity={1.1}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.32}
        mipmapBlur
      />
      <DepthOfField
        focusDistance={Math.min(0.05, Math.max(0.002, focusDistance / 400))}
        focalLength={0.04}
        bokehScale={1.6}
      />
      <ChromaticAberration
        offset={CA_OFFSET}
        radialModulation={false}
        modulationOffset={0}
      />
      <HueSaturation saturation={0.1} hue={0} />
      <BrightnessContrast brightness={0.01} contrast={0.14} />
      <Vignette eskil={false} offset={0.22} darkness={0.92} />
      <SMAA />
    </EffectComposer>
  );
}

/**
 * Full Memory City scene graph with tiered post and dual navigation.
 * Kit assets suspend in their own boundary so lighting/camera still show.
 */
export function CityScene({
  city,
  audio,
}: {
  city: CityConfig;
  audio: AmbientAudio;
}) {
  const radius = city.fabric?.radius ?? 40;

  return (
    <>
      <CityEnvironment theme={city.theme} radius={radius} />
      <CityGround theme={city.theme} radius={radius} />

      {city.fabric && (
        <Suspense fallback={null}>
          <KitFabric fabric={city.fabric} accent={city.theme.accent} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <AmbientLife city={city} />
      </Suspense>

      {city.nodes.map((node, index) => (
        <NodeBuilding key={node.id} node={node} index={index} />
      ))}

      <Navigation city={city} audio={audio} />
      <CityPost />
    </>
  );
}
