/**
 * Self-arranging bouquet layout. Given N chocolates, derive where each one sits
 * so 5 and 24 both read as a full, hand-tied bouquet — no coordinates are stored,
 * the arrangement is a pure function of the count (like the real thing fanning
 * out of one throat). A golden-angle spiral gives even fill at any N; every
 * chocolate points outward from the throat, the way flowers splay from a stem.
 */
export type Placement = {
  id: number;
  /** World position of the chocolate head. */
  head: [number, number, number];
  /** World position of the throat the stem rises from (shared cluster point). */
  throat: [number, number, number];
  /** 0 (centre) → 1 (outer rim); used for gentle size/tilt variation. */
  radial: number;
  /** A small per-item phase so idle sway isn't uniform. */
  phase: number;
};

const GOLDEN_ANGLE = 2.399963229728653;

/** Where every stem gathers — just inside the cone mouth, on the bouquet axis. */
export const THROAT: [number, number, number] = [0, -0.5, 0];

export function bouquetLayout(ids: number[]): Placement[] {
  const n = ids.length;
  // Tight, dense packing — a hand-tied dome, not a splayed fan.
  const maxR = 0.95 + Math.min(n, 24) * 0.03;
  const topY = 0.95; // centre head height
  const drop = 0.55; // how much lower the rim sits vs the centre (dome curve)

  return ids.map((id, i) => {
    // sqrt gives even areal density; the +0.5 keeps the very centre from clumping.
    const radial = n <= 1 ? 0 : Math.sqrt((i + 0.5) / n);
    const theta = i * GOLDEN_ANGLE;
    const R = radial * maxR;
    const y = topY - radial * radial * drop;

    return {
      id,
      head: [R * Math.cos(theta), y, R * Math.sin(theta)] as [
        number,
        number,
        number,
      ],
      throat: THROAT,
      radial,
      phase: (i * 1.7) % (Math.PI * 2),
    };
  });
}
