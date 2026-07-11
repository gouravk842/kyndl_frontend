"use client";

import {
  Bloom,
  DepthOfField,
  EffectComposer,
  N8AO,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

/**
 * The cinematic pass that lifts the render from "3D scene" toward "product
 * photo": ambient-occlusion contact darkening (N8AO), a whisper of bloom on the
 * foil highlights, a shallow depth of field focused on the bouquet, ACES tone
 * mapping, a soft vignette, and SMAA to clean the edges. Tone mapping is done
 * here (the canvas uses `NoToneMapping`) so bloom sees true HDR values.
 */
export function Post() {
  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={0.5}
        intensity={2.2}
        distanceFalloff={0.6}
        quality="performance"
        color="#160d12"
      />
      <Bloom
        mipmapBlur
        intensity={0.42}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.25}
      />
      <DepthOfField
        focusDistance={0.075}
        focalLength={0.022}
        bokehScale={2.2}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.28} darkness={0.72} />
      <SMAA />
    </EffectComposer>
  );
}
