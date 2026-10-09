/** Move the sky by pixel deltas. Positive dx/dy follow the finger. */
export type SkyPan = (
  dx: number,
  dy: number,
  width: number,
  height: number,
) => void;

/**
 * Trackpad wheel and a two-finger touch pan the sky. A pinch (ctrl/meta
 * wheel on macOS) is ignored. `onTwoFinger` fires while a second finger is
 * down so a star drag can be cancelled.
 */
export function attachSkyPan(
  el: HTMLElement,
  pan: SkyPan,
  onTwoFinger?: (active: boolean) => void,
): () => void {
  const points = new Map<number, { x: number; y: number }>();
  let lastMid: { x: number; y: number } | null = null;
  let two = false;

  const midpoint = (): { x: number; y: number } | null => {
    let x = 0;
    let y = 0;
    let n = 0;
    for (const point of points.values()) {
      x += point.x;
      y += point.y;
      n += 1;
    }
    return n > 0 ? { x: x / n, y: y / n } : null;
  };

  const setTwo = (next: boolean) => {
    if (two === next) return;
    two = next;
    onTwoFinger?.(next);
  };

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    pan(-event.deltaX, -event.deltaY, el.clientWidth, el.clientHeight);
  };

  const onStart = (event: TouchEvent) => {
    for (const touch of Array.from(event.changedTouches)) {
      points.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    }
    if (points.size >= 2) {
      setTwo(true);
      lastMid = midpoint();
    }
  };

  const onMove = (event: TouchEvent) => {
    for (const touch of Array.from(event.changedTouches)) {
      if (!points.has(touch.identifier)) continue;
      points.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    }
    if (points.size < 2) return;
    event.preventDefault();
    const next = midpoint();
    if (next && lastMid) {
      pan(
        next.x - lastMid.x,
        next.y - lastMid.y,
        el.clientWidth,
        el.clientHeight,
      );
    }
    lastMid = next;
  };

  const onEnd = (event: TouchEvent) => {
    for (const touch of Array.from(event.changedTouches)) {
      points.delete(touch.identifier);
    }
    if (points.size < 2) {
      lastMid = null;
      setTwo(false);
    } else {
      lastMid = midpoint();
    }
  };

  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("touchstart", onStart, { passive: true });
  el.addEventListener("touchmove", onMove, { passive: false });
  el.addEventListener("touchend", onEnd);
  el.addEventListener("touchcancel", onEnd);
  return () => {
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("touchstart", onStart);
    el.removeEventListener("touchmove", onMove);
    el.removeEventListener("touchend", onEnd);
    el.removeEventListener("touchcancel", onEnd);
  };
}
