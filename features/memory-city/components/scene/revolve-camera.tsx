import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";

import type { AmbientAudio } from "../../hooks/use-ambient-audio";
import { markerHeight } from "../../lib/shells";
import { emptySample, makePath } from "../../lib/spline-path";
import { useMemoryCityStore } from "../../store";
import type { CityConfig, MemoryNode } from "../../types";

const EYE = 2.2;
const ARRIVE_DIST = 0.35;
const APPROACH_BLEND = 0.55; // fraction of travel spent on the avenue before framing

/** Final framing pose for a memory node (plaza-side, looking at the marker). */
function stagePose(node: MemoryNode) {
  const [x, , z] = node.transform.position;
  const mh = markerHeight(node.shell.kind);
  const r = Math.hypot(x, z) || 1;
  const ux = x / r;
  const uz = z / r;
  const back = 4.8;
  const pos = new Vector3(x - ux * back, EYE + 0.6, z - uz * back);
  const target = new Vector3(x, mh * 0.72, z);
  return { pos, target };
}

/** Nearest spline parameter (0..1) to a world XZ point. */
function nearestT(
  path: ReturnType<typeof makePath>,
  x: number,
  z: number,
  steps = 64,
): number {
  const sample = emptySample();
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    path.at(t, sample);
    const d = (sample.x - x) ** 2 + (sample.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  return bestT;
}

/**
 * Guided revolve: attract orbit → ease along the avenue spline toward the
 * focused node → settle into stage framing with camera-local parallax.
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
  const setFocusDistance = useMemoryCityStore((s) => s.setFocusDistance);
  const reducedMotion = useMemoryCityStore((s) => s.reducedMotion);

  const lookAt = useRef(new Vector3(0, 3, -20));
  const pointer = useRef({ x: 0, y: 0 });
  const wasArrived = useRef(false);
  const travel = useRef(0); // 0 → 1 progress toward current node
  const lastIndex = useRef(-1);

  const spline = city.layout.spline;
  const path = useMemo(
    () =>
      makePath(
        spline.length >= 2
          ? spline
          : [
              [0, EYE, 8],
              [0, EYE, -8],
            ],
      ),
    [spline],
  );

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
    const damp = reducedMotion ? 0.05 : 0.0015;
    const k = 1 - Math.pow(damp, delta);

    if (!started) {
      const t = state.clock.elapsedTime * (reducedMotion ? 0.04 : 0.12);
      const r = 26;
      cam.position.set(Math.sin(t) * r, 9, Math.cos(t) * r);
      lookAt.current.lerp(_tmp.set(0, 3, 0), 0.05);
      cam.lookAt(lookAt.current);
      return;
    }

    const node = city.nodes[currentIndex];
    if (!node) return;

    if (lastIndex.current !== currentIndex) {
      lastIndex.current = currentIndex;
      travel.current = 0;
      wasArrived.current = false;
    }

    travel.current = Math.min(
      1,
      travel.current + delta * (reducedMotion ? 0.35 : 0.55),
    );
    const { pos: stagePos, target } = stagePose(node);

    // Avenue approach: sample spline near the node, then blend to stage pose.
    const nodeT = nearestT(
      path,
      node.transform.position[0],
      node.transform.position[2],
    );
    path.at(nodeT, _sample);
    const avenuePos = _tmp2.set(_sample.x, EYE + 0.4, _sample.z);

    let desiredPos: Vector3;
    if (travel.current < APPROACH_BLEND) {
      const u = travel.current / APPROACH_BLEND;
      desiredPos = _tmp.copy(cam.position).lerp(avenuePos, 0.15 + u * 0.85);
      // Nudge along the path slightly before the stop.
      path.at(Math.max(0, nodeT - 0.02 * (1 - u)), _sample);
      desiredPos.lerp(_tmp2.set(_sample.x, EYE + 0.4, _sample.z), 1 - u);
    } else {
      const u = (travel.current - APPROACH_BLEND) / (1 - APPROACH_BLEND);
      desiredPos = _tmp2.copy(avenuePos).lerp(stagePos, u);
    }

    cam.position.lerp(desiredPos, k);

    // Camera-local parallax basis (not world axes).
    cam.updateMatrixWorld();
    _right.setFromMatrixColumn(cam.matrixWorld, 0).normalize();
    _up.setFromMatrixColumn(cam.matrixWorld, 1).normalize();

    _tmp
      .copy(target)
      .addScaledVector(_right, pointer.current.x * 1.4)
      .addScaledVector(_up, -pointer.current.y * 0.8);
    lookAt.current.lerp(_tmp, k);
    cam.lookAt(lookAt.current);

    const dist = cam.position.distanceTo(stagePos);
    const focusDist = cam.position.distanceTo(target);
    if (
      Math.abs(focusDist - useMemoryCityStore.getState().focusDistance) > 0.35
    ) {
      setFocusDistance(focusDist);
    }
    const arrived = travel.current > 0.92 && dist < ARRIVE_DIST;
    setArrived(arrived);
    if (arrived && !wasArrived.current) audio.chime();
    wasArrived.current = arrived;
  });

  return null;
}

const _tmp = new Vector3();
const _tmp2 = new Vector3();
const _right = new Vector3(1, 0, 0);
const _up = new Vector3(0, 1, 0);
const _sample = emptySample();
