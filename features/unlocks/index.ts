/**
 * Unlock modules — the shared gate catalogue.
 *
 * A **gate** is a self-contained interactive challenge (a question, a jigsaw, a
 * time-lock, …) that stands in front of a piece of content: solve it and the
 * content is revealed. Gates ship behind one contract (`types.ts`) and register
 * into one process-wide map (`registry.ts`), so any host — Memory City's 3D
 * world, the Constellation sky, a future gift reveal — can render any gate
 * without knowing what it is.
 *
 * Importing this barrel once registers every gate (each self-registers on
 * import). A host wires the whole catalogue with a single
 * `import "@/features/unlocks"`.
 *
 * To add a new gate: create its folder, implement the `MemoryModule` contract,
 * call `registerModule()` at the bottom of its file, then add one import line
 * below. That is the only central edit.
 */

import "./crossword";
import "./image-puzzle";
import "./question";
import "./time-lock";

export {
  getModule,
  hasModule,
  listModules,
  registerModule,
  requireModule,
} from "./registry";
export type {
  MemoryModule,
  ModuleEditorProps,
  ModuleInteractionProps,
  ModuleKind,
  ModuleMeta,
  ModuleShellProps,
} from "./types";
