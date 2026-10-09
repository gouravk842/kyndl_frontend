import { Grid } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

import type { DreamTechTheme } from "../../types";

/**
 * City floor sized from fabric radius so roam never falls off a growing city.
 */
export function CityGround({
  theme,
  radius = 40,
}: {
  theme: DreamTechTheme;
  radius?: number;
}) {
  const half = Math.max(60, radius + 12);
  const size = half * 2;

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[half, 0.1, half]} position={[0, -0.1, 0]} />
      </RigidBody>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#161329"
          roughness={0.35}
          metalness={0.6}
          envMapIntensity={0.6}
        />
      </mesh>

      <Grid
        position={[0, 0.01, 0]}
        args={[size, size]}
        cellSize={1}
        cellThickness={0.6}
        cellColor={theme.locked}
        sectionSize={6}
        sectionThickness={1.2}
        sectionColor={theme.accent}
        fadeDistance={Math.max(70, radius * 1.6)}
        fadeStrength={2}
        followCamera={false}
        infiniteGrid
      />
    </group>
  );
}
