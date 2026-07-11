"use client";

import { type PointerEvent as ReactPointerEvent, useCallback, useRef } from "react";

import { useLanternStore } from "../store";

const DRAG_SCALE = 0.008; // radians of spin per pixel dragged

/**
 * Grab-and-spin for the lantern. Returns pointer handlers to spread on the canvas
 * container: dragging turns the lantern 1:1 with the pointer, a flick imparts
 * momentum that decays, and simply holding it still pauses the auto-spin (because
 * `grabbing` freezes it and a motionless hold adds no rotation). All motion is
 * written into the shared, mutable `control` so the frame loop can consume it
 * without any React churn.
 */
export function useLanternDrag() {
  const lastX = useRef<number | null>(null);

  const onPointerDown = useCallback((e: ReactPointerEvent) => {
    const control = useLanternStore.getState().control;
    control.grabbing = true;
    control.velocity = 0;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    if (lastX.current === null) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    const control = useLanternStore.getState().control;
    control.pending += dx * DRAG_SCALE;
    control.velocity = dx * DRAG_SCALE; // last motion becomes the flick momentum
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent) => {
    const control = useLanternStore.getState().control;
    control.grabbing = false;
    lastX.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
