/**
 * Memory City module catalogue barrel.
 *
 * The gate mini-games now live in the shared `@/features/unlocks` home (so the
 * Constellation sky and other hosts can render them too); importing that barrel
 * registers every gate. Memory City then adds its own 3D *reward* modules
 * (`message`, `mystery-box`) on top. A single `import ".../modules"` still wires
 * the full catalogue the city loader and renderer expect, and the registry
 * helpers are re-exported so existing imports keep working unchanged.
 */

import "@/features/unlocks"; // registers the shared gates (question, jigsaw, …).
import "./message";
import "./mystery-box";

export type {
  MemoryModule,
  ModuleEditorProps,
  ModuleInteractionProps,
  ModuleKind,
  ModuleMeta,
  ModuleShellProps,
} from "@/features/unlocks";
export {
  getModule,
  hasModule,
  listModules,
  registerModule,
  requireModule,
} from "@/features/unlocks";
