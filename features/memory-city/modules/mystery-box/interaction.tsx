"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

import type { ModuleInteractionProps } from "@/features/unlocks";

import { MOOD_COLORS } from "../../types";
import type { MysteryBoxConfig } from "./index";

/** A sealed, gently bobbing crate. Tapping it opens the box. */
function SealedCrate({
  accent,
  onOpen,
}: {
  accent: string;
  onOpen: () => void;
}) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.5;
      group.current.position.y = Math.sin(t * 1.6) * 0.08;
    }
  });
  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <mesh castShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#1a1730" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Glowing edge ribbon. */}
      <mesh>
        <boxGeometry args={[1.26, 0.16, 1.26]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.26, 0.16, 1.26]} />
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

/** The glowing memory orb that rises out of the shattered crate. */
function MemoryOrb({ accent }: { accent: string }) {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.position.y += (1.1 - ref.current.position.y) * delta * 2;
    const s = Math.min(1, ref.current.scale.x + delta * 1.6);
    ref.current.scale.setScalar(s);
    ref.current.rotation.y += delta;
  });
  return (
    <mesh ref={ref} position={[0, 0.2, 0]} scale={0.01}>
      <icosahedronGeometry args={[0.42, 1]} />
      <meshStandardMaterial
        color={accent}
        emissive={accent}
        emissiveIntensity={2.4}
        roughness={0.15}
        flatShading
        toneMapped={false}
      />
    </mesh>
  );
}

/** Deterministic pseudo-random in [0,1) — pure (no `Math.random` in render). */
function frand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** The burst: crate panels fly apart under gravity, the orb rises. */
function Shatter({ accent }: { accent: string }) {
  // Twelve fragments with varied outward velocity + spin (seeded by index).
  const fragments = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        vel: [
          (frand(i * 3) - 0.5) * 6,
          2 + frand(i * 3 + 1) * 4,
          (frand(i * 3 + 2) - 0.5) * 6,
        ] as [number, number, number],
        spin: [frand(i + 7) * 8, frand(i + 19) * 8, frand(i + 31) * 8] as [
          number,
          number,
          number,
        ],
        size: 0.18 + frand(i + 53) * 0.16,
      })),
    [],
  );

  return (
    <>
      {fragments.map((f) => (
        <RigidBody
          key={f.id}
          colliders="cuboid"
          linearVelocity={f.vel}
          angularVelocity={f.spin}
          position={[0, 0.4, 0]}
        >
          <mesh castShadow>
            <boxGeometry args={[f.size, f.size, f.size]} />
            <meshStandardMaterial
              color="#1a1730"
              emissive={accent}
              emissiveIntensity={0.6}
              roughness={0.4}
            />
          </mesh>
        </RigidBody>
      ))}
      <MemoryOrb accent={accent} />
    </>
  );
}

/**
 * The mystery-box reward surface. A self-contained mini physics scene: tap the
 * sealed crate to shatter it open (real Rapier debris), then the memory inside
 * is revealed. (Default export so it can be lazy-loaded.)
 */
export default function MysteryBoxInteraction({
  config,
  onClose,
}: ModuleInteractionProps<MysteryBoxConfig>) {
  const [opened, setOpened] = useState(false);
  const accent = MOOD_COLORS[config.mood];

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex w-full max-w-md flex-col items-center"
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 transition-colors hover:bg-black/60 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-72 w-full">
          <Canvas
            shadows
            camera={{ position: [0, 0.8, 4.4], fov: 46 }}
            gl={{ alpha: true }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[3, 4, 3]} intensity={40} color={accent} />
            <pointLight position={[-3, 2, 2]} intensity={20} color="#ffffff" />
            <Physics gravity={[0, -9.81, 0]}>
              {opened ? (
                <Shatter accent={accent} />
              ) : (
                <SealedCrate accent={accent} onOpen={() => setOpened(true)} />
              )}
            </Physics>
          </Canvas>
        </div>

        {!opened ? (
          <p className="mt-1 text-center text-sm text-white/70">
            {config.teaser ?? "Tap the box to open it"}
          </p>
        ) : (
          <motion.div
            className="mt-1 w-full rounded-3xl border border-white/10 bg-[#15122a] p-6 text-center text-white shadow-2xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <h2 className="font-display text-2xl leading-snug">
              {config.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {config.body}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm text-white/85 transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Keep exploring
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
