import { Line, Merged, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import type { Mesh, Object3D } from "three";

import { emptySample, makePath } from "../../lib/spline-path";
import { useMemoryCityStore } from "../../store";
import type { CityFabric as CityFabricData, Vec3 } from "../../types";

/**
 * Kenney suburban kit + road tiles. Fillers honor layout `size` height bands.
 * Far fillers are culled by camera distance (throttled). No full-kit preload.
 *
 * Draco siblings (`*.draco.glb`) are produced by `npm run kits:compress`, but we
 * load the uncompressed originals by default — the Google Draco CDN is blocked
 * in many environments and a failed decode suspends the whole city to black.
 */

const BUILDING_URLS = "abcdefghijklmnopqrstu"
  .split("")
  .map((c) => `/kits/city/suburban/building-type-${c}.glb`);
const TREE_URLS = [
  "/kits/city/suburban/tree-large.glb",
  "/kits/city/suburban/tree-small.glb",
];
const ROAD_STRAIGHT = "/kits/city/roads/road-straight.glb";
const ROAD_BEND = "/kits/city/roads/road-bend.glb";

const KIT_SCALE = 4.2;
/** World spacing between straight road tiles (Kenney unit × scale). */
const ROAD_SPACING = KIT_SCALE * 0.95;

function firstMesh(root: Object3D): Mesh | null {
  let found: Mesh | null = null;
  root.traverse((o) => {
    if (!found && (o as Mesh).isMesh) found = o as Mesh;
  });
  return found;
}

function buildingKeyForFiller(tint: number, height: number): string {
  // Map height bands onto the kit variety; tint breaks ties.
  const band = height < 6 ? 0 : height < 10 ? 1 : height < 14 ? 2 : 3;
  const idx = Math.min(
    BUILDING_URLS.length - 1,
    Math.floor(((band * 0.22 + tint * 0.78) % 1) * BUILDING_URLS.length),
  );
  return `b${idx}`;
}

function scaleForFiller(size: Vec3, tint: number): number {
  // Layout height ~4–16; Kenney buildings ~1 unit → world via KIT_SCALE.
  const hFactor = Math.min(1.55, Math.max(0.75, size[1] / 10));
  return KIT_SCALE * hFactor * (0.92 + tint * 0.2);
}

interface RoadTile {
  key: "roadS" | "roadB";
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

function tilesAlongRoad(points: Vec3[]): RoadTile[] {
  if (points.length < 2) return [];
  const path = makePath(points);
  const sample = emptySample();
  const out: RoadTile[] = [];
  const count = Math.max(1, Math.floor(path.length / ROAD_SPACING));
  let prevYaw = 0;
  for (let i = 0; i <= count; i++) {
    const t = i / Math.max(count, 1);
    path.at(t, sample);
    const turn = Math.abs(sample.yaw - prevYaw);
    const bent = turn > 0.35 && turn < Math.PI - 0.35;
    out.push({
      key: bent ? "roadB" : "roadS",
      position: [sample.x, 0.01, sample.z],
      rotationY: sample.yaw,
      scale: KIT_SCALE,
    });
    prevYaw = sample.yaw;
  }
  return out;
}

export function KitFabric({
  fabric,
  accent,
}: {
  fabric: CityFabricData;
  accent: string;
}) {
  const quality = useMemoryCityStore((s) => s.quality);
  const cullRadius =
    quality === "low" ? 28 : quality === "med" ? 42 : fabric.radius + 20;

  const buildings = useMemo(
    () =>
      fabric.fillers.map((f) => ({
        key: buildingKeyForFiller(f.tint, f.size[1]),
        position: [f.position[0], 0, f.position[2]] as [number, number, number],
        rotationY: f.rotationY,
        scale: scaleForFiller(f.size, f.tint),
      })),
    [fabric.fillers],
  );

  const trees = useMemo(() => {
    const out: {
      key: string;
      position: [number, number, number];
      rotationY: number;
      scale: number;
    }[] = [];
    const ring = 12;
    const r = 6.5;
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2;
      out.push({
        key: i % 2 === 0 ? "tL" : "tS",
        position: [Math.cos(a) * r, 0, Math.sin(a) * r],
        rotationY: a,
        scale: KIT_SCALE * (0.8 + (i % 3) * 0.15),
      });
    }
    return out;
  }, []);

  const roadTiles = useMemo(() => {
    const tiles: RoadTile[] = [];
    // Avenue (index 0) gets mesh tiles; spokes stay glow-only to avoid clutter.
    const avenue = fabric.roads[0];
    if (avenue) tiles.push(...tilesAlongRoad(avenue));
    // Cap density on low tier.
    if (quality === "low") return tiles.filter((_, i) => i % 2 === 0);
    return tiles;
  }, [fabric.roads, quality]);

  const usedBuildingIdx = useMemo(() => {
    const set = new Set<number>();
    for (const b of buildings) {
      const n = Number(b.key.slice(1));
      if (!Number.isNaN(n)) set.add(n);
    }
    return [...set].sort((a, b) => a - b);
  }, [buildings]);

  const urls = useMemo(() => {
    const u = [
      ...usedBuildingIdx.map((i) => BUILDING_URLS[i]!),
      ...TREE_URLS,
      ROAD_STRAIGHT,
      ROAD_BEND,
    ];
    return u;
  }, [usedBuildingIdx]);

  const gltfs = useGLTF(urls) as unknown as { scene: Object3D }[];

  const meshes = useMemo(() => {
    const m: Record<string, Mesh> = {};
    let i = 0;
    for (const idx of usedBuildingIdx) {
      const mesh = firstMesh(gltfs[i++]!.scene);
      if (mesh) m[`b${idx}`] = mesh;
    }
    const tL = firstMesh(gltfs[i++]!.scene);
    const tS = firstMesh(gltfs[i++]!.scene);
    if (tL) m.tL = tL;
    if (tS) m.tS = tS;
    const roadS = firstMesh(gltfs[i++]!.scene);
    const roadB = firstMesh(gltfs[i++]!.scene);
    if (roadS) m.roadS = roadS;
    if (roadB) m.roadB = roadB;
    return m;
  }, [gltfs, usedBuildingIdx]);

  const [visible, setVisible] = useState<boolean[]>(() =>
    buildings.map(() => true),
  );
  const lastCull = useRef(0);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (now - lastCull.current < 0.25) return;
    lastCull.current = now;
    const cam = state.camera.position;
    const next = buildings.map((b) => {
      const dx = b.position[0] - cam.x;
      const dz = b.position[2] - cam.z;
      return dx * dx + dz * dz <= cullRadius * cullRadius;
    });
    setVisible((prev) => {
      if (prev.length !== next.length) return next;
      for (let i = 0; i < next.length; i++) {
        if (prev[i] !== next[i]) return next;
      }
      return prev;
    });
  });

  const hasMeshes = Object.keys(meshes).length > 0;

  return (
    <group>
      {hasMeshes && (
        <Merged meshes={meshes} castShadow receiveShadow>
          {(
            c: Record<string, React.ComponentType<Record<string, unknown>>>,
          ) => (
            <>
              {buildings.map((b, i) => {
                if (!visible[i]) return null;
                const C = c[b.key];
                return C ? (
                  <C
                    key={`b-${i}`}
                    position={b.position}
                    rotation={[0, b.rotationY, 0]}
                    scale={b.scale}
                    castShadow={quality !== "low"}
                  />
                ) : null;
              })}
              {trees.map((t, i) => {
                const C = c[t.key];
                return C ? (
                  <C
                    key={`t-${i}`}
                    position={t.position}
                    rotation={[0, t.rotationY, 0]}
                    scale={t.scale}
                  />
                ) : null;
              })}
              {roadTiles.map((r, i) => {
                const C = c[r.key];
                return C ? (
                  <C
                    key={`r-${i}`}
                    position={r.position}
                    rotation={[0, r.rotationY, 0]}
                    scale={r.scale}
                  />
                ) : null;
              })}
            </>
          )}
        </Merged>
      )}

      {fabric.roads.map((road, i) => (
        <Line
          key={i}
          points={road}
          color={accent}
          lineWidth={i === 0 ? 1.4 : 0.8}
          transparent
          opacity={i === 0 ? 0.22 : 0.1}
          toneMapped={false}
        />
      ))}
    </group>
  );
}

// Warm a few common suburban meshes (not the full alphabet).
["a", "b", "c", "d", "e"].forEach((c) =>
  useGLTF.preload(`/kits/city/suburban/building-type-${c}.glb`),
);
useGLTF.preload(TREE_URLS[0]!);
useGLTF.preload(TREE_URLS[1]!);
useGLTF.preload(ROAD_STRAIGHT);
