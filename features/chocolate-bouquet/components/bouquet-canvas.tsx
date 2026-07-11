"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import { Suspense, useEffect } from "react";
import { NoToneMapping } from "three";

import type { BouquetConfig } from "../config";
import { useBouquetStore } from "../store";
import { TearOverlay } from "./reveal/tear-overlay";
import { BouquetScene } from "./scene/bouquet-scene";
import { Post } from "./scene/post";
import { Entrance } from "./ui/entrance";
import { Hud } from "./ui/hud";

/**
 * Mounts the WebGL bouquet and layers the DOM ceremony on top (the correct R3F
 * split: 3D inside `<Canvas>`, gate/HUD/tear as DOM siblings). Orbit to look
 * around; tap a chocolate to lift it out and tear it open. Controls lock while a
 * wrapper is being torn so the gesture isn't fighting the camera.
 */
export function BouquetCanvas({
  config,
  autoStart = false,
}: {
  config: BouquetConfig;
  /** Skip the wrapping ceremony and show the bouquet immediately (builder preview). */
  autoStart?: boolean;
}) {
  const entered = useBouquetStore((s) => s.entered);
  const selectedId = useBouquetStore((s) => s.selectedId);
  const begin = useBouquetStore((s) => s.begin);
  const markOpened = useBouquetStore((s) => s.markOpened);
  const close = useBouquetStore((s) => s.close);
  const reset = useBouquetStore((s) => s.reset);

  // A fresh bouquet (new id, or a preview remount) starts unopened.
  useEffect(() => {
    reset();
  }, [config.id, reset]);

  // Builder preview / returning visitors skip the gate.
  useEffect(() => {
    if (autoStart) begin();
    else if (typeof window !== "undefined") {
      const key = `kyndl:bouquet-seen:${config.id}`;
      if (window.localStorage.getItem(key)) begin();
    }
  }, [autoStart, config.id, begin]);

  const handleBegin = () => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(`kyndl:bouquet-seen:${config.id}`, "1");
    begin();
  };

  const selected = config.chocolates.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        shadows="soft"
        dpr={[1, 1.75]}
        camera={{ fov: 34, near: 0.1, far: 100, position: [0, 0.0, 9.6] }}
        gl={{
          antialias: false,
          toneMapping: NoToneMapping,
          toneMappingExposure: 1,
        }}
        style={{
          // Clean neutral studio sweep (dark seamless — premium product look).
          background:
            "radial-gradient(ellipse 75% 65% at 50% 42%, #5a4f57 0%, #3b3138 45%, #221c21 100%)",
        }}
      >
        <Suspense fallback={null}>
          <BouquetScene config={config} />
          <Post />
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          enabled={selectedId == null}
          minDistance={7}
          maxDistance={13}
          minPolarAngle={0.7}
          maxPolarAngle={1.6}
          target={[0, -0.35, 0]}
          enableDamping
        />
      </Canvas>

      <Hud config={config} />

      <AnimatePresence>
        {selected ? (
          <TearOverlay
            key={selected.id}
            chocolate={selected}
            onOpened={markOpened}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!entered ? (
          <Entrance
            recipientName={config.recipientName}
            bouquetName={config.bouquetName}
            onBegin={handleBegin}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
