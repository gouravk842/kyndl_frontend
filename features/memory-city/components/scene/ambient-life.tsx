import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BoxGeometry,
  ConeGeometry,
  type InstancedMesh,
  type Mesh,
  type MeshStandardMaterial,
  Object3D,
} from "three";

import { makeRng } from "../../lib/layout/prng";
import { emptySample, makePath, type Path } from "../../lib/spline-path";
import type { CityConfig } from "../../types";

/**
 * Ambient life — the layer that turns the built city from a diorama into a place.
 *
 * A static "believable" city reads as dead; the aliveness (moving traffic, lit
 * windows, drifting birds, a sky that isn't frozen) is what sells it as real. All
 * of it is:
 *   - **instanced** — one draw call per swarm, so it's ~free at city scale;
 *   - **seeded** — initial distribution is a pure function of the city id, so a
 *     shared link looks identical on every device (motion uses the clock, but the
 *     *arrangement* never drifts);
 *   - **navigator-agnostic** — it just decorates the world, independent of revolve
 *     vs roam, and runs even behind the enter prompt so the hero shot is alive.
 */
export function AmbientLife({ city }: { city: CityConfig }) {
  const accent = city.theme.accent;
  const avenue = city.fabric?.roads?.[0];

  return (
    <group>
      {avenue && avenue.length > 1 && (
        <Traffic seed={city.id} avenue={avenue} accent={accent} />
      )}
      {city.fabric && (
        <WindowGlow seed={city.id} fillers={city.fabric.fillers} accent={accent} />
      )}
      <Birds seed={city.id} radius={city.fabric?.radius ?? 40} />
      <ShootingStars accent={accent} />
    </group>
  );
}

/* ─────────────────────────────── Traffic ─────────────────────────────── */

const CAR_LEN = 2.6;
const CAR_W = 1.05;
const CAR_H = 0.8;
const LANE = 1.35; // half-gap between the two directions of travel

interface Car {
  t0: number; // seeded start offset along the path [0,1)
  dir: 1 | -1; // travel direction (→ picks the lane side)
  speed: number; // world units / second
}

