"use client";

import { Search } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const ZOOM = 2.4;

/**
 * Flipkart-style product zoom: hover the image to reveal a lens + a large
 * magnified preview to the right (desktop / fine pointer only).
 */
export function ProductImageZoom({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [lens, setLens] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const lensW = rect.width / ZOOM;
    const lensH = rect.height / ZOOM;

    let x = e.clientX - rect.left - lensW / 2;
    let y = e.clientY - rect.top - lensH / 2;
    x = Math.max(0, Math.min(x, rect.width - lensW));
    y = Math.max(0, Math.min(y, rect.height - lensH));

    const pctX = (x / (rect.width - lensW || 1)) * 100;
    const pctY = (y / (rect.height - lensH || 1)) * 100;

    setLens({ x, y, w: lensW, h: lensH });
    setBgPos({ x: pctX, y: pctY });
  }, []);

  if (!src) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={frameRef}
        className="relative aspect-square cursor-crosshair overflow-hidden rounded-[1.35rem] bg-[#F8EBE4]"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={onMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="size-full object-cover select-none"
        />

        {active && (
          <div
            aria-hidden
            className="pointer-events-none absolute border border-white/80 bg-[#FF7A59]/20 shadow-[inset_0_0_0_1px_rgba(58,42,37,0.15)] backdrop-blur-[0.5px]"
            style={{
              left: lens.x,
              top: lens.y,
              width: lens.w,
              height: lens.h,
            }}
          />
        )}

        <span
          className={cn(
            "pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm transition-opacity duration-200",
            active ? "opacity-0" : "opacity-100",
            "hidden md:inline-flex",
          )}
        >
          <Search className="size-3" />
          Hover to zoom
        </span>
      </div>

      {/* Magnified pane — Flipkart places this beside the image */}
      {active && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-[calc(100%+1rem)] z-40 hidden aspect-square w-full overflow-hidden rounded-2xl border border-[#F0DAC9] bg-white shadow-[0_28px_60px_-28px_rgba(58,42,37,0.45)] lg:block"
          style={{
            backgroundImage: `url(${JSON.stringify(src)})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${ZOOM * 100}%`,
            backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
          }}
        />
      )}
    </div>
  );
}
