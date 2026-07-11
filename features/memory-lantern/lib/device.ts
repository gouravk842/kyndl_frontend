/**
 * Client capability detection — run once on mount (touches `document`/`navigator`,
 * so never during SSR).
 *
 * `hasWebGL` decides whether the real 3D lantern can mount at all; when it can't
 * (locked-down browser, blocklisted GPU, headless), the experience falls back to
 * a CSS-3D ring. `perfTier` scales the render on low-power devices — mainly phones
 * — trading resolution and post-processing quality for frame rate, while keeping
 * the glow that makes the lantern a lantern.
 */

export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return (
      !!window.WebGLRenderingContext &&
      !!(
        c.getContext("webgl2") ||
        c.getContext("webgl") ||
        c.getContext("experimental-webgl")
      )
    );
  } catch {
    return false;
  }
}

export type PerfTier = "high" | "low";

export function perfTier(): PerfTier {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return "high";
  }
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  if ((mem !== undefined && mem <= 4) || cores <= 4 || coarse) return "low";
  return "high";
}
