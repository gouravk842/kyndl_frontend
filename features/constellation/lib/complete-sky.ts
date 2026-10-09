import { SKY_CONFIG, type SkyConfig } from "@/features/constellation/config";

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

/** Fill finale, sound, tour, and scene when a saved sky left them out.
 * A complete sky is returned unchanged, so a hand-made one stays as saved. */
export function completeSky(doc: SkyConfig): SkyConfig {
  const art = skyArt();
  if (doc.finale && doc.tour && doc.sound && doc.scene && doc.skyColors) {
    return doc;
  }
  return {
    ...art,
    ...doc,
    finale: doc.finale ?? art.finale,
    tour: doc.tour ?? art.tour,
    sound: doc.sound ?? art.sound,
    scene: doc.scene ?? art.scene,
    skyColors: doc.skyColors ?? art.skyColors,
  };
}
