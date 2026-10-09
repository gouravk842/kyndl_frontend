"use client";

import { useEffect, useRef } from "react";

import { ellipsePoint } from "./layout";

export type OrbitBody = {
  rx: number;
  ry: number;
  baseAngle: number;
  period: number;
  ax: number;
  ay: number;
  delay?: number;
  duration?: number;
};

export type OrbitIntro = {
  releasing: boolean;
  innerR: number;
};

type Node = { el: HTMLElement; body: OrbitBody; introStart: number | null };

function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

function introAmount(node: Node, now: number, reduce: boolean) {
  if (reduce) return 1;
  if (node.introStart == null) return 0;
  const delay = node.body.delay ?? 0;
  const duration = node.body.duration ?? 0.9;
  const t = (now - node.introStart) / 1000 - delay;
  if (t <= 0) return 0;
  if (t >= duration) return 1;
  return easeOut(t / duration);
}

export function useOrbitLoop(
  paused: boolean,
  reduceMotion: boolean,
  cx: number,
  cy: number,
  intro?: OrbitIntro,
) {
  const nodes = useRef(new Map<string, Node>());
  const introStarts = useRef(new Map<string, number | null>());
  const origin = useRef({ cx, cy });
  const pausedRef = useRef(paused);
  const reduceRef = useRef(reduceMotion);
  const introRef = useRef(intro);
  const time = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    reduceRef.current = reduceMotion;
  }, [reduceMotion]);

  useEffect(() => {
    origin.current = { cx, cy };
  }, [cx, cy]);

  useEffect(() => {
    introRef.current = intro;
    const now = performance.now();
    introStarts.current.forEach((start, id) => {
      if (!intro?.releasing) {
        introStarts.current.set(id, null);
      } else if (start == null) {
        introStarts.current.set(id, now);
      }
    });
    nodes.current.forEach((node, id) => {
      node.introStart = introStarts.current.get(id) ?? null;
    });
  }, [intro]);

  function place(node: Node, orbitT: number, now: number) {
    const center = origin.current;
    const bloom = introRef.current;
    const reduce = reduceRef.current;
    const amount = bloom ? introAmount(node, now, reduce) : 1;
    const inner = bloom?.innerR ?? 0;
    const rx = inner + (node.body.rx - inner) * amount;
    const ry = inner + (node.body.ry - inner) * amount;
    const angle =
      node.body.baseAngle + (orbitT / node.body.period) * Math.PI * 2;
    const pos = ellipsePoint(center.cx, center.cy, rx, ry, angle);
    node.el.style.transform = `translate3d(${pos.x - node.body.ax}px, ${pos.y - node.body.ay}px, 0)`;
  }

  function bind(id: string, body: OrbitBody) {
    return (el: HTMLElement | null) => {
      if (!el) {
        nodes.current.delete(id);
        return;
      }
      const releasing = introRef.current?.releasing ?? true;
      let introStart = introStarts.current.get(id);
      if (introStart === undefined) {
        introStart = releasing ? performance.now() : null;
        introStarts.current.set(id, introStart);
      } else if (introStart == null && releasing) {
        introStart = performance.now();
        introStarts.current.set(id, introStart);
      }
      const node: Node = { el, body, introStart };
      nodes.current.set(id, node);
      place(node, reduceRef.current ? 0 : time.current, performance.now());
    };
  }

  useEffect(() => {
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const hidden = document.visibilityState === "hidden";
      if (!pausedRef.current && !hidden && !reduceRef.current) {
        time.current += dt / 1000;
      }
      const orbitT = reduceRef.current ? 0 : time.current;
      nodes.current.forEach((node) => place(node, orbitT, now));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return { bind };
}
