/**
 * Memory City — core domain model.
 *
 * A *city* is a small dusk world the recipient revolves through. Every memory is
 * a **node**: a place with a visual `shell` (the building / installation), an
 * optional `gate` (a challenge that must be solved), and a `reward` (the payload
 * that is revealed — a message, a gallery, a mystery box…).
 *
 * Gates and rewards are not hard-coded here. They are **module references**
 * (`ModuleRef`) resolved against the module registry (`modules/registry.ts`) at
 * runtime. That indirection is the whole point: a new game is added by
 * registering a module, never by editing this file.
 *
 * The entire experience is one serializable `CityConfig`. Today it comes from a
 * seed (`data/seed-city.ts`); later the author builder writes it and the
 * recipient's share link (`/city/:id`) reads it — same renderer, two `mode`s.
 */

/** A world-space coordinate: `[x, y, z]`. */
export type Vec3 = [number, number, number];

/**
 * Emotional tone of a memory. Drives accent colour for the node's glow, the
 * reward panel, and the unlocked-state lighting. (Carried over from the original
 * Memory Lane so existing art reads consistently.)
 *
 * Declared as a tuple first so module Zod schemas can reuse it as the single
 * source of truth (`z.enum(MOODS)`).
 */
export const MOODS = [
  "joyful",
  "nostalgic",
  "bittersweet",
  "epic",
  "quiet",
] as const;

export type Mood = (typeof MOODS)[number];

/** Mood → accent colour. */
export const MOOD_COLORS: Record<Mood, string> = {
  joyful: "#FFC24B", // warm amber / gold
  nostalgic: "#A98BFF", // soft violet
  bittersweet: "#7FA6C9", // muted blue-grey
  epic: "#EAF2FF", // bright silver-white
  quiet: "#7FD9C0", // pale teal
};

/** Human-friendly mood labels. */
export const MOOD_LABELS: Record<Mood, string> = {
  joyful: "Joyful",
  nostalgic: "Nostalgic",
  bittersweet: "Bittersweet",
  epic: "Epic",
  quiet: "Quiet",
};

/**
 * A reference to a registered module plus its author-supplied configuration.
 *
 * `config` is intentionally `unknown` here: the node model stays agnostic of
 * every module's config shape, so adding a module never widens this type. The
 * config is validated against the module's own Zod schema when the city is
 * loaded (`schema.ts`), and narrowed to a concrete type inside that module.
 */
export interface ModuleRef {
  /** Registered module type, e.g. "message" | "question" | "mystery-box". */
  type: string;
  /** Module-specific config; validated by the module's schema on load. */
  config: unknown;
}

/**
 * The visual body of a node — the building or installation the player sees in
 * the city before (and after) it is unlocked. `kind` selects the shell model;
 * `params` is shell-specific styling. Kept open (string) so new shells can be
 * added without a breaking union.
 */
export interface NodeShell {
  /** Shell model id, e.g. "tower" | "pavilion" | "lantern" | "vault". */
  kind: string;
  /** Free-form shell styling (height, palette overrides, …). */
  params?: Record<string, unknown>;
}

/**
 * A single memory in the city.
 *
 * Unlock flow: if `gate` is present the player must solve it before `reward`
 * is revealed; with no gate the reward opens on interaction. `requires` lets a
 * node stay sealed until other nodes are recalled, enabling a progression path
 * through the city.
 */
export interface MemoryNode {
  id: string;
  /** District this node belongs to (for grouping + step-off roaming). */
  districtId: string;
  /** World placement of the node's anchor. */
  transform: { position: Vec3; rotationY?: number; scale?: number };
  /** The building / installation the player sees. */
  shell: NodeShell;
  /** Optional challenge guarding the reward. Absent → opens on interaction. */
  gate?: ModuleRef;
  /** The payload revealed when unlocked (itself a module). */
  reward: ModuleRef;
  /** Node ids that must be recalled before this one unseals. */
  requires?: string[];
}

/** A cluster of nodes the player can step off the tour to roam. */
export interface District {
  id: string;
  /** Display name, e.g. "The Harbour Years". */
  name: string;
  /** Centre of the district on the ground plane. */
  center: Vec3;
}

/**
 * "Dream-tech dusk" theme expressed as data, so the art direction travels with
 * the config (and the later builder can offer palette presets). Stylized warm
 * base + cool sky + a neon accent for interactive / holographic elements.
 */
export interface DreamTechTheme {
  /** Warm horizon glow. */
  horizon: string;
  /** Cool upper sky. */
  sky: string;
  /** Neon accent for interactive edges + holograms. */
  accent: string;
  /** Colour a *locked* (holographic, not-yet-solved) node shimmers in. */
  locked: string;
  /** Distance-fog density (matches `fogExp2`). */
  fogDensity: number;
}

/** Sensible default dusk theme. */
export const DEFAULT_THEME: DreamTechTheme = {
  horizon: "#f0a868",
  sky: "#2a2f6b",
  accent: "#7fd9ff",
  locked: "#7f97ff",
  fogDensity: 0.016,
};

/**
 * A non-interactive building placed by the layout engine to give the city
 * density — a street wall the memory buildings stand among. Derived, never authored.
 */
export interface FillerBuilding {
  position: Vec3;
  /** Full extents `[width, height, depth]`. */
  size: Vec3;
  rotationY: number;
  /** 0..1 seeded value → palette / lit-window density in the renderer. */
  tint: number;
}

/**
 * The generated "city fabric": everything the layout engine produces beyond the
 * memory nodes themselves — the filler skyline and the road network. Optional so
 * a hand-authored `CityConfig` (no engine run) still validates.
 */
export interface CityFabric {
  fillers: FillerBuilding[];
  /** Ground polylines: the spiral avenue + radial connectors. */
  roads: Vec3[][];
  /** Outer radius of the built city (fog / ground sizing). */
  radius: number;
}

/**
 * Meaning-first authored memory. This is what the builder edits and the backend
 * stores — **no world coordinates.** The layout engine derives position, era, and
 * facing from the ordered set (see `lib/layout/generate.ts`).
 */
export interface CityMemory {
  id: string;
  /** ISO date (YYYY-MM-DD) — drives chronological placement + era bucketing. */
  date: string;
  title: string;
  body: string;
  person?: string;
  mood: Mood;
  imageUrl?: string;
  /** Optional shell override; otherwise chosen deterministically from the memory. */
  shellKind?: string;
  /** Optional challenge guarding the reward. */
  gate?: ModuleRef;
  /** Optional reward override; defaults to a `message` built from the fields above. */
  reward?: ModuleRef;
  /** Node ids that must be recalled before this one unseals. */
  requires?: string[];
}

/** Whether the renderer is showing the recipient's experience or the builder. */
export type CityMode = "play" | "edit";

/**
 * The complete, serializable experience. Authoring writes it; the share link
 * reads it; the renderer is driven entirely by it.
 */
export interface CityConfig {
  id: string;
  /** Headline, e.g. "Our City of Years". */
  title: string;
  /** Gift attribution. */
  from?: string;
  to?: string;
  theme: DreamTechTheme;
  layout: {
    /** Control points of the guided revolve spline (camera path). */
    spline: Vec3[];
    districts: District[];
  };
  nodes: MemoryNode[];
  /** Generated filler skyline + roads. Present when built by the layout engine. */
  fabric?: CityFabric;
  /** Recipient (`play`) vs author (`edit`). Defaults to "play". */
  mode?: CityMode;
}
