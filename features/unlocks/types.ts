/**
 * Memory City — the module contract.
 *
 * A **module** is a self-contained interactive unit: a crossword, an image
 * puzzle, a question, a mystery box, or a reward payload like a message or
 * gallery. Gates *and* rewards are both modules, so they share one pipeline.
 *
 * Every module ships three things behind one contract:
 *   1. a **descriptor** (pure data — type, schema, defaults, meta) safe to
 *      import anywhere, including the bundle-sensitive city loader;
 *   2. up to three **surfaces** (3D `Shell`, activated `Interaction`, author
 *      `Editor`) exposed as *lazy loaders* so their React/Three code is only
 *      pulled in when actually rendered;
 *   3. registration via `registry.ts`.
 *
 * Adding a new game = create a folder under `modules/`, implement this contract,
 * call `registerModule()`. No core file changes — that is the extensibility the
 * product needs ("insert components one by one in the future").
 */

import type { ComponentType } from "react";
import type { z } from "zod";

/** What role a module can play on a node. */
export type ModuleKind = "gate" | "reward" | "both";

/** Palette / display hints for the (later) builder palette and HUD. */
export interface ModuleMeta {
  /** Author-facing name, e.g. "Image Puzzle". */
  label: string;
  /** One-line description for the builder. */
  description: string;
  /** lucide-react icon name, e.g. "puzzle". */
  icon: string;
}

/**
 * Props passed to a module's 3D `Shell` — its presence in the city. The shell
 * renders the building/object, reflects the locked/unlocked state, and calls
 * `onActivate` when the player engages it (which raises the `Interaction`).
 */
export interface ModuleShellProps<TConfig = unknown> {
  config: TConfig;
  /** Accent colour resolved from the node's mood / theme. */
  accent: string;
  /** Host-defined mood/tone key (e.g. Memory City's `Mood`); opaque here. */
  mood: string;
  /** True until a gate is solved (drives the holographic locked look). */
  locked: boolean;
  /** Raise the activated interaction surface. */
  onActivate: () => void;
}

/**
 * Props for a module's activated surface (a DOM overlay or in-world panel).
 *
 * For a **gate**, `onSolve` reports the challenge was completed (the node
 * unlocks). For a **reward**, the surface *is* the reveal; `onClose` dismisses
 * it. Modules that are both call `onSolve` then render their reward.
 */
export interface ModuleInteractionProps<TConfig = unknown> {
  config: TConfig;
  /** Gate solved / challenge passed. */
  onSolve: () => void;
  /** Dismiss the surface and resume the tour. */
  onClose: () => void;
}

/** Props for a module's author-side editor (powers the later builder). */
export interface ModuleEditorProps<TConfig = unknown> {
  config: TConfig;
  onChange: (next: TConfig) => void;
}

/**
 * A lazy component loader. Surfaces are loaded on demand (via `React.lazy` /
 * `next/dynamic`) so a module's 3D + interaction code never weighs down the
 * initial city bundle.
 */
export type LazyLoader<P> = () => Promise<{ default: ComponentType<P> }>;

/**
 * The full module contract. `TConfig` is the module's own config shape, kept
 * type-safe end to end: `schema` validates it on load, `defaults()` seeds it in
 * the builder, and every surface receives it already narrowed.
 */
export interface MemoryModule<TConfig = unknown> {
  /** Unique registry key, e.g. "mystery-box". Must match `ModuleRef.type`. */
  type: string;
  kind: ModuleKind;
  meta: ModuleMeta;
  /** Validates `ModuleRef.config` for this module on city load. */
  schema: z.ZodType<TConfig>;
  /** Fresh default config for a newly placed node (builder). */
  defaults: () => TConfig;

  /**
   * Optional non-interactive unlock predicate. When present and it returns
   * true, the gate counts as already open with no challenge to solve — the host
   * reveals the content directly. Used by purely temporal gates (time-lock),
   * where "solving" is a function of the clock, not a user action. Interactive
   * gates (question, jigsaw) leave this unset and unlock only via `onSolve`.
   */
  isUnlocked?: (config: TConfig) => boolean;

  /** 3D presence in the city. Optional while a module is data-only (Phase 0). */
  Shell?: LazyLoader<ModuleShellProps<TConfig>>;
  /** Activated surface (gate challenge or reward reveal). */
  Interaction?: LazyLoader<ModuleInteractionProps<TConfig>>;
  /** Author editor for the builder. */
  Editor?: LazyLoader<ModuleEditorProps<TConfig>>;
}
