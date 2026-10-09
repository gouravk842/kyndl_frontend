import { Billboard, Float, Image, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Suspense, useEffect, useMemo, useRef } from "react";
import type { Group, Mesh, MeshStandardMaterial, PointLight } from "three";

import { nodeAccent } from "../../lib/node-visuals";
import { shellSize } from "../../lib/shells";
import type { MessageConfig } from "../../modules/message";
import { isNodeLocked, missingRequires, useMemoryCityStore } from "../../store";
import type { MemoryNode } from "../../types";

/**
 * A single memory node: stylized shell + floating marker. Dynamic point lights
 * only on the focused node and the two nearest unrecalled neighbours.
 */
export function NodeBuilding({
  node,
  index,
}: {
  node: MemoryNode;
  index: number;
}) {
  const accent = nodeAccent(node);
  const size = shellSize(node.shell.kind);
  const [, height] = size;

  const isFocused = useMemoryCityStore((s) => s.currentIndex === index);
  const recalled = useMemoryCityStore((s) => s.recalled.has(node.id));
  const locked = useMemoryCityStore((s) => isNodeLocked(node, s.solved));
  const blocked = useMemoryCityStore(
    (s) => missingRequires(node, s.recalled).length > 0,
  );
  const mode = useMemoryCityStore((s) => s.mode);
  const focus = useMemoryCityStore((s) => s.focus);
  const activate = useMemoryCityStore((s) => s.activate);
  const quality = useMemoryCityStore((s) => s.quality);
  const reducedMotion = useMemoryCityStore((s) => s.reducedMotion);
  const growing = useMemoryCityStore((s) => s.growingNodeIds.has(node.id));
  const clearGrowing = useMemoryCityStore((s) => s.clearGrowing);
  const currentIndex = useMemoryCityStore((s) => s.currentIndex);

  // Light budget: focused + neighbours within ±2 indices that aren't recalled.
  const lightRank = Math.abs(index - currentIndex);
  const wantsLight =
    isFocused || (lightRank <= 2 && lightRank > 0 && !recalled);

  const markerRef = useRef<Group>(null);
  const tokenRef = useRef<MeshStandardMaterial>(null);
  const haloRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);
  const rootRef = useRef<Group>(null);
  const growT = useRef(growing ? 0 : 1);

  useEffect(() => {
    if (growing) growT.current = 0;
  }, [growing]);

  const imageUrl =
    node.reward.type === "message"
      ? (node.reward.config as MessageConfig).imageUrl
      : undefined;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (growing || growT.current < 1) {
      if (reducedMotion) {
        growT.current = 1;
        clearGrowing(node.id);
      } else {
        growT.current = Math.min(1, growT.current + delta / 1.2);
        if (growT.current >= 1) clearGrowing(node.id);
      }
      const e = 1 - Math.pow(1 - growT.current, 3);
      if (rootRef.current) {
        rootRef.current.scale.y = Math.max(0.02, e);
        rootRef.current.position.y = (1 - e) * -0.5;
      }
    }

    // Skip marker animation when far from focus on low tier.
    if (quality === "low" && lightRank > 3) return;

    const amp = locked || blocked ? 0.34 : 0.18;
    const flicker = recalled
      ? 1
      : 0.66 + Math.sin(t * (locked || blocked ? 13 : 9) + index) * amp;
    const pulse = isFocused ? 1 + Math.sin(t * 4) * 0.2 : 1;
    if (tokenRef.current) {
      const target = (recalled ? 2.4 : 1.5) * flicker * pulse;
      tokenRef.current.emissiveIntensity +=
        (target - tokenRef.current.emissiveIntensity) * 0.12;
      tokenRef.current.opacity = recalled ? 1 : locked || blocked ? 0.55 : 0.78;
    }
    if (markerRef.current) {
      markerRef.current.rotation.y = reducedMotion ? 0 : t * 0.4;
      const s = isFocused ? 1.12 : 1;
      markerRef.current.scale.x += (s - markerRef.current.scale.x) * 0.1;
      markerRef.current.scale.y = markerRef.current.scale.x;
      markerRef.current.scale.z = markerRef.current.scale.x;
    }
    if (haloRef.current)
      haloRef.current.rotation.z = reducedMotion ? 0 : t * 0.2;
    if (lightRef.current) {
      const target = isFocused ? 9 : 4;
      lightRef.current.intensity += (target - lightRef.current.intensity) * 0.1;
    }
  });

  const onSelect = () => {
    if (mode === "revolve" && !isFocused) focus(index);
    else activate(node);
  };

  const [x, , z] = node.transform.position;
  const sparklesOn =
    !reducedMotion &&
    (quality === "high" ||
      (quality === "med" && isFocused) ||
      (quality === "low" && isFocused));
  const sparkleCount = quality === "low" ? 10 : isFocused ? 36 : 18;

  return (
    <group
      ref={rootRef}
      position={[x, 0, z]}
      rotation={[0, node.transform.rotationY ?? 0, 0]}
      scale={node.transform.scale ?? 1}
    >
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[size[0], height / 2, size[2]]}
          position={[0, height / 2, 0]}
        />
        <Shell kind={node.shell.kind} accent={accent} size={size} />
      </RigidBody>

      <mesh
        ref={haloRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
      >
        <ringGeometry args={[size[0] + 0.5, size[0] + 0.75, 48]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={recalled ? 2 : 1.2}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>

      <Float
        speed={reducedMotion ? 0 : 1.6}
        rotationIntensity={reducedMotion ? 0 : 0.1}
        floatIntensity={reducedMotion ? 0 : 0.5}
      >
        <group
          ref={markerRef}
          position={[0, height + 1.3, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "default")}
        >
          {imageUrl ? (
            <Billboard>
              <mesh position={[0, 0, -0.03]}>
                <planeGeometry args={[1.5, 1.15]} />
                <meshStandardMaterial
                  color="#0d0b1a"
                  emissive={accent}
                  emissiveIntensity={recalled ? 1.2 : 0.6}
                  toneMapped={false}
                />
              </mesh>
              <Suspense fallback={null}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image url={imageUrl} scale={[1.36, 1.0]} />
              </Suspense>
            </Billboard>
          ) : (
            <mesh>
              <icosahedronGeometry args={[0.5, 1]} />
              <meshStandardMaterial
                ref={tokenRef}
                color={accent}
                emissive={accent}
                emissiveIntensity={1.5}
                roughness={0.2}
                metalness={0.1}
                flatShading
                toneMapped={false}
                transparent
                opacity={0.8}
              />
            </mesh>
          )}
        </group>
      </Float>

      {sparklesOn && (
        <Sparkles
          count={sparkleCount}
          scale={[2, height + 1, 2]}
          position={[0, (height + 1.3) / 2, 0]}
          size={isFocused ? 4 : 2.4}
          speed={0.35}
          color={accent}
        />
      )}

      {wantsLight && (
        <pointLight
          ref={lightRef}
          position={[0, height * 0.7, 0]}
          color={accent}
          intensity={4}
          distance={10}
          decay={2}
        />
      )}
    </group>
  );
}

