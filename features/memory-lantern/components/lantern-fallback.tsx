"use client";

import { motion } from "framer-motion";

import { type LanternConfig,SAMPLE_LANTERN } from "../config";

/**
 * The no-WebGL path: the same lantern, rebuilt as a CSS-3D ring of photo facets
 * so the keepsake still turns and reads on a device that can't run the shader
 * scene (or a headless crawler). Faithful in spirit — a ring of glowing facets,
 * each captioned — without any GPU. Honours reduced motion by standing still.
 */
export function LanternFallback({
  config = SAMPLE_LANTERN,
  mediaUrls = {},
  reducedMotion = false,
}: {
  config?: LanternConfig;
  mediaUrls?: Record<string, string>;
  reducedMotion?: boolean;
}) {
  const panes = config.panes;
  const n = Math.max(panes.length, 1);
  const step = 360 / n;
  // Radius that seats the facets edge-to-edge around the ring.
  const radius = n === 1 ? 0 : Math.round(85 / Math.tan(Math.PI / n));

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[#0a0710]"
      style={{ perspective: "1100px" }}
    >
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[max(2rem,env(safe-area-inset-top))] text-center">
        <h1 className="font-serif text-2xl tracking-wide text-[#f6efdd] sm:text-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.7)]">
          {config.title}
        </h1>
        <p className="font-serif mt-1 text-sm text-[#cdbfb0] [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">
          {config.subtitle}
        </p>
      </header>

      <div className="absolute inset-0 grid place-items-center">
        {panes.length === 0 ? (
          <p className="font-serif text-[#a9927f]">Add a photo to light the lantern.</p>
        ) : (
          <motion.div
            className="relative"
            style={{ width: 168, height: 208, transformStyle: "preserve-3d" }}
            animate={reducedMotion ? undefined : { rotateY: 360 }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 32, ease: "linear", repeat: Infinity }
            }
          >
            {panes.map((p, i) => {
              const url = p.fileId ? mediaUrls[p.fileId] : null;
              const glow = p.glowColor || "#f0c48a";
              return (
                <div
                  key={p.id}
                  className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                  style={{
                    transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                    backfaceVisibility: "hidden",
                    background: `linear-gradient(165deg, ${glow}, #1a0f16)`,
                  }}
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-6 pb-2.5 text-center">
                    <p className="font-serif text-sm text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">
                      {p.caption}
                    </p>
                    {p.date ? (
                      <p className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-white/70 uppercase">
                        {p.date}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
