/**
 * Ring geometry — the "grows with memories" math.
 *
 * The lantern is a ring of vertical panes (a prism), not a swapped platonic
 * solid, so it scales continuously: 4 panes read as a cube, ~8 as a hexagonal
 * lantern, 20+ as a glowing orb. Nothing about the geometry is persisted — every
 * pane transform is derived here from the ordered list, so adding a memory simply
 * re-solves the ring.
 *
 * Each pane sits at the polygon's apothem (centre→edge-midpoint distance) with
 * its width set to the regular-polygon side length, so at low counts the facets
 * meet like a solid; a small fill factor leaves frosted seams between them.
 */

export type PaneLayout = {
  /** Base ring angle (radians) — added to the group's spin to get world angle. */
  angle: number;
  position: [number, number, number];
  rotationY: number;
  width: number;
  height: number;
};

const APOTHEM = 1.15; // centre → pane midpoint
const PANE_HEIGHT = 1.72;
const MAX_WIDTH = 2.3; // clamp so 1–2 panes don't become absurdly wide
const FILL = 0.92; // <1 leaves a thin frosted seam between facets

export function ringLayout(count: number): PaneLayout[] {
  const n = Math.max(1, count);
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2;
    // Regular-polygon side = 2·apothem·tan(π/n); guard the degenerate n≤1.
    const raw = n <= 1 ? MAX_WIDTH : 2 * APOTHEM * Math.tan(Math.PI / n);
    const width = Math.min(MAX_WIDTH, raw) * FILL;
    return {
      angle,
      position: [Math.sin(angle) * APOTHEM, 0, Math.cos(angle) * APOTHEM],
      rotationY: angle,
      width,
      height: PANE_HEIGHT,
    };
  });
}

/**
 * How strongly a facet faces the camera, given its base angle and the group's
 * current spin. Camera looks down −Z at the origin, so a facet whose outward
 * normal points at +Z (world angle 0) is dead-on. Returns 1 (facing the viewer)
 * → −1 (facing away).
 */
export function facingFactor(baseAngle: number, spinY: number): number {
  return Math.cos(baseAngle + spinY);
}
