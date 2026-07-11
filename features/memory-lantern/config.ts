/**
 * Memory Lantern — content & art-direction config.
 *
 * Everything personal lives here: the recipient, the title, and the ordered
 * `panes` (one photo facet each). The order of `panes` is the order they sit
 * around the ring, which is the order they turn to face the viewer.
 *
 * Mirrors the backend `MemoryLanternContentSerializer`. The art-direction blocks
 * (`material` / `motion` / `ambience` / `finale`) are optional and defaulted on
 * the client, so the renderer never has to guard a missing block.
 */

export type Pane = {
  /** Stable key + ring order. */
  id: string;
  /** Media handle for the photo (resolved to a URL via `assets`). Null renders a
   *  procedural placeholder so the scene is never empty while authoring. */
  fileId: string | null;
  /** The line that wakes when this facet turns to face the viewer. */
  caption: string;
  /** A short date, shown under the caption. */
  date: string;
  /** Dominant colour sampled from the photo — lights the room when this facet is
   *  front. Optional; Phase 3 samples it, the builder can override it. */
  glowColor?: string;
};

export type LanternMaterial = {
  /** 0–1: how frosted the facets are when NOT facing the viewer. */
  frost: number;
  metalness: number;
  /** The inner core glow colour bleeding through the glass. */
  coreColor: string;
};

export type LanternMotion = {
  /** Idle rotation speed, radians/sec. 0 = still. */
  autoSpin: number;
  /** Allow the viewer to grab and spin it (Phase 5). */
  dragToSpin: boolean;
};

export type LanternAmbience = {
  /** Dim/warm by the viewer's local clock — "on" at dusk (Phase 5). */
  timeOfDayAware: boolean;
  /** ISO date; the lantern flares on its anniversary (Phase 5). */
  anniversary?: string;
};

export type LanternFinale = {
  heading: string;
  body: string;
};

export type LanternConfig = {
  /** Stable id — namespaces the first-view ceremony flag. */
  id: string;
  recipientName: string;
  title: string;
  subtitle: string;
  panes: Pane[];
  material?: LanternMaterial;
  motion?: LanternMotion;
  ambience?: LanternAmbience;
  finale?: LanternFinale;
};

export const DEFAULT_MATERIAL: LanternMaterial = {
  frost: 0.6,
  metalness: 0.08,
  coreColor: "#ffcf99",
};

export const DEFAULT_MOTION: LanternMotion = {
  autoSpin: 0.32,
  dragToSpin: true,
};

/**
 * The bundled sample. Panes carry no `fileId`, so they render as procedural
 * colour-plates — enough to see the lantern turn, wake, and light the room
 * before any photo is uploaded. Real photos replace these in the builder.
 */
export const SAMPLE_LANTERN: LanternConfig = {
  id: "the-two-of-us",
  recipientName: "you",
  title: "The two of us",
  subtitle: "watch it turn — each side wakes a memory",
  panes: [
    { id: "p1", fileId: null, caption: "The beach at dawn", date: "Aug 2025", glowColor: "#f4a261" },
    { id: "p2", fileId: null, caption: "First snow together", date: "Dec 2025", glowColor: "#8ecae6" },
    { id: "p3", fileId: null, caption: "That tiny kitchen", date: "Mar 2024", glowColor: "#e07a5f" },
    { id: "p4", fileId: null, caption: "The long drive north", date: "Jun 2024", glowColor: "#81b29a" },
    { id: "p5", fileId: null, caption: "Rooftop, city lights", date: "Oct 2025", glowColor: "#cdb4db" },
    { id: "p6", fileId: null, caption: "Us, just us", date: "Feb 2026", glowColor: "#ffb4a2" },
  ],
  material: DEFAULT_MATERIAL,
  motion: DEFAULT_MOTION,
  ambience: { timeOfDayAware: true },
  finale: { heading: "You saw every side", body: "of the two of us." },
};
