import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  DoubleSide,
  type Group,
  type MeshStandardMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";

import type { Pane } from "../../config";
import { facingFactor, type PaneLayout } from "../../lib/geometry";
import { makePaneTexture } from "../../lib/placeholder-texture";

const DEFAULT_GLOW = "#f0c48a";

/**
 * Resolve a facet's texture: the uploaded photo when a URL is available,
 * otherwise a procedural colour plate. The plate is always built (cheap) and
 * shown while the photo decodes, so a facet is never blank mid-load. The loaded
 * photo texture is disposed when the URL changes or the facet unmounts.
 */
function usePaneTexture(
  url: string | null,
  glow: string,
  caption: string,
): Texture {
  const procedural = useMemo(
    () => makePaneTexture(glow, caption),
    [glow, caption],
  );
  useEffect(() => () => procedural.dispose(), [procedural]);

  // Keyed by the URL that produced it, so a stale load never shows against a new
  // URL and we avoid a synchronous state reset on URL change.
  const [loaded, setLoaded] = useState<{ url: string; tex: Texture } | null>(
    null,
  );
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const tex = new TextureLoader().load(url, (t) => {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 4;
      if (!cancelled) setLoaded({ url, tex: t });
    });
    return () => {
      cancelled = true;
      tex.dispose();
    };
  }, [url]);

  const photo = url && loaded?.url === url ? loaded.tex : null;
  return photo ?? procedural;
}

/**
 * One facet of the lantern — a photo plate that *wakes* as it turns to face the
 * viewer: it glows brightest and its glass clears (low roughness) head-on, then
 * dims and frosts over as it swings away. Both are driven each frame off the same
 * facing signal as the room lighting, so the whole scene moves as one.
 */
export function LanternPane({
  pane,
  layout,
  groupRef,
  frost,
  url,
}: {
  pane: Pane;
  layout: PaneLayout;
  groupRef: RefObject<Group | null>;
  /** 0–1: how frosted a facet gets when it's NOT facing the viewer. */
  frost: number;
  /** Resolved photo URL for this facet, or null to show the procedural plate. */
  url?: string | null;
}) {
  const glow = pane.glowColor || DEFAULT_GLOW;
  const texture = usePaneTexture(url ?? null, glow, pane.caption);

  const matRef = useRef<MeshStandardMaterial>(null);

  useFrame(() => {
    const mat = matRef.current;
    const group = groupRef.current;
    if (!mat || !group) return;
    const front = Math.max(0, facingFactor(layout.angle, group.rotation.y));
    // Ease-in so the wake feels like it "arrives" as the facet swings square-on.
    mat.emissiveIntensity = 0.12 + front * front * 0.5;
    // …and the glass clears as it wakes: sharp head-on, frosting over as it turns.
    mat.roughness = 0.24 + (1 - front) * frost * 0.72;
  });

  return (
    <mesh position={layout.position} rotation-y={layout.rotationY}>
      <planeGeometry args={[layout.width, layout.height]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        emissiveMap={texture}
        emissive="#ffffff"
        emissiveIntensity={0.2}
        roughness={0.42}
        metalness={0.05}
        side={DoubleSide}
      />
    </mesh>
  );
}
