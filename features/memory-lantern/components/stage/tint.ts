/** `#rgb` / `#rrggbb` → `rgba()`. Falls back to a warm ember if the hex is unusable. */
export function withAlpha(hex: string | undefined, alpha: number): string {
  const fallback = `rgba(240, 196, 138, ${alpha})`;
  if (!hex) return fallback;
  let h = hex.trim().replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (h.length < 6 || Number.isNaN(parseInt(h.slice(0, 6), 16)))
    return fallback;
  const n = parseInt(h.slice(0, 6), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
