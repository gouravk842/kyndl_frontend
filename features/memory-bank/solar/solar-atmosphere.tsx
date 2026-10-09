"use client";

import { useId } from "react";

import { type Warmth, youFlameClass } from "@/features/memory-bank/lib/hearth";
import { cn } from "@/lib/utils";

const DUST: { x: number; y: number; s: number; delay: string }[] = [
  { x: 8, y: 14, s: 1.6, delay: "0s" },
  { x: 18, y: 72, s: 1.1, delay: "1.4s" },
  { x: 27, y: 22, s: 2, delay: "2.1s" },
  { x: 36, y: 86, s: 1.2, delay: "0.6s" },
  { x: 44, y: 9, s: 1.4, delay: "3.2s" },
  { x: 52, y: 61, s: 1.8, delay: "1.8s" },
  { x: 61, y: 31, s: 1.1, delay: "4s" },
  { x: 69, y: 78, s: 2.2, delay: "0.9s" },
  { x: 77, y: 18, s: 1.3, delay: "2.7s" },
  { x: 84, y: 54, s: 1.5, delay: "3.6s" },
  { x: 91, y: 88, s: 1.2, delay: "1.1s" },
  { x: 12, y: 48, s: 1, delay: "2.4s" },
  { x: 93, y: 8, s: 1.7, delay: "0.3s" },
  { x: 4, y: 91, s: 1.3, delay: "4.4s" },
];

type Props = {
  cx?: number;
  cy?: number;
};

export function SolarAtmosphere({ cx, cy }: Props) {
  const uid = useId().replace(/:/g, "");
  const hexId = `mb-hex-${uid}`;
  const starId = `mb-star-${uid}`;
  const focus =
    typeof cx === "number" && typeof cy === "number" ? { cx, cy } : null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 kyndl-mb-drift-wash"
        style={{
          background: focus
            ? `radial-gradient(ellipse 78% 64% at ${focus.cx}px ${focus.cy}px, var(--mb-solar-wash), transparent 68%)`
            : "radial-gradient(ellipse 78% 64% at 50% 38%, var(--mb-solar-wash), transparent 68%)",
        }}
      />
      <div
        className="absolute -left-[20%] top-[-18%] size-[70%] origin-center rounded-full kyndl-mb-spin-slow opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--kyndl-gold) 22%, transparent), transparent 62%)",
        }}
      />
      <div
        className="absolute -right-[18%] bottom-[-22%] size-[62%] origin-center rounded-full kyndl-mb-spin opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--kyndl-coral) 16%, transparent), transparent 64%)",
        }}
      />

      <svg className="absolute inset-0 size-full text-[var(--mb-solar-orbit-strong)]">
        <defs>
          <pattern
            id={hexId}
            width="56"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M28 0 L56 16 L28 32 L0 16 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.65"
            />
          </pattern>
          <pattern
            id={starId}
            width="92"
            height="92"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="12" cy="18" r="0.8" fill="currentColor" />
            <circle cx="64" cy="44" r="0.6" fill="currentColor" />
            <circle cx="38" cy="76" r="0.7" fill="currentColor" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${hexId})`}
          opacity="0.18"
        />
        <rect
          width="100%"
          height="100%"
          fill={`url(#${starId})`}
          opacity="0.32"
        />
        {focus ? (
          <>
            <ellipse
              cx={focus.cx}
              cy={focus.cy}
              rx={210}
              ry={158}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.22"
            />
            <ellipse
              cx={focus.cx}
              cy={focus.cy}
              rx={340}
              ry={250}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              opacity="0.14"
              strokeDasharray="3 11"
            />
          </>
        ) : null}
      </svg>

      {focus ? (
        <svg
          className="absolute origin-center kyndl-mb-spin text-[var(--mb-solar-orbit-strong)]"
          width={420}
          height={420}
          viewBox="0 0 420 420"
          style={{ left: focus.cx - 210, top: focus.cy - 210 }}
        >
          <polygon
            points="210,48 337,121 337,267 210,340 83,267 83,121"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.28"
          />
          <circle
            cx="210"
            cy="210"
            r="168"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeDasharray="1.5 9"
            opacity="0.32"
          />
        </svg>
      ) : null}

      {DUST.map((dot, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[var(--mb-solar-orbit-strong)] kyndl-mb-twinkle"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.s,
            height: dot.s,
            animationDelay: dot.delay,
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 46%, var(--mb-solar-vignette) 100%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-multiply dark:mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
          opacity: 0.05,
          backgroundColor: "var(--mb-solar-grain)",
        }}
      />
    </div>
  );
}

export function YouGlyph({
  size,
  warmth = "out",
}: {
  size: number;
  warmth?: Warmth;
}) {
  return (
    <span
      className={cn(
        "flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--mb-solar-you)] text-sm font-medium text-[var(--mb-solar-you-fg)]",
        youFlameClass(warmth),
      )}
      style={{ width: size, height: size }}
    >
      <span className="hidden sm:inline">You</span>
      <span className="relative inline-flex size-5 sm:hidden" aria-hidden>
        <span className="absolute top-0.5 left-0 size-3 rounded-full bg-[var(--mb-solar-you-fg)]/90" />
        <span className="absolute top-1 left-2 size-3 rounded-full bg-[var(--mb-solar-you-fg)]/55" />
      </span>
      <span className="sr-only sm:hidden">You</span>
    </span>
  );
}
