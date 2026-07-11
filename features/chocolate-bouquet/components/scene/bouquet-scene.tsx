"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, MathUtils, Quaternion, Vector3 } from "three";

import type { BouquetConfig } from "../../config";
import { bouquetLayout, type Placement } from "../../lib/layout";
import { useBouquetStore } from "../../store";
import { Chocolate } from "./chocolate";
import { Wrapping } from "./wrapping";

const UP = new Vector3(0, 1, 0);

/**
 * The whole bouquet, assembled in world space with a soft-box studio light rig:
 * a self-arranging fan of PBR chocolates on stems, the crinkled tissue cone + twine
 * bow beneath them, an HDRI-style {@link Environment} built from local light
 * cards (no network) for the foil reflections, a key light throwing soft shadows
 * onto a seamless floor, and a gentle idle revolve that stills when one is picked.
 */
export function BouquetScene({ config }: { config: BouquetConfig }) {
  const group = useRef<Group>(null);
  const selectedId = useBouquetStore((s) => s.selectedId);
  const select = useBouquetStore((s) => s.select);

  const placements = useMemo(
    () => bouquetLayout(config.chocolates.map((c) => c.id)),
    [config.chocolates],
  );
  const byId = useMemo(
    () => new Map(placements.map((p) => [p.id, p])),
    [placements],
  );

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const speed = selectedId ? 0 : 0.1;
    g.rotation.y += speed * delta;
    g.rotation.x = MathUtils.damp(g.rotation.x, selectedId ? 0 : -0.04, 3, delta);
  });

  return (
    <>
      {/* Soft ambient base + a warm key throwing the studio shadow. */}
      <hemisphereLight args={["#fff6ee", "#20181d", 0.55]} />
      <ambientLight intensity={0.22} />
      <directionalLight
        position={[5, 9, 6]}
        intensity={2.1}
        color="#fff4ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={8}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-6, 3, -2]} intensity={0.7} color="#e7d3ff" />

      {/* Studio soft-boxes baked into the environment map so metals have crisp,
          neutral reflections — the look of a product shoot, generated locally. */}
      <Environment resolution={512} frames={1} background={false}>
        <Lightformer
          intensity={3}
          position={[0, 5, 4]}
          scale={[10, 5, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={1.6}
          position={[-5, 1, 3]}
          scale={[4, 8, 1]}
          color="#fdeede"
        />
        <Lightformer
          intensity={1.4}
          position={[5, 2, 1]}
          scale={[4, 8, 1]}
          color="#e6ddff"
        />
        <Lightformer
          intensity={1}
          position={[0, -3, 3]}
          scale={[8, 3, 1]}
          color="#fff4ec"
        />
      </Environment>

      <group ref={group} position={[0, 0.2, 0]}>
        <Stems placements={placements} />

        {config.chocolates.map((c) => {
          const p = byId.get(c.id);
          if (!p) return null;
          return (
            <Chocolate
              key={c.id}
              data={c}
              placement={p}
              dimmed={selectedId != null}
              onPick={select}
            />
          );
        })}

        <Sprigs placements={placements} />
        <Wrapping wrapColor={config.wrapColor} bowColor={config.bowColor} />
      </group>

      {/* Seamless studio floor catching the soft shadow. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.0, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#2a2329" roughness={0.95} metalness={0} />
      </mesh>
    </>
  );
}

/** Thin green stems running from the shared throat up to each chocolate head. */
function Stems({ placements }: { placements: Placement[] }) {
  return (
    <>
      {placements.map((p) => {
        const from = new Vector3(...p.throat);
        const to = new Vector3(...p.head);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const len = from.distanceTo(to);
        const dir = to.clone().sub(from).normalize();
        const quat = new Quaternion().setFromUnitVectors(UP, dir);
        return (
          <mesh key={p.id} position={mid.toArray()} quaternion={quat} castShadow>
            <cylinderGeometry args={[0.02, 0.028, len, 6]} />
            <meshStandardMaterial color="#3f5d34" roughness={0.85} />
          </mesh>
        );
      })}
    </>
  );
}

/** A scattering of baby's-breath puffs filling the gaps between chocolates. */
function Sprigs({ placements }: { placements: Placement[] }) {
  const puffs = useMemo(() => {
    const out: [number, number, number][] = [];
    placements.forEach((p, i) => {
      const a = i * 2.4;
      const r = 0.16 + (i % 3) * 0.04;
      out.push([
        p.head[0] + Math.cos(a) * r,
        p.head[1] + 0.14,
        p.head[2] + Math.sin(a) * r,
      ]);
    });
    return out;
  }, [placements]);

  return (
    <>
      {puffs.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <icosahedronGeometry args={[0.035, 0]} />
          <meshStandardMaterial
            color="#fbfaf2"
            roughness={0.9}
            emissive="#3a3320"
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}
    </>
  );
}
