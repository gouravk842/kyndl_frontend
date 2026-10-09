export const BANK_PALETTE = [
  { fill: "#B11226", soft: "rgba(177, 18, 38, 0.22)" },
  { fill: "#C75B39", soft: "rgba(199, 91, 57, 0.22)" },
  { fill: "#D4A373", soft: "rgba(212, 163, 115, 0.28)" },
  { fill: "#8B5E3C", soft: "rgba(139, 94, 60, 0.22)" },
  { fill: "#E07A5F", soft: "rgba(224, 122, 95, 0.22)" },
] as const;

const LOOSE = { fill: "#A89080", soft: "rgba(168, 144, 128, 0.28)" };

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function bankColor(
  id: string,
  isLoose = false,
): { fill: string; soft: string } {
  if (isLoose) return LOOSE;
  return BANK_PALETTE[hash(id) % BANK_PALETTE.length] ?? BANK_PALETTE[0];
}
