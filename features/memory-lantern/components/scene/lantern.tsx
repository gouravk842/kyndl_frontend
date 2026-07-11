import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Group } from "three";

import {
  DEFAULT_MATERIAL,
  DEFAULT_MOTION,
  type LanternConfig,
} from "../../config";
import { facingFactor, ringLayout } from "../../lib/geometry";
import { useLanternStore } from "../../store";
import { LanternPane } from "./pane";

const DEFAULT_GLOW = "#f0c48a";

/**
 * The rotating ring of facets, with the glowing core inside it. This component
 * owns the spin and is the single writer of `activePaneId`: each frame it
 * advances the group's rotation, then picks the most camera-facing facet and
 * publishes it to the store for the DOM caption overlay to read. Wrapped in a
 * gentle vertical `Float` so the whole lantern feels suspended in the room.
 */
export function Lantern({
  config,
  mediaUrls = {},
  reducedMotion = false,
}: {
  config: LanternConfig;
  /** Resolved photo URLs by fileId (presigned assets + local previews). */
  mediaUrls?: Record<string, string>;
  /** Drop the idle float bob when the viewer prefers reduced motion. */
  reducedMotion?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const layouts = useMemo(
    () => ringLayout(config.panes.length),
    [config.panes.length],
  );
  const motion = config.motion ?? DEFAULT_MOTION;
  const material = config.material ?? DEFAULT_MATERIAL;

  // Precomputed facet glow colours, blended into the room each frame.
  const glowColors = useMemo(
    () => config.panes.map((p) => new Color(p.glowColor || DEFAULT_GLOW)),
    [config.panes],
  );
  const blend = useRef(new Color());

  const setActivePane = useLanternStore((s) => s.setActivePane);
  const markSeen = useLanternStore((s) => s.markSeen);
  const roomColor = useLanternStore((s) => s.roomColor);
  const paused = useLanternStore((s) => s.paused);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Read the mutable drag control fresh each frame (not a render subscription —
    // it changes every pointer move and must never re-render the scene).
    const control = useLanternStore.getState().control;

    // Apply any un-consumed drag, then either coast on flick momentum or, once
    // it's settled and the viewer isn't holding, resume the gentle auto-spin.
    if (control.pending !== 0) {
      group.rotation.y += control.pending;
      control.pending = 0;
    }
    if (!control.grabbing) {
      if (Math.abs(control.velocity) > 1e-4) {
        group.rotation.y += control.velocity;
        control.velocity *= Math.exp(-delta * 2.5);
      } else {
        control.velocity = 0;
        // Cap delta so a backgrounded tab doesn't lurch the lantern on return.
        if (!paused) group.rotation.y += motion.autoSpin * Math.min(delta, 0.05);
      }
    }

    const spin = group.rotation.y;
    let bestId: string | null = null;
    let best = -Infinity;
    // Weighted colour blend: each facet contributes in proportion to how
    // camera-facing it is (cubed, so the front memory dominates while the room
    // still crossfades smoothly between neighbours as it turns).
    let r = 0;
    let g = 0;
    let b = 0;
    let wsum = 0;
    layouts.forEach((layout, i) => {
      const f = facingFactor(layout.angle, spin);
      if (f > best) {
        best = f;
        bestId = config.panes[i]?.id ?? null;
      }
      const c = glowColors[i];
      if (f > 0 && c) {
        const w = f * f * f;
        r += c.r * w;
        g += c.g * w;
        b += c.b * w;
        wsum += w;
      }
    });
    setActivePane(bestId);
    if (bestId) markSeen(bestId);
    if (wsum > 0) {
      blend.current.setRGB(r / wsum, g / wsum, b / wsum);
      roomColor.copy(blend.current);
    }
  });

  const lantern = (
    <group ref={groupRef}>
      {/* Inner core glow bleeding through the frosted glass. */}
      <pointLight
        position={[0, 0, 0]}
        color={material.coreColor}
        intensity={5}
        distance={4.5}
        decay={2}
      />
      {config.panes.map((pane, i) => {
        const layout = layouts[i];
        if (!layout) return null;
        return (
          <LanternPane
            key={pane.id}
            pane={pane}
            layout={layout}
            groupRef={groupRef}
            frost={material.frost}
            url={pane.fileId ? (mediaUrls[pane.fileId] ?? null) : null}
          />
        );
      })}
    </group>
  );

  // Suspend the idle float bob under reduced motion (dragging still works).
  if (reducedMotion) return lantern;
  return (
    <Float
      speed={1.1}
      rotationIntensity={0}
      floatIntensity={0.6}
      floatingRange={[-0.06, 0.06]}
    >
      {lantern}
    </Float>
  );
}
