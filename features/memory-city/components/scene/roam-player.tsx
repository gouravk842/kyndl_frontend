import { useFrame, useThree } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

import type { AmbientAudio } from "../../hooks/use-ambient-audio";
import { useKeyboardMovement } from "../../hooks/use-keyboard-movement";
import { useMemoryCityStore } from "../../store";
import type { CityConfig } from "../../types";

const SPEED = 4; // m/s walking
const EYE = 0.7; // camera offset above the capsule centre
const DISTRICT_RADIUS = 16; // how far you may stray from the district centre
const LOOK_SENS = 0.0024;
const FOOTSTEP_INTERVAL = 0.42;

/**
 * Step-off free-roam: a real Rapier capsule the recipient drives on foot to
 * wander a district. WASD moves relative to where you look; drag (mouse or
 * touch) looks around. The capsule collides with the ground and the building
 * shells (genuine physics), and a soft tether keeps you within your district so
 * you can always find your way back to the tour.
 *
 * Mounted only while `mode === "roam"`; it spawns at the camera's current pose
 * so stepping off the tour is seamless, and hands the camera back on rejoin.
 */
export function RoamPlayer({
  city,
  audio,
}: {
  city: CityConfig;
  audio: AmbientAudio;
}) {
  const { camera, gl } = useThree();
  const body = useRef<RapierRigidBody>(null);

  const currentIndex = useMemoryCityStore((s) => s.currentIndex);
  const activeNodeId = useMemoryCityStore((s) => s.activeNodeId);
  const activate = useMemoryCityStore((s) => s.activate);

  const movement = useKeyboardMovement(!activeNodeId);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const footstep = useRef(0);

  // District centre this roam is tethered to.
  const node = city.nodes[currentIndex];
  const district = city.layout.districts.find((d) => d.id === node?.districtId);
  const center = district?.center ?? node?.transform.position ?? [0, 0, 0];

  // Seed yaw from the current camera facing and spawn at the camera position.
  useEffect(() => {
    const e = camera.rotation;
    yaw.current = e.y;
    pitch.current = e.x;
    const p = camera.position;
    body.current?.setTranslation({ x: p.x, y: 1.2, z: p.z }, true);
  }, [camera]);

  // Drag to look (mouse + touch); 'E' recalls the nearest memory.
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      yaw.current -= (e.clientX - lx) * LOOK_SENS;
      pitch.current = clamp(
        pitch.current - (e.clientY - ly) * LOOK_SENS,
        -1.2,
        1.2,
      );
      lx = e.clientX;
      ly = e.clientY;
    };
    const up = () => (dragging = false);
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyE") return;
      const p = camera.position;
      let best: (typeof city.nodes)[number] | null = null;
      let bestD = 4;
      for (const n of city.nodes) {
        const d = Math.hypot(
          p.x - n.transform.position[0],
          p.z - n.transform.position[2],
        );
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      }
      if (best) activate(best);
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("keydown", onKey);
    };
  }, [gl, camera, city, activate]);

  useFrame((_, delta) => {
    const rb = body.current;
    if (!rb) return;

    // Orient the camera from the look refs.
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");

    // Flatten the camera basis onto the ground plane for movement.
    const dir = camera.getWorldDirection(_fwd);
    dir.y = 0;
    dir.normalize();
    _right.crossVectors(dir, _up).normalize();

    const m = movement.current;
    _vel.set(0, 0, 0);
    if (m.forward) _vel.add(dir);
    if (m.backward) _vel.sub(dir);
    if (m.right) _vel.add(_right);
    if (m.left) _vel.sub(_right);
    const moving = _vel.lengthSq() > 0 && !activeNodeId;
    if (moving) _vel.normalize().multiplyScalar(SPEED);

    // Preserve gravity on Y; drive X/Z.
    const cur = rb.linvel();
    rb.setLinvel({ x: _vel.x, y: cur.y, z: _vel.z }, true);

    // Tether to the district: clamp the body inside the radius.
    const t = rb.translation();
    const dx = t.x - center[0];
    const dz = t.z - center[2];
    const dist = Math.hypot(dx, dz);
    if (dist > DISTRICT_RADIUS) {
      const s = DISTRICT_RADIUS / dist;
      rb.setTranslation(
        { x: center[0] + dx * s, y: t.y, z: center[2] + dz * s },
        true,
      );
    }

    // Camera rides on top of the capsule.
    camera.position.set(t.x, t.y + EYE, t.z);

    // Footsteps.
    if (moving) {
      footstep.current += delta;
      if (footstep.current >= FOOTSTEP_INTERVAL) {
        footstep.current = 0;
        audio.footstep();
      }
    } else {
      footstep.current = FOOTSTEP_INTERVAL;
    }
  });

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      colliders={false}
      enabledRotations={[false, false, false]}
      linearDamping={1.5}
      mass={1}
      position={[center[0], 1.2, center[2] + 3]}
    >
      <CapsuleCollider args={[0.6, 0.4]} friction={0.4} />
    </RigidBody>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const _fwd = new Vector3();
const _right = new Vector3();
const _up = new Vector3(0, 1, 0);
const _vel = new Vector3();
