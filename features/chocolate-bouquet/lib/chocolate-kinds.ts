/**
 * The visual + reveal identity of each chocolate type — the single source of
 * truth shared by the 3D meshes, the drag-to-tear wrapper, the reveal card, and
 * the builder. Keeping it here means a new type is one entry, not a scatter of
 * switch statements.
 */
import type { ChocolateType } from "../config";

/** The 3D silhouette a chocolate takes. */
export type MeshKind = "bar" | "truffle" | "square";

export type ChocolateKind = {
  type: ChocolateType;
  /** Short label for the builder's type picker. */
  label: string;
  /** One-line hint for the builder. */
  hint: string;
  /** The 3D shape. */
  mesh: MeshKind;
  /** Foil/wrapper base colour (the sweet in the bouquet + the tear overlay). */
  wrapper: string;
  /** A lighter highlight tone for the foil sheen. */
  wrapperHi: string;
  /** Whether the wrapper reads as metallic foil (vs matte paper). */
  foil: boolean;
  /** Accent colour used on the revealed memory card. */
  accent: string;
  /** lucide-react icon name used in the builder + card header. */
  icon: string;
  /** When true, the photo starts blurred and clears as it opens (secret). */
  blurUntilOpen: boolean;
  /** When true, the reveal celebrates (confetti/sparkle) — milestones. */
  celebrate: boolean;
};

export const CHOCOLATE_KINDS: Record<ChocolateType, ChocolateKind> = {
  moment: {
    type: "moment",
    label: "Moment",
    hint: "A photo moment",
    mesh: "bar",
    wrapper: "#c9203a",
    wrapperHi: "#f26d7d",
    foil: true,
    accent: "#e2483f",
    icon: "Image",
    blurUntilOpen: false,
    celebrate: false,
  },
  note: {
    type: "note",
    label: "Note",
    hint: "A written note",
    mesh: "bar",
    wrapper: "#4b2e83",
    wrapperHi: "#8b6fce",
    foil: false,
    accent: "#6d4fb0",
    icon: "PenLine",
    blurUntilOpen: false,
    celebrate: false,
  },
  secret: {
    type: "secret",
    label: "Secret",
    hint: "Blurred until torn open",
    mesh: "truffle",
    wrapper: "#7a5a2e",
    wrapperHi: "#c79a5b",
    foil: true,
    accent: "#a9793c",
    icon: "EyeOff",
    blurUntilOpen: true,
    celebrate: false,
  },
  milestone: {
    type: "milestone",
    label: "Milestone",
    hint: "A favourite / a big day",
    mesh: "square",
    wrapper: "#c99a2e",
    wrapperHi: "#f6d879",
    foil: true,
    accent: "#d0a63a",
    icon: "Star",
    blurUntilOpen: false,
    celebrate: true,
  },
  voice: {
    type: "voice",
    label: "Voice",
    hint: "A voice note",
    mesh: "square",
    wrapper: "#1f8a86",
    wrapperHi: "#6fd8d0",
    foil: false,
    accent: "#2aa6a0",
    icon: "Mic",
    blurUntilOpen: false,
    celebrate: false,
  },
};

export const CHOCOLATE_TYPE_LIST: ChocolateKind[] = Object.values(CHOCOLATE_KINDS);

export function kindOf(type: ChocolateType): ChocolateKind {
  return CHOCOLATE_KINDS[type] ?? CHOCOLATE_KINDS.moment;
}
