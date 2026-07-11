import { Line, Merged, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Mesh, Object3D } from "three";

import type { CityFabric as CityFabricData } from "../../types";

/**
 * The realistic city fabric, assembled from the CC0 **Kenney City Kit** (suburban
 * buildings + trees). Every model is a single mesh sharing one `colormap` texture
 * atlas and is modelled with its base at y=0 — so we render the whole skyline as a
 * handful of instanced meshes (one per model, cheap) placed at the positions the
 * layout engine derived. The glowing memory-node buildings stand among these real
 * ones, which makes "your memories" read as beacons in an actual town.
 *
 * Kenney models are ~1 unit; the city works in ~10-unit spacing, so we scale up.
 */

const BUILDING_URLS = "abcdefghijklmnopqrstu"
  .split("")
  .map((c) => `/kits/city/suburban/building-type-${c}.glb`);
const TREE_URLS = [
  "/kits/city/suburban/tree-large.glb",
  "/kits/city/suburban/tree-small.glb",
];
const ALL_URLS = [...BUILDING_URLS, ...TREE_URLS];

/** Kenney unit (~1 per building) → world units. */
const KIT_SCALE = 4.2;

/** First mesh in a loaded GLB scene (Kenney models are single-mesh). */
function firstMesh(root: Object3D): Mesh | null {
  let found: Mesh | null = null;
  root.traverse((o) => {
    if (!found && (o as Mesh).isMesh) found = o as Mesh;
  });
  return found;
}

export function KitFabric({
  fabric,
  accent,
}: {
  fabric: CityFabricData;
  accent: string;
}) {
  const gltfs = useGLTF(ALL_URLS) as unknown as { scene: Object3D }[];

  // Map every model to a stable key: b0..b20 for buildings, tL / tS for trees.
  const meshes = useMemo(() => {
    const m: Record<string, Mesh> = {};
    gltfs.forEach((g, i) => {
      const mesh = firstMesh(g.scene);
      if (!mesh) return;
      if (i < BUILDING_URLS.length) m[`b${i}`] = mesh;
      else m[i === BUILDING_URLS.length ? "tL" : "tS"] = mesh;
    });
    return m;
  }, [gltfs]);

  // Every filler → a real building, chosen deterministically by its seeded tint,
  // scaled with a little variance so the skyline isn't uniform.
  const buildings = useMemo(
    () =>
      fabric.fillers.map((f) => {
        const idx = Math.min(
          BUILDING_URLS.length - 1,
          Math.floor(f.tint * BUILDING_URLS.length),
        );
        const scale = KIT_SCALE * (0.85 + f.tint * 0.55);
        return {
          key: `b${idx}`,
          position: [f.position[0], 0, f.position[2]] as [number, number, number],
          rotationY: f.rotationY,
          scale,
        };
      }),
    [fabric.fillers],
  );

  // A tasteful ring of trees around the central plaza for greenery.
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

  const hasMeshes = Object.keys(meshes).length > 0;

  return (
    <group>
      {hasMeshes && (
        <Merged meshes={meshes} castShadow receiveShadow>
          {(c: Record<string, React.ComponentType<Record<string, unknown>>>) => (
            <>
              {buildings.map((b, i) => {
                const C = c[b.key];
                return C ? (
                  <C
                    key={`b-${i}`}
                    position={b.position}
                    rotation={[0, b.rotationY, 0]}
                    scale={b.scale}
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
            </>
          )}
        </Merged>
      )}

      {fabric.roads.map((road, i) => (
        <Line
          key={i}
          points={road}
          color={accent}
          lineWidth={i === 0 ? 2.2 : 1}
          transparent
          opacity={i === 0 ? 0.4 : 0.18}
          toneMapped={false}
        />
      ))}
    </group>
  );
}

ALL_URLS.forEach((u) => useGLTF.preload(u));
