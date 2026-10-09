/**
 * Mallet as a rigid body: the head tracks the pointer on a critically damped
 * spring, and a strike locks the grip so the head arcs onto the hole.
 * The strike curve is C1 (zero angular velocity at each joint) so the swing
 * doesn't pop the way a remounted keyframe sequence does.
 */

export const HAMMER = {
  restAngle: 0.36,
  windupAngle: 0.9,
  impactAngle: -0.58,
  strikeSeconds: 0.42,
  /** Fraction of the strike when the head meets the hole. */
  impactU: 0.5,
  windupU: 0.28,
  /** Head center relative to the grip, as a fraction of mallet size. */
  headOffset: { x: 0.46, y: -0.64 },
  /** Critically damped follow speed (rad/s). Higher = tighter, still no wobble. */
  followOmega: 16,
  angleOmega: 14,
} as const;

export function impactDelayMs(reduceMotion = false): number {
  if (reduceMotion) return 0;
  return Math.round(HAMMER.strikeSeconds * HAMMER.impactU * 1000);
}

export type Strike = {
  t: number;
  headX: number;
  headY: number;
  angle: number;
  aimX: number;
  aimY: number;
};

export type HammerSim = {
  headX: number;
  headY: number;
  hvx: number;
  hvy: number;
  angle: number;
  angVel: number;
  gripX: number;
  gripY: number;
  targetX: number;
  targetY: number;
  size: number;
  seen: boolean;
  strike: Strike | null;
};

export function createHammerSim(): HammerSim {
  return {
    headX: 0,
    headY: 0,
    hvx: 0,
    hvy: 0,
    angle: HAMMER.restAngle,
    angVel: 0,
    gripX: 0,
    gripY: 0,
    targetX: 0,
    targetY: 0,
    size: 112,
    seen: false,
    strike: null,
  };
}

function smootherstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function rotate(
  x: number,
  y: number,
  angle: number,
): { x: number; y: number } {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: c * x - s * y, y: s * x + c * y };
}

export function gripForHead(
  headX: number,
  headY: number,
  angle: number,
  size: number,
): { x: number; y: number } {
  const r = rotate(
    HAMMER.headOffset.x * size,
    HAMMER.headOffset.y * size,
    angle,
  );
  return { x: headX - r.x, y: headY - r.y };
}

export function strikeAngle(u: number, from: number): number {
  const { windupU, impactU, windupAngle, impactAngle, restAngle } = HAMMER;
  if (u < windupU) return lerp(from, windupAngle, smootherstep(u / windupU));
  if (u < impactU) {
    return lerp(
      windupAngle,
      impactAngle,
      smootherstep((u - windupU) / (impactU - windupU)),
    );
  }
  return lerp(
    impactAngle,
    restAngle,
    smootherstep((u - impactU) / (1 - impactU)),
  );
}

export function poseAt(
  u: number,
  strike: Strike,
  size: number,
): {
  headX: number;
  headY: number;
  angle: number;
  gripX: number;
  gripY: number;
} {
  const clamped = Math.min(1, Math.max(0, u));
  const angle = strikeAngle(clamped, strike.angle);
  const fromGrip = gripForHead(strike.headX, strike.headY, strike.angle, size);
  const toGrip = gripForHead(
    strike.aimX,
    strike.aimY,
    HAMMER.impactAngle,
    size,
  );
  const gripT =
    clamped < HAMMER.windupU ? smootherstep(clamped / HAMMER.windupU) : 1;
  const gripX = lerp(fromGrip.x, toGrip.x, gripT);
  const gripY = lerp(fromGrip.y, toGrip.y, gripT);
  const head = rotate(
    HAMMER.headOffset.x * size,
    HAMMER.headOffset.y * size,
    angle,
  );
  return {
    headX: gripX + head.x,
    headY: gripY + head.y,
    angle,
    gripX,
    gripY,
  };
}

function applyGrip(sim: HammerSim) {
  const grip = gripForHead(sim.headX, sim.headY, sim.angle, sim.size);
  sim.gripX = grip.x;
  sim.gripY = grip.y;
}

/** Aim the head. First contact places it without a slide from the origin. */
export function pointHammer(sim: HammerSim, x: number, y: number) {
  sim.targetX = x;
  sim.targetY = y;
  if (!sim.seen) {
    sim.headX = x;
    sim.headY = y;
    sim.seen = true;
    applyGrip(sim);
  }
}

export function beginStrike(sim: HammerSim) {
  if (!sim.seen) {
    sim.headX = sim.targetX;
    sim.headY = sim.targetY;
    sim.angle = HAMMER.restAngle;
    sim.seen = true;
  }
  sim.hvx = 0;
  sim.hvy = 0;
  sim.angVel = 0;
  sim.strike = {
    t: 0,
    headX: sim.headX,
    headY: sim.headY,
    angle: sim.angle,
    aimX: sim.targetX,
    aimY: sim.targetY,
  };
}

function springToward(
  value: number,
  vel: number,
  target: number,
  omega: number,
  dt: number,
): { value: number; vel: number } {
  const acc = omega * omega * (target - value) - 2 * omega * vel;
  const nextVel = vel + acc * dt;
  return { value: value + nextVel * dt, vel: nextVel };
}

export function stepHammer(sim: HammerSim, dt: number) {
  const step = Math.min(Math.max(dt, 0), 0.033);
  let left = Math.min(Math.max(dt, 0), 0.05);
  while (left > 0) {
    const h = Math.min(step, left);
    integrate(sim, h);
    left -= h;
  }
}

function integrate(sim: HammerSim, dt: number) {
  if (sim.strike) {
    sim.strike.t += dt;
    const u = sim.strike.t / HAMMER.strikeSeconds;
    if (u >= 1) {
      const end = poseAt(1, sim.strike, sim.size);
      sim.headX = end.headX;
      sim.headY = end.headY;
      sim.angle = end.angle;
      sim.gripX = end.gripX;
      sim.gripY = end.gripY;
      sim.hvx = 0;
      sim.hvy = 0;
      sim.angVel = 0;
      sim.strike = null;
    } else {
      const pose = poseAt(u, sim.strike, sim.size);
      sim.headX = pose.headX;
      sim.headY = pose.headY;
      sim.angle = pose.angle;
      sim.gripX = pose.gripX;
      sim.gripY = pose.gripY;
    }
    return;
  }

  const headX = springToward(
    sim.headX,
    sim.hvx,
    sim.targetX,
    HAMMER.followOmega,
    dt,
  );
  const headY = springToward(
    sim.headY,
    sim.hvy,
    sim.targetY,
    HAMMER.followOmega,
    dt,
  );
  sim.headX = headX.value;
  sim.hvx = headX.vel;
  sim.headY = headY.value;
  sim.hvy = headY.vel;

  const lean = Math.min(0.14, Math.max(-0.14, sim.hvx / 1600));
  const ang = springToward(
    sim.angle,
    sim.angVel,
    HAMMER.restAngle + lean,
    HAMMER.angleOmega,
    dt,
  );
  sim.angle = ang.value;
  sim.angVel = ang.vel;
  applyGrip(sim);
}
