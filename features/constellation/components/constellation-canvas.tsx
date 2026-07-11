"use client";

import type { RefObject } from "react";

type ConstellationCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

/**
 * The painted sky. All it does is hand the engine a full-bleed `<canvas>` to
 * draw into — every pixel (gradient, nebula, stars, lines, shooting stars)
 * comes from the rAF loop in `useConstellationEngine`. It's purely decorative
 * and unreachable by keyboard; the interactive stars live in the hit layer
 * stacked on top, so this is marked `aria-hidden`.
 */
export function ConstellationCanvas({ canvasRef }: ConstellationCanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 block h-full w-full"
    />
  );
}
