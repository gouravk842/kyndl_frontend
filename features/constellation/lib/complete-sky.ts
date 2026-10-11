import {
  SKY_CONFIG,
  type SkyConfig,
  type Star,
} from "@/features/constellation/config";

/** Art a hand-made sky always has. Converted skies store the memories and
 * may omit these; the builder and the viewer read them on the first paint. */
function skyArt(): Omit<SkyConfig, "stars" | "wish" | "customEdges"> {
  const {
    stars: _stars,
    wish: _wish,
    customEdges: _edges,
    ...art
  } = SKY_CONFIG;
  return art;
}

function clampCoord(v: number, min: number, max: number) {
  if (typeof v !== "number" || Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/** Keep star positions inside the backend's 0–100 box so a reload never
 * leaves the document unsavable after a drag or rearrange. */
function clampStars(stars: Star[] | undefined): Star[] {
  if (!Array.isArray(stars)) return [];
  return stars.map((star) => ({
    ...star,
    x: clampCoord(star.x, 0, 100),
    y: clampCoord(star.y, 0, 100),
  }));
}

/** Fill finale, sound, tour, and scene when a saved sky left them out.
 * A complete sky is returned unchanged, so a hand-made one stays as saved. */
export function completeSky(doc: SkyConfig): SkyConfig {
  const art = skyArt();
  const stars = clampStars(doc.stars);
  if (doc.finale && doc.tour && doc.sound && doc.scene && doc.skyColors) {
    return { ...doc, stars };
  }
  return {
    ...art,
    ...doc,
    stars,
    finale: doc.finale ?? art.finale,
    tour: doc.tour ?? art.tour,
    sound: doc.sound ?? art.sound,
    scene: doc.scene ?? art.scene,
    skyColors: doc.skyColors ?? art.skyColors,
  };
}
