"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import {
  type ColorRepresentation,
  Group,
  MathUtils,
  Quaternion,
  Vector3,
} from "three";

import type { Chocolate as ChocolateData } from "../../config";
import { kindOf } from "../../lib/chocolate-kinds";
import type { Placement } from "../../lib/layout";
import { foilCrinkle, paperCrinkle } from "../../lib/materials";
import { useBouquetStore } from "../../store";

const UP = new Vector3(0, 1, 0);
const SILVER = "#cfd3d8";
const GOLD = "#d9b24c";

/**
 * One wrapped chocolate on its stem, with realistic PBR wrappers: metallic foil
 * (silver KitKat-style bar with a printed paper sleeve, or a gold premium bar /
 * truffle) and matte paper (a Dairy-Milk-style bar). Crinkle normal + roughness
 * maps give the micro-reflections that sell "foil". It sways gently, brightens on
 * hover, and lifts out toward the viewer when selected.
 */
export function Chocolate({
  data,
  placement,
  dimmed,
  onPick,
}: {
  data: ChocolateData;
  placement: Placement;
  dimmed: boolean;
  onPick: (id: number) => void;
}) {
  const kind = kindOf(data.type);
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const foil = useMemo(() => foilCrinkle(), []);
  const paper = useMemo(() => paperCrinkle(), []);

  const selectedId = useBouquetStore((s) => s.selectedId);
  const opened = useBouquetStore((s) => s.openedIds.has(data.id));
  const selected = selectedId === data.id;

  const { quaternion, dir } = useMemo(() => {
    const d = new Vector3(
      placement.head[0] - placement.throat[0],
      placement.head[1] - placement.throat[1],
      placement.head[2] - placement.throat[2],
    ).normalize();
    return { quaternion: new Quaternion().setFromUnitVectors(UP, d), dir: d };
  }, [placement]);

  const lift = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    const target = selected ? 1 : 0;
    lift.current = MathUtils.damp(lift.current, target, 6, delta);
    const l = lift.current;

    const sway = Math.sin(t * 0.9 + placement.phase) * 0.03 * (1 - l);
    g.position.set(
      placement.head[0] + dir.x * l * 1.6,
      placement.head[1] + dir.y * l * 1.6 + sway,
      placement.head[2] + dir.z * l * 1.6,
    );

    const s =
      (selected ? 1.28 : hovered ? 1.08 : 1) * (dimmed && !selected ? 0.92 : 1);
    g.scale.setScalar(MathUtils.damp(g.scale.x, s, 8, delta));
  });

  const opacity = dimmed && !selected ? 0.32 : 1;
  const dead = opened && !selected;

  // A foil bar reads as KitKat: silver metal body + a coloured paper sleeve.
  // Milestone/secret are premium gold foil; note is a matte paper bar.
  const foilBar = kind.foil && kind.mesh === "bar";
  const goldBody = data.type === "milestone" || data.type === "secret";
  const bodyColor: ColorRepresentation = dead
    ? "#7c7c7c"
    : goldBody
      ? GOLD
      : foilBar
        ? SILVER
        : kind.wrapper;

  const foilMat = {
    color: bodyColor,
    metalness: 1,
    roughness: 1,
    roughnessMap: foil.roughness,
    normalMap: foil.normal,
    normalScale: [0.9, 0.9] as [number, number],
    envMapIntensity: 1.15,
    transparent: true,
    opacity,
    emissive: hovered && !selected ? kind.wrapperHi : "#000000",
    emissiveIntensity: hovered && !selected ? 0.18 : 0,
  };

  const paperMat = {
    color: dead ? "#7c7c7c" : kind.wrapper,
    metalness: 0,
    roughness: 1,
    roughnessMap: paper.roughness,
    normalMap: paper.normal,
    normalScale: [0.6, 0.6] as [number, number],
    clearcoat: 0.28,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.5,
    transparent: true,
    opacity,
    emissive: hovered && !selected ? kind.wrapperHi : "#000000",
    emissiveIntensity: hovered && !selected ? 0.14 : 0,
  };

  return (
    <group
      ref={group}
      quaternion={quaternion}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!selectedId) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!selectedId) onPick(data.id);
      }}
    >
      {kind.mesh === "bar" && (
        <>
          <RoundedBox
            args={[0.4, 1.14, 0.15]}
            radius={0.05}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial {...(foilBar ? foilMat : paperMat)} />
          </RoundedBox>

          {/* printed paper sleeve around a foil bar (the KitKat wrapper band) */}
          {foilBar && (
            <RoundedBox
              args={[0.43, 0.6, 0.18]}
              radius={0.04}
              smoothness={3}
              castShadow
            >
              <meshPhysicalMaterial
                {...paperMat}
                color={dead ? "#6f6f6f" : kind.wrapper}
              />
            </RoundedBox>
          )}
        </>
      )}

      {kind.mesh === "truffle" && (
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[0.34, 2]} />
          <meshPhysicalMaterial {...foilMat} normalScale={[1.3, 1.3]} />
        </mesh>
      )}

      {kind.mesh === "square" && (
        <>
          <RoundedBox
            args={[0.46, 0.46, 0.46]}
            radius={0.07}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial {...(kind.foil ? foilMat : paperMat)} />
          </RoundedBox>
          {/* ribbon cross */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.08, 0.5]} />
            <meshPhysicalMaterial {...paperMat} color={kind.wrapperHi} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.5, 0.5]} />
            <meshPhysicalMaterial {...paperMat} color={kind.wrapperHi} />
          </mesh>
        </>
      )}
    </group>
  );
}
