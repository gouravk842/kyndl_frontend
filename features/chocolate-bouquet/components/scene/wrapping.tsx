"use client";

import { useMemo } from "react";
import { DoubleSide, type Texture } from "three";

import { paperCrinkle } from "../../lib/materials";

/** A soft purple inner tissue layer behind the outer wrap colour. */
const INNER_TISSUE = "#b7a6d4";

/**
 * The layered matte-tissue cone, its ruffled collar, and a rustic twine bow at
 * the throat — what makes the chocolates read as a hand-tied *bouquet*. Two
 * tissue layers (the outer wrap colour over a soft purple) with a crinkle normal
 * map give the folded-paper look. Purely decorative; chocolates mount above it.
 */
export function Wrapping({
  wrapColor,
  bowColor,
}: {
  wrapColor: string;
  bowColor: string;
}) {
  const paper = useMemo(() => paperCrinkle(), []);

  const tissue = (color: string, intensity = 0.6) => ({
    color,
    side: DoubleSide,
    roughness: 0.94,
    metalness: 0,
    normalMap: paper.normal,
    normalScale: [0.7, 0.7] as [number, number],
    clearcoat: 0.06,
    envMapIntensity: intensity,
    flatShading: true as const,
  });

  return (
    <group>
      {/* soft purple inner layer, slightly proud of the outer so it peeks through */}
      <mesh position={[0, -1.55, 0]}>
        <cylinderGeometry args={[1.42, 0.18, 2.7, 28, 1, true]} />
        <meshPhysicalMaterial {...tissue(INNER_TISSUE, 0.5)} />
      </mesh>

      {/* outer wrap cone — its mouth sits just under the dome of chocolates */}
      <mesh position={[0, -1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.32, 0.14, 2.6, 26, 1, true]} />
        <meshPhysicalMaterial {...tissue(wrapColor)} />
      </mesh>

      {/* ruffled collar flaring out under the heads */}
      <mesh position={[0, -0.42, 0]} castShadow>
        <cylinderGeometry args={[1.62, 1.05, 0.8, 22, 1, true]} />
        <meshPhysicalMaterial {...tissue(wrapColor)} />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <cylinderGeometry args={[1.45, 0.95, 0.72, 20, 1, true]} />
        <meshPhysicalMaterial {...tissue(INNER_TISSUE, 0.45)} />
      </mesh>

      <TwineBow color={bowColor} normalMap={paper.normal} />
    </group>
  );
}

/** A rustic wound-twine bow tied around the throat. */
function TwineBow({
  color,
  normalMap,
}: {
  color: string;
  normalMap: Texture;
}) {
  const cord = {
    color,
    roughness: 0.85,
    metalness: 0,
    normalMap,
    normalScale: [1.1, 1.1] as [number, number],
    envMapIntensity: 0.4,
  };
  return (
    <group position={[0, -0.95, 0]}>
      {/* wrap band wound around the neck of the cone */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.02, 0.05, 10, 40]} />
        <meshPhysicalMaterial {...cord} />
      </mesh>
      {/* bow tied at the front */}
      <group position={[0, 0.02, 1.0]}>
        <mesh rotation={[0, 0, 0.5]} position={[-0.26, 0, 0]}>
          <torusGeometry args={[0.22, 0.05, 10, 24]} />
          <meshPhysicalMaterial {...cord} />
        </mesh>
        <mesh rotation={[0, 0, -0.5]} position={[0.26, 0, 0]}>
          <torusGeometry args={[0.22, 0.05, 10, 24]} />
          <meshPhysicalMaterial {...cord} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshPhysicalMaterial {...cord} />
        </mesh>
        <mesh rotation={[0.3, 0, 0.4]} position={[-0.13, -0.4, -0.05]}>
          <cylinderGeometry args={[0.028, 0.028, 0.7, 8]} />
          <meshPhysicalMaterial {...cord} />
        </mesh>
        <mesh rotation={[0.3, 0, -0.4]} position={[0.13, -0.4, -0.05]}>
          <cylinderGeometry args={[0.028, 0.028, 0.7, 8]} />
          <meshPhysicalMaterial {...cord} />
        </mesh>
      </group>
    </group>
  );
}
