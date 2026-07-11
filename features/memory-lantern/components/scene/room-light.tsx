import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { type AmbientLight, Color, type PointLight } from "three";

import { useLanternStore } from "../../store";

/**
 * The room, lit by the memory. Every frame the lantern blends the facets' glow
 * colours (weighted toward whichever is facing the viewer) into `store.roomColor`;
 * this component eases the ambient light, a front wash, the fog, and the
 * background toward that colour — so the whole space breathes the colour of the
 * moment currently turned to face you, crossfading as it rotates.
 *
 * The fog and background are seeded by the JSX in `LanternCanvas` and merely
 * *mutated* here (same `Color` instances on `scene`), so there's a single owner
 * per property and no per-frame allocation beyond one scratch colour.
 */
export function RoomLight({ intensity = 1 }: { intensity?: number }) {
  const roomColor = useLanternStore((s) => s.roomColor);
  const { scene } = useThree();

  const ambientRef = useRef<AmbientLight>(null);
  const washRef = useRef<PointLight>(null);
  const scratch = useRef(new Color());

  useFrame((_, delta) => {
    // Frame-rate-independent approach toward the target colour.
    const k = 1 - Math.exp(-delta * 3);

    ambientRef.current?.color.lerp(roomColor, k * 0.5);
    washRef.current?.color.lerp(roomColor, k);

    // Fog + background take a deeply muted version so the room glows without
    // ever washing out to a bright field — it stays a dark, coloured dusk.
    if (scene.fog) {
      scratch.current.copy(roomColor).multiplyScalar(0.16);
      scene.fog.color.lerp(scratch.current, k * 0.6);
    }
    const bg = scene.background;
    if (bg instanceof Color) {
      scratch.current.copy(roomColor).multiplyScalar(0.1);
      bg.lerp(scratch.current, k * 0.6);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4 * intensity} />
      {/* Soft wash from above the viewer, tinted by the front memory. Kept high
          and gentle so it lifts the front facet without a blown specular hotspot. */}
      <pointLight
        ref={washRef}
        position={[0, 2.6, 5.4]}
        intensity={0.6 * intensity}
        distance={18}
        decay={1.2}
      />
    </>
  );
}
