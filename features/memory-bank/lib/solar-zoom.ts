const KEY = "kyndl-memory-bank-zoom";
const EVENT = "kyndl-memory-bank-zoom";

export const ZOOM_MIN = 0.7;
export const ZOOM_MAX = 1.8;
export const ZOOM_STEP = 0.15;

export function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));
}

export function readSolarZoom(): number {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 1;
    const value = Number(raw);
    if (!Number.isFinite(value)) return 1;
    return clampZoom(value);
  } catch {
    return 1;
  }
}

export function writeSolarZoom(value: number) {
  const next = clampZoom(value);
  try {
    localStorage.setItem(KEY, String(next));
  } catch {
    // Storage is optional.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function subscribeSolarZoom(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
