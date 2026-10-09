/**
 * Memory Lantern — content and art-direction config.
 *
 * Everything personal lives here: the recipient, the title, and the ordered
 * `panes`. Pane order is the order they take the stage, one at a time.
 *
 * Mirrors the backend `MemoryLanternContentSerializer`. The art-direction blocks
 * (`material` / `motion` / `ambience` / `finale`) are optional and defaulted on
 * the client, so the renderer never has to guard a missing block.
 */

export type Pane = {
  /** Stable key. Order in `panes` is show order. */
  id: string;
  /** Media handle for the photo (resolved to a URL via `assets`). Null renders a
   *  colour plate so the stage is never empty while authoring. */
  fileId: string | null;
  /** The line above the photo while this memory holds the stage. */
  caption: string;
  /** Optional note shown to the right of the photo. */
  description?: string;
  /** A short date, shown under the title. */
  date: string;
  /** Dominant colour sampled from the photo — washes the room while this memory
   *  is on stage. Optional; the builder samples it and can override it. */
  glowColor?: string;
};

export type LanternMaterial = {
  /** Retired with the prism. Ignored by the stage; kept so older documents parse. */
  frost: number;
  /** Retired with the prism. Ignored by the stage. */
  metalness: number;
  /** Podium rim and spotlight base colour. */
  coreColor: string;
};

export type LanternMotion = {
  /**
   * How long each memory holds the stage before the next, in seconds.
   * `0` waits for the viewer. Values below 2 are the retired spin speed
   * (radians/sec) and are treated as manual — see {@link dwellSeconds}.
   */
  autoSpin: number;
  /** Retired with the prism. Ignored by the stage. */
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
  autoSpin: 0,
  dragToSpin: false,
};

/**
 * Seconds to hold each memory. Values under 2 are the old radians/sec spin
 * and mean the viewer steps forward themselves.
 */
export function dwellSeconds(autoSpin: number | undefined): number {
  const n = autoSpin ?? 0;
  if (!Number.isFinite(n) || n < 2) return 0;
  return n;
}

/**
 * The bundled sample. Panes carry no `fileId`, so they render as colour plates —
 * enough to see the curtains, the podium, and the room take each memory's colour
 * before any photo is uploaded. Real photos replace these in the builder.
 */
export const SAMPLE_LANTERN: LanternConfig = {
  id: "in-this-light",
  recipientName: "you",
  title: "In this light",
  subtitle: "one memory takes the stage",
  panes: [
    {
      id: "p1",
      fileId: null,
      caption: "The beach at dawn",
      date: "Aug 2025",
      glowColor: "#f4a261",
    },
    {
      id: "p2",
      fileId: null,
      caption: "First snow together",
      date: "Dec 2025",
      glowColor: "#8ecae6",
    },
    {
      id: "p3",
      fileId: null,
      caption: "That tiny kitchen",
      date: "Mar 2024",
      glowColor: "#e07a5f",
    },
    {
      id: "p4",
      fileId: null,
      caption: "The long drive north",
      date: "Jun 2024",
      glowColor: "#81b29a",
    },
    {
      id: "p5",
      fileId: null,
      caption: "Rooftop, city lights",
      description:
        "We stayed until the city turned the colour of the sky. Neither of us wanted the evening to end.",
      date: "Oct 2025",
      glowColor: "#cdb4db",
    },
    {
      id: "p6",
      fileId: null,
      caption: "Home, at last",
      date: "Feb 2026",
      glowColor: "#ffb4a2",
    },
  ],
  material: DEFAULT_MATERIAL,
  motion: DEFAULT_MOTION,
  ambience: { timeOfDayAware: true },
  finale: {
    heading: "The lights stay with you",
    body: "Every one of them.",
  },
};
