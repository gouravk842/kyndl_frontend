"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import {
  beginStrike,
  createHammerSim,
  type HammerSim,
  pointHammer,
  stepHammer,
} from "@/features/whack-a-mole/lib/hammer-physics";

/**
 * Cursor mallet. Pose is written straight to the DOM from the physics step
 * so React never restarts the swing.
 */
export function useMallet(reduceMotion: boolean) {
  const sim = useRef<HammerSim>(createHammerSim());
  const malletRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);
  const reduceRef = useRef(reduceMotion);

  useEffect(() => {
    reduceRef.current = reduceMotion;
  }, [reduceMotion]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const body = sim.current;
      const el = malletRef.current;
      if (el && !body.strike) {
        const measured = el.offsetWidth;
        if (measured > 0) body.size = measured;
      }
      if (body.seen) stepHammer(body, dt);
      if (el && body.seen) {
        el.style.opacity = shown.current ? "1" : "0";
        el.style.transform = `translate3d(${body.gripX}px, ${body.gripY}px, 0) translate(-20%, -88%) rotate(${body.angle}rad)`;
      }
      const shadow = shadowRef.current;
      if (shadow && body.seen) {
        shadow.style.opacity = shown.current
          ? body.strike
            ? "0.35"
            : "0.22"
          : "0";
        shadow.style.transform = `translate3d(${body.headX}px, ${body.headY}px, 0) translate(-50%, -20%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const show = () => {
    shown.current = true;
    setVisible((v) => (v ? v : true));
  };

  const follow = (x: number, y: number) => {
    pointHammer(sim.current, x, y);
    show();
  };

  const strike = (x: number, y: number) => {
    const el = malletRef.current;
    if (el && el.offsetWidth > 0) sim.current.size = el.offsetWidth;
    pointHammer(sim.current, x, y);
    show();
    if (reduceRef.current) {
      const body = sim.current;
      body.headX = x;
      body.headY = y;
      body.hvx = 0;
      body.hvy = 0;
      body.strike = null;
      return;
    }
    beginStrike(sim.current);
  };

  const hide = () => {
    if (sim.current.strike) return;
    shown.current = false;
    setVisible(false);
  };

  return { malletRef, shadowRef, visible, follow, strike, hide };
}

export function Mallet({
  malletRef,
  shadowRef,
  visible,
}: {
  malletRef: RefObject<HTMLDivElement | null>;
  shadowRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
}) {
  return (
    <>
      <div
        ref={shadowRef}
        aria-hidden
        className="pointer-events-none absolute z-30 h-6 w-14 rounded-full bg-[#3a2418]/40 blur-md"
        style={{ opacity: 0, left: 0, top: 0 }}
      />
      <div
        ref={malletRef}
        aria-hidden
        className="pointer-events-none absolute z-40"
        style={{
          left: 0,
          top: 0,
          width: "clamp(96px, 20vw, 136px)",
          height: "clamp(96px, 20vw, 136px)",
          transformOrigin: "20% 88%",
          opacity: visible ? 1 : 0,
          willChange: "transform",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="size-full drop-shadow-[0_10px_12px_rgba(40,18,10,0.4)]"
        >
          <defs>
            <linearGradient id="wm-handle" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6b3e22" />
              <stop offset="0.35" stopColor="#e7c59a" />
              <stop offset="0.72" stopColor="#b9834e" />
              <stop offset="1" stopColor="#5a3418" />
            </linearGradient>
            <radialGradient id="wm-head" cx="32%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffd0d6" />
              <stop offset="28%" stopColor="#e23b52" />
              <stop offset="70%" stopColor="#9d1428" />
              <stop offset="100%" stopColor="#4c0812" />
            </radialGradient>
          </defs>
          <path
            d="M20 88 C28 70 40 52 66 30"
            fill="none"
            stroke="url(#wm-handle)"
            strokeWidth="8.5"
            strokeLinecap="round"
          />
          <path
            d="M24 80 C30 66 40 54 58 38"
            fill="none"
            stroke="#f3ddc2"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
          <ellipse
            cx="66"
            cy="27"
            rx="23"
            ry="15"
            fill="#4c0812"
            transform="rotate(-18 66 27)"
          />
          <ellipse
            cx="66"
            cy="24"
            rx="22"
            ry="13.5"
            fill="url(#wm-head)"
            transform="rotate(-18 66 24)"
          />
          <ellipse
            cx="60"
            cy="20"
            rx="10"
            ry="5"
            fill="#fff"
            opacity="0.28"
            transform="rotate(-18 60 20)"
          />
        </svg>
      </div>
    </>
  );
}
