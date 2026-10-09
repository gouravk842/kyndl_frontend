import type { RenderQuality } from "../store";

/** Coarse device tier before PerformanceMonitor takes over. */
export function detectInitialQuality(): RenderQuality {
  if (typeof window === "undefined") return "med";
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const coarse =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 768px)").matches;
  if (coarse || cores <= 4 || (mem !== undefined && mem <= 4)) return "low";
  if (cores >= 8 && (mem === undefined || mem >= 8)) return "high";
  return "med";
}

export function detectReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectRoamAllowed(): boolean {
  if (typeof window === "undefined") return true;
  // Desktop-ish: fine pointer and roomy viewport.
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 900px)").matches
  );
}
