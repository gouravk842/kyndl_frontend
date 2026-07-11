/**
 * Sample a lively "glow" colour from a photo.
 *
 * Run in the builder the moment a photo is uploaded, so the facet's room-glow
 * (see `RoomLight`) is the colour of the actual image rather than a guess. Rather
 * than a flat average — which trends muddy grey — pixels are weighted toward the
 * vivid and bright, so the glow picks up the memory's real mood (a sunset stays
 * warm, snow stays cool).
 *
 * Resolves to a `#rrggbb` string; falls back to a warm ember if the image can't
 * be read (e.g. a decode error), so an upload never leaves a facet colourless.
 */

const FALLBACK = "#f0c48a";

export function sampleGlowColor(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const S = 40; // downsample — plenty for an average, cheap to scan
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(FALLBACK);
        ctx.drawImage(img, 0, 0, S, S);
        const { data } = ctx.getImageData(0, 0, S, S);

        let r = 0;
        let g = 0;
        let b = 0;
        let wsum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i] ?? 0;
          const pg = data[i + 1] ?? 0;
          const pb = data[i + 2] ?? 0;
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = max / 255;
          // Favour vivid, well-lit pixels; ignore near-black.
          const w = (sat * 0.7 + 0.3) * lum;
          r += pr * w;
          g += pg * w;
          b += pb * w;
          wsum += w;
        }
        if (wsum === 0) return resolve(FALLBACK);
        const hex = (v: number) =>
          Math.round(Math.min(255, v / wsum))
            .toString(16)
            .padStart(2, "0");
        resolve(`#${hex(r)}${hex(g)}${hex(b)}`);
      } catch {
        resolve(FALLBACK);
      }
    };
    img.onerror = () => resolve(FALLBACK);
    img.src = url;
  });
}
