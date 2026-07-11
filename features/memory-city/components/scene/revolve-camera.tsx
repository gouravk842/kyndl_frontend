import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

import type { AmbientAudio } from "../../hooks/use-ambient-audio";
import { markerHeight } from "../../lib/shells";
import { useMemoryCityStore } from "../../store";
import type { CityConfig, MemoryNode } from "../../types";

const EYE = 2.2; // camera height while touring
const ARRIVE_DIST = 0.35; // distance at which a node counts as "arrived"

/** Where the camera stands and looks to frame a given node. */
function stagePose(node: MemoryNode) {
  const [x, , z] = node.transform.position;
  const mh = markerHeight(node.shell.kind);
  // The city is a spiral centred on the plaza, so stand on the avenue (plaza)
  // side of the building — pulled toward the centre along its radial — and look
  // outward at it. This frames every node correctly regardless of its angle.
  const r = Math.hypot(x, z) || 1;
  const ux = x / r;
  const uz = z / r;
  const back = 4.8;
  const pos = new Vector3(x - ux * back, EYE + 0.6, z - uz * back);
  // Frame between the building body and its floating marker.
  const target = new Vector3(x, mh * 0.72, z);
  return { pos, target };
}

/**
 * Guided revolve. Before the recipient starts, the camera drifts in a slow orbit
 * over the city (an attract loop behind the enter prompt). Once touring, it eases
 * from wherever it is toward the focused node's stage pose and reports `arrived`
 * when settled. While stopped, small pointer parallax gives a free-look feel
 * without fighting the rail.
 */
export function RevolveCamera({
  city,
  audio,
}: {
  city: CityConfig;
  audio: AmbientAudio;
}) {
  const started = useMemoryCityStore((s) => s.started);
  const currentIndex = useMemoryCityStore((s) => s.currentIndex);
  const setArrived = useMemoryCityStore((s) => s.setArrived);

  // Smoothed look target + live pointer parallax (refs → no per-frame renders).
  const lookAt = useRef(new Vector3(0, 3, -20));
  const pointer = useRef({ x: 0, y: 0 });
  const wasArrived = useRef(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const cam = state.camera;
    const k = 1 - Math.pow(0.0015, delta); // frame-rate-independent smoothing

    if (!started) {
      // Attract orbit around the plaza at the city's centre (origin).
      const t = state.clock.elapsedTime * 0.12;
      const r = 26;
      cam.position.set(Math.sin(t) * r, 9, Math.cos(t) * r);
      lookAt.current.lerp(_tmp.set(0, 3, 0), 0.05);
      cam.lookAt(lookAt.current);
      return;
    }

    const node = city.nodes[currentIndex];
    if (!node) return;
    const { pos, target } = stagePose(node);

    cam.position.lerp(pos, k);

    // Bounded free-look parallax around the framed target.
    _tmp
      .copy(target)
      .addScaledVector(_right, pointer.current.x * 1.4)
      .addScaledVector(_up, -pointer.current.y * 0.8);
    lookAt.current.lerp(_tmp, k);
    cam.lookAt(lookAt.current);

    const arrived = cam.position.distanceTo(pos) < ARRIVE_DIST;
    setArrived(arrived);
    if (arrived && !wasArrived.current) audio.chime();
    wasArrived.current = arrived;
  });

  return null;
}

const _tmp = new Vector3();
const _right = new Vector3(1, 0, 0);
const _up = new Vector3(0, 1, 0);
