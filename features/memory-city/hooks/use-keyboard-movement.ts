import { useEffect, useRef } from "react";

/** Live WASD/arrow movement state, read inside the render loop. */
export interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

const KEY_MAP: Record<string, keyof MovementState> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

/**
 * Tracks WASD / arrow keys in a ref (not state) so the animation loop can read
 * the latest values every frame without triggering React re-renders. `enabled`
 * gates the listeners (movement is suspended while a reward panel is open).
 */
export function useKeyboardMovement(enabled: boolean) {
  const movement = useRef<MovementState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!enabled) {
      movement.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };
      return;
    }

    const set = (code: string, value: boolean) => {
      const dir = KEY_MAP[code];
      if (dir) movement.current[dir] = value;
    };
    const onDown = (e: KeyboardEvent) => set(e.code, true);
    const onUp = (e: KeyboardEvent) => set(e.code, false);

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [enabled]);

  return movement;
}
