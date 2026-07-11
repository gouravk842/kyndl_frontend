import type { SeatColorKey } from "../types";

/**
 * Four seat palettes. Two are warm (rose, amber) to sit inside Kyndl's brand,
 * two are cooler accents (teal, plum) so all four tokens stay distinguishable
 * on the board. A 2-player game defaults to rose vs teal — facing corners.
 */
export interface SeatColor {
  key: SeatColorKey;
  label: string;
  /** Solid token fill. */
  base: string;
  /** Darker rim for the 3D pawn edge. */
  shade: string;
  /** Light highlight for the pawn top. */
  light: string;
  /** Soft tint for the corner base + home column. */
  soft: string;
  /** Readable text-on-light variant. */
  ink: string;
}

export const SEAT_COLORS: Record<SeatColorKey, SeatColor> = {
  rose: {
    key: "rose",
    label: "Rose",
    base: "#F2596F",
    shade: "#C13A53",
    light: "#FF9DAC",
    soft: "#FCDCE2",
    ink: "#B22746",
  },
  amber: {
    key: "amber",
    label: "Amber",
    base: "#F0A13D",
    shade: "#C77A1C",
    light: "#FFD08A",
    soft: "#FCEBCF",
    ink: "#B06A12",
  },
  teal: {
    key: "teal",
    label: "Teal",
    base: "#2BB6A3",
    shade: "#1B8576",
    light: "#7FE3D4",
    soft: "#D2F0EB",
    ink: "#16786A",
  },
  plum: {
    key: "plum",
    label: "Plum",
    base: "#8E6BC7",
    shade: "#6A48A3",
    light: "#C5AEE8",
    soft: "#E6DCF5",
    ink: "#5C3B96",
  },
};

export const SEAT_COLOR_ORDER: SeatColorKey[] = [
  "rose",
  "amber",
  "teal",
  "plum",
];
