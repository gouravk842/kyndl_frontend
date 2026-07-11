/**
 * Shell sizing, shared by the building renderer and the tour camera (which must
 * know how high a node's memory marker floats in order to frame it).
 */

/** Footprint + height per shell kind: [halfX, height, halfZ]. */
export const SHELL_SIZE: Record<string, [number, number, number]> = {
  tower: [0.9, 6, 0.9],
  pavilion: [1.8, 2.6, 1.4],
  lantern: [0.5, 3.4, 0.5],
  vault: [1.1, 2.2, 1.1],
};

export function shellSize(kind: string): [number, number, number] {
  return SHELL_SIZE[kind] ?? SHELL_SIZE.vault!;
}

/** World height the floating memory marker sits at for a given shell. */
export function markerHeight(kind: string): number {
  return shellSize(kind)[1] + 1.3;
}
