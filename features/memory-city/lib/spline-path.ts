/**
 * Arc-length sampler over a ground polyline.
 *
 * The layout engine emits roads as flat `Vec3[]` polylines (the spiral avenue and
 * radial spokes). Ambient traffic needs to glide along them at constant speed and
 * face the direction of travel — which means sampling by *distance*, not by raw
 * vertex index (vertices bunch up on tight curves). This precomputes cumulative
 * segment lengths once, then answers position + heading (+ a lateral normal for
 * lanes) for any `t` in `[0, 1)`, wrapping seamlessly so a car loops the avenue.
 *
 * Pure and allocation-light: `at()` writes into a shared result object, so a
 * per-frame loop over dozens of cars makes zero garbage.
 */

import type { Vec3 } from "../types";

export interface PathSample {
  /** World position on the path. */
  x: number;
  y: number;
  z: number;
  /** Unit tangent (direction of travel) in the XZ plane. */
  tx: number;
  tz: number;
  /** Unit left-normal in the XZ plane (for lane offsets). */
  nx: number;
  nz: number;
  /** Y-rotation that aligns a +Z-forward mesh with the tangent. */
  yaw: number;
}

export interface Path {
  /** Total arc length in world units. */
  length: number;
  /** Sample at `t` in `[0, 1)` (wraps). Writes into and returns `out`. */
  at(t: number, out: PathSample): PathSample;
}

const TWO_PI = Math.PI * 2;

export function makePath(points: Vec3[]): Path {
  // Guard: a degenerate path still answers (stays at the single point).
  const pts = points.length >= 2 ? points : [...points, ...points];

  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const [ax, , az] = pts[i - 1]!;
    const [bx, , bz] = pts[i]!;
    cum.push(cum[i - 1]! + Math.hypot(bx - ax, bz - az));
  }
  const length = cum[cum.length - 1]! || 1;

  function at(t: number, out: PathSample): PathSample {
    // Wrap into [0, 1) then to a target arc length.
    const tt = t - Math.floor(t);
    const target = tt * length;

    // Binary-search the segment whose cumulative length brackets `target`.
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid]! <= target) lo = mid;
      else hi = mid;
    }
    const [ax, ay, az] = pts[lo]!;
    const [bx, by, bz] = pts[Math.min(hi, pts.length - 1)]!;
    const segLen = Math.max(cum[hi]! - cum[lo]!, 1e-6);
    const f = (target - cum[lo]!) / segLen;

    out.x = ax + (bx - ax) * f;
    out.y = ay + (by - ay) * f;
    out.z = az + (bz - az) * f;

    let dx = bx - ax;
    let dz = bz - az;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d;
    dz /= d;
    out.tx = dx;
    out.tz = dz;
    out.nx = -dz; // left normal
    out.nz = dx;
    // Map local +Z forward onto the tangent.
    out.yaw = Math.atan2(dx, dz);
    if (out.yaw < 0) out.yaw += TWO_PI;
    return out;
  }

  return { length, at };
}

/** Allocate a reusable sample object for a per-frame loop. */
export function emptySample(): PathSample {
  return { x: 0, y: 0, z: 0, tx: 0, tz: 1, nx: 1, nz: 0, yaw: 0 };
}
