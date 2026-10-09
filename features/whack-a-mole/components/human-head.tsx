"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const FALLBACK_SKIN = "#c9956c";

function parseRgb(rgb: string): [number, number, number] | null {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return null;
  return [Number(m[0]), Number(m[1]), Number(m[2])];
}

function shade(rgb: string, amount: number): string {
  const parts = parseRgb(rgb);
  if (!parts) return rgb;
  const [r, g, b] = parts.map((n) =>
    Math.max(0, Math.min(255, Math.round(n * amount))),
  );
  return `rgb(${r}, ${g}, ${b})`;
}

/** Average cheek color so the neck and ears match the photo. */
function useSkinTone(src: string): string {
  const [tone, setTone] = useState(FALLBACK_SKIN);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || !img.naturalWidth) return;
        ctx.drawImage(
          img,
          img.naturalWidth * 0.3,
          img.naturalHeight * 0.36,
          img.naturalWidth * 0.4,
          img.naturalHeight * 0.2,
          0,
          0,
          10,
          10,
        );
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const rr = data[i] ?? 0;
          const gg = data[i + 1] ?? 0;
          const bb = data[i + 2] ?? 0;
          const a = data[i + 3] ?? 0;
          if (a < 200) continue;
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          if (max < 48 || min > 242) continue;
          if (rr + 10 < gg) continue;
          r += rr;
          g += gg;
          b += bb;
          n += 1;
        }
        if (!n || cancelled) return;
        setTone(
          `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`,
        );
      } catch {
        /* Cross-origin photos keep the fallback neck tone. */
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return tone;
}

/**
 * A photo worn as a head: oval face, ears and neck tinted from the portrait,
 * so a selfie reads as a person coming out of the hole.
 */
export function HumanHead({
  src,
  smashed = false,
  className,
}: {
  src: string;
  smashed?: boolean;
  className?: string;
}) {
  const skin = useSkinTone(src);
  const neck = shade(skin, 0.78);
  const ear = shade(skin, 0.9);

  return (
    <span className={cn("relative block h-full w-full", className)}>
      <span
        aria-hidden
        className="absolute top-[34%] left-[6%] z-0 h-[16%] w-[13%] rounded-[50%]"
        style={{
          background: `radial-gradient(circle at 60% 45%, ${skin}, ${ear})`,
        }}
      />
      <span
        aria-hidden
        className="absolute top-[34%] right-[6%] z-0 h-[16%] w-[13%] rounded-[50%]"
        style={{
          background: `radial-gradient(circle at 40% 45%, ${skin}, ${ear})`,
        }}
      />
      <span
        aria-hidden
        className="absolute bottom-0 left-1/2 z-0 h-[40%] w-[46%] -translate-x-1/2 rounded-b-[46%]"
        style={{
          background: `linear-gradient(to bottom, ${skin} 0%, ${neck} 78%)`,
          boxShadow: "inset 0 -10px 14px rgba(40, 18, 10, 0.28)",
        }}
      />
      <span
        className="absolute bottom-[14%] left-1/2 z-10 w-[84%] -translate-x-1/2"
        style={{ aspectRatio: "4 / 4.7" }}
      >
        <span
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: "48% 48% 44% 44% / 40% 40% 50% 50%",
            boxShadow:
              "0 10px 16px rgba(40, 18, 10, 0.35), inset 0 -12px 16px rgba(40, 18, 10, 0.18)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            className="size-full object-cover object-[center_22%]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 26%, transparent 64%, rgba(40,18,10,0.32) 100%)",
              mixBlendMode: "soft-light",
            }}
          />
          {smashed && (
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 42%, rgba(194,24,48,0.45), rgba(120,10,20,0.2) 70%)",
                mixBlendMode: "multiply",
              }}
            />
          )}
        </span>
      </span>
    </span>
  );
}

/** Intro portrait: the same head rising out of a hole. */
export function HeadInHole({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden
        className="absolute inset-x-[6%] top-[40%] bottom-0 rounded-[50%] bg-gradient-to-b from-[#e7c7a4] via-[#b68355] to-[#6e4630] shadow-[0_12px_0_#5c3a24]"
      />
      <span
        aria-hidden
        className="absolute inset-x-[16%] top-[50%] bottom-[8%] rounded-[50%] bg-gradient-to-b from-[#3a2418] to-[#120904] shadow-[inset_0_12px_18px_rgba(0,0,0,0.65)]"
      />
      <div className="absolute inset-x-[12%] top-[4%] bottom-[16%]">
        <HumanHead src={src} />
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[14%] bottom-[6%] h-[18%] rounded-[50%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 10%, rgba(122,74,42,0.2) 45%, #8a5a38 100%)",
        }}
      />
    </div>
  );
}
