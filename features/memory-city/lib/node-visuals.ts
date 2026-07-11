/**
 * Visual helpers shared by a node's 3D shell, its holographic marker, and the
 * DOM reward panel — so the accent colour always agrees across the boundary.
 *
 * Accent is driven by the reward's `mood` when the reward is a `message`
 * (the common case); anything else falls back to a neutral joyful amber. As more
 * reward modules gain moods this can widen without callers changing.
 */

import type { MessageConfig } from "../modules/message";
import type { MemoryNode, Mood } from "../types";
import { MOOD_COLORS } from "../types";

/** Best-effort mood for a node, read from its reward config. */
export function nodeMood(node: MemoryNode): Mood {
  if (node.reward.type === "message") {
    return (node.reward.config as MessageConfig).mood;
  }
  return "joyful";
}

/** Accent colour for a node (its mood's glow colour). */
export function nodeAccent(node: MemoryNode): string {
  return MOOD_COLORS[nodeMood(node)];
}

/** Display title of a node, read from its reward config (message / mystery-box). */
export function nodeTitle(node: MemoryNode): string {
  const config = node.reward.config as { title?: string };
  return config?.title ?? "A memory";
}
