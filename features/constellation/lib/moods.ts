import type { SceneConfig, SkyConfig } from "@/features/constellation/config";

export type SkyMoodId = "moonlit" | "amber" | "monsoon";

export type SkyMood = Pick<
  SkyConfig,
  "skyColors" | "nebulaColor" | "lineColor" | "finale"
> & {
  id: SkyMoodId;
  label: string;
  scene: Pick<SceneConfig, "horizonGlow" | "horizonHaze" | "cloudTint">;
};

export const MOONLIT: SkyMood = {
  id: "moonlit",
  label: "Moonlit",
  skyColors: { top: "#020308", middle: "#05070e", bottom: "#0a0c14" },
  nebulaColor: "#12151f",
  lineColor: "rgba(235, 240, 255, 0.28)",
  finale: { glyph: "heart", color: "rgba(255, 220, 230, 0.88)" },
  scene: {
    horizonGlow: "#8a92a8",
    horizonHaze: "#3a4050",
    cloudTint: "#6a7288",
  },
};

export const SKY_MOODS: SkyMood[] = [
  MOONLIT,
  {
    id: "amber",
    label: "Amber dusk",
    skyColors: { top: "#140c08", middle: "#1c120c", bottom: "#2a160e" },
    nebulaColor: "#3a2214",
    lineColor: "rgba(255, 214, 160, 0.38)",
    finale: { glyph: "heart", color: "rgba(255, 196, 140, 0.92)" },
    scene: {
      horizonGlow: "#c4844a",
      horizonHaze: "#6a3a22",
      cloudTint: "#a06a48",
    },
  },
  {
    id: "monsoon",
    label: "Monsoon",
    skyColors: { top: "#070814", middle: "#101428", bottom: "#0c1830" },
    nebulaColor: "#1a2450",
    lineColor: "rgba(186, 210, 255, 0.34)",
    finale: { glyph: "heart", color: "rgba(210, 225, 255, 0.9)" },
    scene: {
      horizonGlow: "#6a78a8",
      horizonHaze: "#243048",
      cloudTint: "#4a5878",
    },
  },
];

export function applyMood(doc: SkyConfig, mood: SkyMood): SkyConfig {
  return {
    ...doc,
    skyColors: mood.skyColors,
    nebulaColor: mood.nebulaColor,
    lineColor: mood.lineColor,
    finale: {
      ...doc.finale,
      color: mood.finale.color,
      glyph: doc.finale.glyph,
    },
    scene: { ...doc.scene, ...mood.scene },
  };
}
