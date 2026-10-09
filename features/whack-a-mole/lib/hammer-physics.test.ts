import { describe, expect, it } from "vitest";

import {
  beginStrike,
  createHammerSim,
  HAMMER,
  poseAt,
  stepHammer,
  type Strike,
} from "./hammer-physics";

function strikeFrom(
  headX: number,
  headY: number,
  angle: number,
  aimX: number,
  aimY: number,
): Strike {
  return { t: 0, headX, headY, angle, aimX, aimY };
}

describe("mallet strike", () => {
  it("starts on the current head and lands on the hole", () => {
    const strike = strikeFrom(40, 80, HAMMER.restAngle, 180, 220);
    const start = poseAt(0, strike, 120);
    expect(start.headX).toBeCloseTo(40, 4);
    expect(start.headY).toBeCloseTo(80, 4);
    expect(start.angle).toBeCloseTo(HAMMER.restAngle, 5);

    const hit = poseAt(HAMMER.impactU, strike, 120);
    expect(hit.headX).toBeCloseTo(180, 4);
    expect(hit.headY).toBeCloseTo(220, 4);
    expect(hit.angle).toBeCloseTo(HAMMER.impactAngle, 5);
  });

  it("keeps the head path continuous through the swing", () => {
    const strike = strikeFrom(10, 30, 0.2, 220, 160);
    let prev = poseAt(0, strike, 100);
    let maxStep = 0;
    let maxTurn = 0;
    for (let i = 1; i <= 60; i++) {
      const pose = poseAt(i / 60, strike, 100);
      maxStep = Math.max(
        maxStep,
        Math.hypot(pose.headX - prev.headX, pose.headY - prev.headY),
      );
      maxTurn = Math.max(maxTurn, Math.abs(pose.angle - prev.angle));
      prev = pose;
    }
    expect(maxStep).toBeLessThan(48);
    expect(maxTurn).toBeLessThan(0.28);
  });

  it("hands a finished swing back to the follow spring", () => {
    const sim = createHammerSim();
    sim.size = 110;
    sim.headX = 30;
    sim.headY = 40;
    sim.angle = HAMMER.restAngle;
    sim.seen = true;
    sim.targetX = 240;
    sim.targetY = 180;
    beginStrike(sim);

    let landed = false;
    for (let i = 0; i < 90 && sim.strike; i++) {
      const before = sim.strike.t;
      stepHammer(sim, 1 / 120);
      const crossed =
        before < HAMMER.strikeSeconds * HAMMER.impactU &&
        sim.strike != null &&
        sim.strike.t >= HAMMER.strikeSeconds * HAMMER.impactU;
      if (crossed) {
        expect(sim.headX).toBeCloseTo(240, 0);
        expect(sim.headY).toBeCloseTo(180, 0);
        landed = true;
      }
    }
    expect(landed).toBe(true);

    for (let i = 0; i < 60; i++) stepHammer(sim, 1 / 60);
    expect(sim.strike).toBeNull();
    expect(Number.isFinite(sim.headX)).toBe(true);
    expect(Number.isFinite(sim.angle)).toBe(true);
  });
});
