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

// Faint chromatic split for the "tech" edge (module const → no per-frame alloc).
const CA_OFFSET = new Vector2(0.0006, 0.0006);

/** Swap the active navigator based on tour mode. */
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

/**
 * The full Memory City scene graph: dream-tech dusk lighting, the glowing plaza,
 * one building per memory node, the active navigator (revolve or roam), and a
 * cinematic post stack (ambient occlusion, bloom, depth-of-field, a faint
 * chromatic split, a cool grade, and a vignette) that lifts primitives into "a
 * place". Sits inside `<Physics>` so colliders and the roam player work.
 */
export function CityScene({
  city,
  audio,
}: {
  city: CityConfig;
  audio: AmbientAudio;
}) {
  return (
    <>
      <CityEnvironment theme={city.theme} />
      <CityGround theme={city.theme} />

      {city.fabric && (
        <KitFabric fabric={city.fabric} accent={city.theme.accent} />
      )}

      {/* Ambient life — traffic, lit windows, birds, shooting stars. */}
      <AmbientLife city={city} />

      {city.nodes.map((node, index) => (
        <NodeBuilding key={node.id} node={node} index={index} />
      ))}

      <Navigation city={city} audio={audio} />

      <EffectComposer multisampling={0}>
        <N8AO aoRadius={1.4} intensity={2} distanceFalloff={1} halfRes />
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.32}
          mipmapBlur
        />
        <DepthOfField focusDistance={0} focalLength={0.5} bokehScale={2} />
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
    </>
  );
}
