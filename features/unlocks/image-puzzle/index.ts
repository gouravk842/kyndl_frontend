/**
 * Image Puzzle module — a gate. A sliding tile puzzle the recipient solves to
 * unlock the memory. With an `imageUrl` the tiles are slices of that photo;
 * without one they fall back to numbered accent tiles, so the gate works even
 * before any photo is uploaded.
 *
 * The photo can be supplied two ways: a direct `imageUrl` (a public path or a
 * URL the host already resolved), or an `image` *media reference* (`{fileId}`)
 * that the host resolves to a presigned URL and injects as `imageUrl` at render
 * time. The interaction only ever reads `imageUrl`, staying host-agnostic.
 */

import { z } from "zod";

import { registerModule } from "../registry";
import type { MemoryModule } from "../types";

export const imagePuzzleConfigSchema = z.object({
  /** Grid dimension (size×size tiles). */
  size: z.number().int().min(2).max(4).default(3),
  /** Optional photo to slice into tiles (a URL the host can render directly). */
  imageUrl: z.string().optional(),
  /** Optional uploaded photo, as a media reference the host resolves to a URL. */
  image: z.object({ fileId: z.string().min(1) }).optional(),
  /** Prompt shown above the board. */
  prompt: z.string().optional(),
});

export type ImagePuzzleConfig = z.infer<typeof imagePuzzleConfigSchema>;

export const imagePuzzleModule: MemoryModule<ImagePuzzleConfig> = {
  type: "image-puzzle",
  kind: "gate",
  meta: {
    label: "Image Puzzle",
    description: "A sliding-tile puzzle they reassemble to unlock the memory.",
    icon: "puzzle",
  },
  schema: imagePuzzleConfigSchema,
  defaults: (): ImagePuzzleConfig => ({ size: 3 }),
  Interaction: () => import("./interaction"),
};

registerModule(imagePuzzleModule);
