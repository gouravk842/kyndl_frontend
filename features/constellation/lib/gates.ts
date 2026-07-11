/**
 * Constellation — gate resolution.
 *
 * A star may hide its memory behind a *gate*: a question, a jigsaw, a time-lock.
 * Gates are shared unlock modules (`@/features/unlocks`); a star only carries an
 * opaque `{ type, config }` reference, validated here against the module's own
 * schema when the sky loads — the same trust boundary Memory City uses.
 *
 * These are pure helpers over a single star. The engine owns *which* stars the
 * viewer has cleared (persisted per-sky); this file only answers "does this star
 * have a real gate, and has time already opened it?".
 */

import "@/features/unlocks"; // register every gate before we resolve refs.

import type { MemoryModule } from "@/features/unlocks";
import { getModule } from "@/features/unlocks";

import type { Star } from "../config";

export type ResolvedGate = {
  type: string;
  mod: MemoryModule<unknown>;
  /** Config normalised against the module's schema (defaults applied). */
  config: unknown;
};

/**
 * A star's display photo URL: its uploaded `image` (fileId → presigned URL from
 * `assets`) wins, then the legacy inline `imageUrl` path, else null. The one
 * place that knows both photo sources, so the card and the jigsaw agree.
 */
export function starImageUrl(
  star: Star,
  assets: Record<string, string> = {},
): string | null {
  const fromRef = star.image?.fileId ? assets[star.image.fileId] : undefined;
  return fromRef ?? star.imageUrl ?? null;
}

/**
 * Resolve a star's gate to its module + validated config, or `null` if the star
 * has no gate and should open immediately.
 *
 * `assets` maps a `fileId` to its presigned URL (from the creation payload, or a
 * builder's local previews). It's only needed when actually rendering a gate: a
 * jigsaw's uploaded `image` ref is resolved to a real `imageUrl` here, falling
 * back to a direct `imageUrl` and then the star's own photo. Gating *decisions*
 * (is this locked?) call this without `assets` — they don't touch the image.
 *
 * Resilient by design: an unknown module type or a config that fails the
 * module's schema resolves to `null` (no gate) rather than throwing — a bad
 * block can never lock a memory shut or crash the sky.
 */
export function resolveGate(
  star: Star,
  assets: Record<string, string> = {},
): ResolvedGate | null {
  const gate = star.unlock;
  if (!gate || !gate.type) return null;

  const mod = getModule(gate.type);
  if (!mod) return null;

  const parsed = mod.schema.safeParse(gate.config ?? {});
  if (!parsed.success) return null;

  let config = parsed.data;
  // Resolve the jigsaw's photo: an uploaded `image` ref (fileId → URL) wins,
  // then a direct `imageUrl`, then the star's own image — so a puzzle can reuse
  // the memory's photo, or carry its own. No photo → the numbered-tile fallback.
  if (gate.type === "image-puzzle" && config && typeof config === "object") {
    const cfg = config as { imageUrl?: string; image?: { fileId?: string } };
    const fromRef = cfg.image?.fileId ? assets[cfg.image.fileId] : undefined;
    const resolved =
      fromRef ?? cfg.imageUrl ?? starImageUrl(star, assets) ?? undefined;
    if (resolved && resolved !== cfg.imageUrl) {
      config = { ...(config as object), imageUrl: resolved };
    }
  }

  return { type: gate.type, mod, config };
}

/**
 * True if the gate needs no interaction to open — currently only a temporal
 * gate (time-lock) whose instant has already passed. Interactive gates return
 * false and must be solved via the challenge surface.
 */
export function isAutoUnlocked(gate: ResolvedGate): boolean {
  return gate.mod.isUnlocked?.(gate.config) === true;
}

/** True if `star` has an interactive gate the viewer must still solve to open. */
export function hasPendingChallenge(star: Star): boolean {
  const gate = resolveGate(star);
  return gate !== null && !isAutoUnlocked(gate);
}

/** Whether every star this one `requires` has already been cleared. */
export function requirementsMet(
  star: Star,
  cleared: ReadonlySet<number>,
): boolean {
  return (star.requires ?? []).every((id) => cleared.has(id));
}