function Traffic({
  seed,
  avenue,
  accent,
}: {
  seed: string;
  avenue: import("../../types").Vec3[];
  accent: string;
}) {
  const bodyRef = useRef<InstancedMesh>(null);
  const headRef = useRef<InstancedMesh>(null);
  const tailRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const sample = useMemo(() => emptySample(), []);

  const path: Path = useMemo(() => makePath(avenue), [avenue]);

  // One car every ~16 units of avenue, clamped so tiny/huge cities stay sane.
  const cars: Car[] = useMemo(() => {
    const rng = makeRng(`${seed}:traffic`);
    const count = Math.max(6, Math.min(44, Math.round(path.length / 16)));
    return Array.from({ length: count }, () => ({
      t0: rng.next(),
      dir: rng.next() > 0.5 ? 1 : -1,
      speed: rng.range(3.2, 5.4),
    }));
  }, [seed, path.length]);

  // Headlights sit at the +Z nose, taillights at the −Z tail — baked into the
  // instanced geometry so a single per-car matrix places all three correctly.
  const headGeo = useMemo(() => {
    const g = new BoxGeometry(CAR_W * 0.82, 0.26, 0.22);
    g.translate(0, CAR_H * 0.55, CAR_LEN / 2);
    return g;
  }, []);
  const tailGeo = useMemo(() => {
    const g = new BoxGeometry(CAR_W * 0.82, 0.24, 0.18);
    g.translate(0, CAR_H * 0.55, -CAR_LEN / 2);
    return g;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const len = path.length;
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i]!;
      const t = car.t0 + (car.dir * car.speed * time) / len;
      path.at(t, sample);

      // Offset into the correct lane; the forward car steers along +tangent.
      const side = car.dir; // → right-hand traffic reads fine either way
      const ox = sample.nx * LANE * side;
      const oz = sample.nz * LANE * side;

      dummy.position.set(sample.x + ox, CAR_H / 2 + 0.05, sample.z + oz);
      // A car travelling backwards along the path faces the other way.
      dummy.rotation.set(0, car.dir === 1 ? sample.yaw : sample.yaw + Math.PI, 0);
      dummy.updateMatrix();

      bodyRef.current?.setMatrixAt(i, dummy.matrix);
      headRef.current?.setMatrixAt(i, dummy.matrix);
      tailRef.current?.setMatrixAt(i, dummy.matrix);
    }
    if (bodyRef.current) bodyRef.current.instanceMatrix.needsUpdate = true;
    if (headRef.current) headRef.current.instanceMatrix.needsUpdate = true;
    if (tailRef.current) tailRef.current.instanceMatrix.needsUpdate = true;
  });

  if (cars.length === 0) return null;

  return (
    <group>
      {/* Bodies — dark glass, catch the dusk key + accent fill. */}
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, cars.length]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[CAR_W, CAR_H, CAR_LEN]} />
        <meshStandardMaterial
          color="#12101f"
          roughness={0.28}
          metalness={0.6}
          emissive={accent}
          emissiveIntensity={0.12}
        />
      </instancedMesh>

      {/* Warm headlights — the moving light streaks that make dusk feel alive. */}
      <instancedMesh
        ref={headRef}
        args={[headGeo, undefined, cars.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#fff3d4"
          emissive="#ffe6ad"
          emissiveIntensity={3.2}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Red taillights. */}
      <instancedMesh
        ref={tailRef}
        args={[tailGeo, undefined, cars.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          color="#ff4436"
          emissive="#ff2d20"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

/* ───────────────────────────── Window glow ───────────────────────────── */

/**
 * Lit windows scattered through the filler skyline. Real per-face windows on the
 * Kenney meshes are out of reach (they share one atlas), so we sprinkle small
 * emissive motes hugging each building at varied heights — with bloom they bloom
 * into warm/cool window glows, reading as a lived-in city after dusk. They breathe
 * softly and a fraction blink, so the skyline shimmers instead of sitting frozen.
 */
function WindowGlow({
  seed,
  fillers,
  accent,
}: {
  seed: string;
  fillers: import("../../types").FillerBuilding[];
  accent: string;
}) {
  const warmRef = useRef<InstancedMesh>(null);
  const coolRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const { warm, cool } = useMemo(() => {
    const rng = makeRng(`${seed}:windows`);
    const warm: { x: number; y: number; z: number; phase: number }[] = [];
    const cool: { x: number; y: number; z: number; phase: number }[] = [];
    for (const f of fillers) {
      const [fx, , fz] = f.position;
      const [, h] = f.size;
      const windows = rng.int(1, 3);
      for (let k = 0; k < windows; k++) {
        // Nudge just outside the footprint at a believable window height.
        const ang = rng.range(0, Math.PI * 2);
        const rad = 1.1 + rng.range(0, 0.5);
        const y = rng.range(1.4, Math.max(1.8, Math.min(h, 6.5)));
        const pt = {
          x: fx + Math.cos(ang) * rad,
          y,
          z: fz + Math.sin(ang) * rad,
          phase: rng.range(0, Math.PI * 2),
        };
        (rng.next() > 0.22 ? warm : cool).push(pt);
      }
    }
    return { warm, cool };
  }, [seed, fillers]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    place(warmRef.current, warm, dummy, time);
    place(coolRef.current, cool, dummy, time);
  });

  return (
    <group>
      <instancedMesh
        ref={warmRef}
        args={[undefined, undefined, Math.max(warm.length, 1)]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial
          color="#ffca7a"
          emissive="#ffb457"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={coolRef}
        args={[undefined, undefined, Math.max(cool.length, 1)]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

function place(
  mesh: InstancedMesh | null,
  pts: { x: number; y: number; z: number; phase: number }[],
  dummy: Object3D,
  time: number,
) {
  if (!mesh) return;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    // A gentle breathe with an occasional near-off blink.
    const flick = 0.72 + Math.sin(time * 1.3 + p.phase) * 0.22;
    const blink = Math.sin(time * 0.21 + p.phase * 3.3) > 0.94 ? 0.25 : 1;
    const s = flick * blink;
    dummy.position.set(p.x, p.y, p.z);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

/* ─────────────────────────────── Birds ──────────────────────────────── */

/**
 * A small flock circling high over the city — distant dark silhouettes against
 * the dusk sky, wings flapping. Pure motion cue; they never come close enough to
 * need real geometry, so a stretched cone reads perfectly.
 */
function Birds({ seed, radius }: { seed: string; radius: number }) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const birds = useMemo(() => {
    const rng = makeRng(`${seed}:birds`);
    const count = 16;
    return Array.from({ length: count }, () => ({
      r: rng.range(radius * 0.5, radius * 0.95),
      a0: rng.range(0, Math.PI * 2),
      y: rng.range(20, 34),
      speed: rng.range(0.05, 0.11) * (rng.next() > 0.5 ? 1 : -1),
      bob: rng.range(0.6, 1.6),
      flap: rng.range(6, 10),
      phase: rng.range(0, Math.PI * 2),
    }));
  }, [seed, radius]);

  const geo = useMemo(() => {
    // A flattened 3-sided cone → a little chevron. Lay it flat, nose along +Z.
    const g = new ConeGeometry(0.5, 1.5, 3);
    g.rotateX(Math.PI / 2);
    g.scale(1, 0.28, 1);
    return g;
  }, []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < birds.length; i++) {
      const b = birds[i]!;
      const a = b.a0 + time * b.speed;
      const x = Math.cos(a) * b.r;
      const z = Math.sin(a) * b.r;
      const y = b.y + Math.sin(time * 0.5 + b.phase) * b.bob;
      dummy.position.set(x, y, z);
      // Face along the direction of flight (tangent to the circle).
      dummy.rotation.set(0, a + (b.speed > 0 ? Math.PI / 2 : -Math.PI / 2), 0);
      // Wing flap = a quick vertical squash/stretch.
      const flap = 0.7 + Math.abs(Math.sin(time * b.flap + b.phase)) * 0.9;
      dummy.scale.set(1, 1, flap);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geo, undefined, birds.length]}
      frustumCulled={false}
    >
      <meshStandardMaterial color="#1a1730" roughness={0.9} />
    </instancedMesh>
  );
}

/* ──────────────────────────── Shooting stars ─────────────────────────── */

/**
 * The sky isn't frozen: every so often a streak crosses it. Two independent
 * streaks on different cycles keep it from feeling metronomic. Time-driven only
 * (no per-frame state), so it's deterministic given the clock.
 */
function ShootingStars({ accent }: { accent: string }) {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const matA = useRef<MeshStandardMaterial>(null);
  const matB = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    streak(a.current, matA.current, time, 11, 0, 1, 0.5);
    streak(b.current, matB.current, time, 17, 5, -1, 0.72);
  });

  return (
    <group>
      <mesh ref={a} rotation={[0, 0, -0.5]} visible={false}>
        <boxGeometry args={[6, 0.06, 0.06]} />
        <meshStandardMaterial
          ref={matA}
          color="#ffffff"
          emissive={accent}
          emissiveIntensity={4}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh ref={b} rotation={[0, 0, 0.4]} visible={false}>
        <boxGeometry args={[5, 0.05, 0.05]} />
        <meshStandardMaterial
          ref={matB}
          color="#ffffff"
          emissive="#ffd9a0"
          emissiveIntensity={4}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function streak(
  mesh: Mesh | null,
  mat: MeshStandardMaterial | null,
  time: number,
  period: number,
  offset: number,
  dir: number,
  yBias: number,
) {
  if (!mesh || !mat) return;
  const phase = ((time + offset) % period) / period; // 0..1
  const active = phase < 0.14;
  mesh.visible = active;
  if (!active) return;
  const k = phase / 0.14; // 0..1 across the visible flight
  const startX = -70 * dir;
  mesh.position.set(startX + 140 * dir * k, 40 + yBias * 14 - k * 18, -55);
  // Fade in fast, out slow.
  mat.opacity = Math.sin(k * Math.PI);
}

export default AmbientLife;