function Shell({
  kind,
  accent,
  size,
}: {
  kind: string;
  accent: string;
  size: [number, number, number];
}) {
  const [hx, h, hz] = size;
  const body = useMemo(
    () => ({ color: "#16142b", roughness: 0.25, metalness: 0.7 }),
    [],
  );

  if (kind === "tower") {
    return (
      <group>
        <mesh castShadow position={[0, h / 2, 0]}>
          <boxGeometry args={[hx * 2, h, hz * 2]} />
          <meshStandardMaterial {...body} envMapIntensity={1} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * hx, h / 2, hz]}>
            <boxGeometry args={[0.08, h * 0.92, 0.08]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        ))}
        <mesh position={[0, h + 0.15, 0]}>
          <boxGeometry args={[hx * 2.2, 0.3, hz * 2.2]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  }

  if (kind === "pavilion") {
    return (
      <group>
        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[hx * 2, 0.4, hz * 2]} />
          <meshStandardMaterial {...body} />
        </mesh>
        {[
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ].map(([sx, sz], i) => (
          <mesh
            key={i}
            castShadow
            position={[sx! * (hx - 0.2), h / 2, sz! * (hz - 0.2)]}
          >
            <cylinderGeometry args={[0.12, 0.12, h, 8]} />
            <meshStandardMaterial {...body} />
          </mesh>
        ))}
        <mesh position={[0, h, 0]}>
          <boxGeometry args={[hx * 2.2, 0.18, hz * 2.2]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      </group>
    );
  }

  if (kind === "lantern") {
    return (
      <group>
        <mesh castShadow position={[0, h / 2, 0]}>
          <cylinderGeometry args={[hx, hx * 1.3, h, 10]} />
          <meshStandardMaterial {...body} />
        </mesh>
        <mesh position={[0, h + 0.1, 0]}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={2.2}
            toneMapped={false}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[hx * 2, h, hz * 2]} />
        <meshStandardMaterial {...body} />
      </mesh>
      <mesh position={[0, h / 2, hz + 0.01]}>
        <boxGeometry args={[0.07, h * 0.8, 0.02]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, h / 2, hz + 0.01]}>
        <boxGeometry args={[hx * 1.6, 0.07, 0.02]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
