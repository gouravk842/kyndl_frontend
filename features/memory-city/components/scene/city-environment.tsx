import { Environment, Lightformer, Stars } from "@react-three/drei";

import type { DreamTechTheme } from "../../types";

/**
 * "Dream-tech dusk" lighting rig. Shadow frustum scales with city radius.
 */
export function CityEnvironment({
  theme,
  radius = 40,
}: {
  theme: DreamTechTheme;
  radius?: number;
}) {
  const extent = Math.max(32, radius + 8);

  return (
    <>
      <fogExp2 attach="fog" args={[theme.sky, theme.fogDensity]} />

      <ambientLight intensity={0.28} color="#cfe0ff" />
      <hemisphereLight
        intensity={0.45}
        color={theme.horizon}
        groundColor="#1a1733"
      />

      <directionalLight
        position={[16, 9, 6]}
        intensity={2.4}
        color={theme.horizon}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-radius={6}
        shadow-bias={-0.0004}
        shadow-camera-far={Math.max(120, radius * 3)}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
      />
      <directionalLight
        position={[-12, 7, -8]}
        intensity={0.7}
        color={theme.accent}
      />

      <Stars
        radius={Math.max(120, radius * 3)}
        depth={60}
        count={1800}
        factor={3}
        saturation={0}
        fade
        speed={0.4}
      />

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
