import { Environment, Lightformer, Stars } from "@react-three/drei";

import type { DreamTechTheme } from "../../types";

/**
 * "Dream-tech dusk" lighting rig.
 *
 * A stylized warm key + a cool fill establish the dusk base; a faint star field
 * and an accent-tinted image-based environment push it toward the futuristic /
 * holographic register without abandoning the warmth. All offline — Lightformer
 * panels stand in for an HDRI (no remote fetch), as the project constraint
 * requires. Post-processing lives in `CityScene`.
 */
export function CityEnvironment({ theme }: { theme: DreamTechTheme }) {
  return (
    <>
      {/* Soft shadows come from three's built-in PCF filter (Canvas
          `shadows="soft"` + the key light's `shadow-radius` below). drei's
          <SoftShadows> PCSS injection is incompatible with three r0.184 — it
          rewrites shadowmap_pars_fragment with GLSL that fails to compile, which
          silently kills every shadow-receiving MeshStandardMaterial. */}

      {/* Cool dusk haze receding into the distance. */}
      <fogExp2 attach="fog" args={[theme.sky, theme.fogDensity]} />

      {/* Low ambient + hemisphere so occlusion and accent rim both read. */}
      <ambientLight intensity={0.28} color="#cfe0ff" />
      <hemisphereLight
        intensity={0.45}
        color={theme.horizon}
        groundColor="#1a1733"
      />

      {/* Warm key sun, low and raking. */}
      <directionalLight
        position={[16, 9, 6]}
        intensity={2.4}
        color={theme.horizon}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={6}
        shadow-bias={-0.0004}
        shadow-camera-far={120}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />
      {/* Cool neon-accent fill from the opposite side — the "tech" half. */}
      <directionalLight
        position={[-12, 7, -8]}
        intensity={0.7}
        color={theme.accent}
      />

      {/* Faint star field for the eternal-dusk sky. */}
      <Stars
        radius={120}
        depth={60}
        count={1800}
        factor={3}
        saturation={0}
        fade
        speed={0.4}
      />

      {/* Procedural image-based reflections (offline — no remote HDRI). */}
      <Environment resolution={256} background={false}>
        <Lightformer
          intensity={1.4}
          color={theme.horizon}
          rotation-x={Math.PI / 2}
          position={[0, 8, 0]}
          scale={[28, 28, 1]}
        />
        <Lightformer
          intensity={1.1}
          color={theme.accent}
          position={[0, 4, -18]}
          scale={[18, 10, 1]}
        />
        <Lightformer
          intensity={0.3}
          color="#241f3a"
          rotation-x={-Math.PI / 2}
          position={[0, -2, 0]}
          scale={[28, 28, 1]}
        />
      </Environment>
    </>
  );
}
