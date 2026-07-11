import { Grid } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

import type { DreamTechTheme } from "../../types";

const HALF = 60; // half-extent of the walkable plaza

/**
 * The city floor: a dark reflective plaza with a glowing accent grid (the
 * "tech" surface the dusk warmth sits on). A single fixed Rapier cuboid collider
 * under the visual plane stops the roam player and any physics props from
 * falling through.
 */
export function CityGround({ theme }: { theme: DreamTechTheme }) {
  return (
    <group>
      {/* Static collision floor (thin slab just below y=0). */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[HALF, 0.1, HALF]} position={[0, -0.1, 0]} />
      </RigidBody>

      {/* Visual plaza surface. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <meshStandardMaterial
          color="#161329"
          roughness={0.35}
          metalness={0.6}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Futuristic glowing floor grid. */}
      <Grid
        position={[0, 0.01, 0]}
        args={[HALF * 2, HALF * 2]}
        cellSize={1}
        cellThickness={0.6}
        cellColor={theme.locked}
        sectionSize={6}
        sectionThickness={1.2}
        sectionColor={theme.accent}
        fadeDistance={70}
        fadeStrength={2}
        followCamera={false}
        infiniteGrid
      />
    </group>
  );
}
