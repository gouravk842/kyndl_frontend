/**
 * Procedural PBR maps for the wrappers — the single biggest realism lever.
 *
 * Real chocolate foil reads as "foil" because of thousands of tiny crinkles that
 * each catch the light differently. We fake that with a fractal-noise height
 * field baked once into a **normal map** (micro-facets) + a **roughness map**
 * (dull/shiny speckle), applied to a metallic material sitting in a studio
 * environment. Matte paper (Dairy-Milk purple) uses a softer, lower-frequency
 * crinkle. Everything is generated on a `<canvas>` at runtime — no asset files,
 * no network (same self-contained constraint as the rest of the 3D here).
 */
import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  type Texture,
} from "three";

export type CrinkleMaps = { normal: Texture; roughness: Texture };

/** Deterministic hash → [0,1). No Math.random so builds stay reproducible. */
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth value-noise sample at (x,y). */
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/** Fractal (multi-octave) noise → a crinkle height field. */
function fbm(x: number, y: number, octaves: number, freq: number): number {
  let sum = 0;
  let amp = 0.5;
  let f = freq;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * f, y * f);
    f *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

type CrinkleOpts = {
  size?: number;
  /** Base noise frequency — higher = finer, tighter crinkles (foil). */
  freq?: number;
  octaves?: number;
  /** Normal-map bump strength. */
  strength?: number;
  /** Roughness floor + speckle range. */
  roughBase?: number;
  roughVar?: number;
  /** How many times the crinkle tiles across a wrapper. */
  repeat?: [number, number];
};

function buildCrinkle(opts: CrinkleOpts): CrinkleMaps {
  const size = opts.size ?? 256;
  const freq = opts.freq ?? 14;
  const octaves = opts.octaves ?? 5;
  const strength = opts.strength ?? 2.2;
  const roughBase = opts.roughBase ?? 0.22;
  const roughVar = opts.roughVar ?? 0.5;

  // Height field (tileable via wrap-around sampling on the noise coords).
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      h[y * size + x] = fbm(x / size, y / size, octaves, freq);
    }
  }

  const at = (x: number, y: number) =>
    h[((y + size) % size) * size + ((x + size) % size)] ?? 0;

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = normalCanvas.height = size;
  const nctx = normalCanvas.getContext("2d")!;
  const nimg = nctx.createImageData(size, size);

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = roughCanvas.height = size;
  const rctx = roughCanvas.getContext("2d")!;
  const rimg = rctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Sobel-ish gradient → tangent-space normal.
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const nx = -dx / len;
      const ny = -dy / len;
      const nz = 1 / len;
      const i = (y * size + x) * 4;
      nimg.data[i] = (nx * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      nimg.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      nimg.data[i + 3] = 255;

      // Crinkle valleys read duller than peaks → roughness speckle.
      const r = Math.min(1, roughBase + at(x, y) * roughVar) * 255;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = r;
      rimg.data[i + 3] = 255;
    }
  }

  nctx.putImageData(nimg, 0, 0);
  rctx.putImageData(rimg, 0, 0);

  const [rx, ry] = opts.repeat ?? [2, 3];
  const finish = (c: HTMLCanvasElement) => {
    const t = new CanvasTexture(c);
    t.wrapS = t.wrapT = RepeatWrapping;
    t.minFilter = LinearMipmapLinearFilter;
    t.anisotropy = 4;
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return t;
  };

  return { normal: finish(normalCanvas), roughness: finish(roughCanvas) };
}

// Cache the two flavours — generated lazily on the client, reused everywhere.
let _foil: CrinkleMaps | null = null;
let _paper: CrinkleMaps | null = null;

/** Tight, high-frequency crinkles for metallic foil wrappers. */
export function foilCrinkle(): CrinkleMaps {
  if (!_foil)
    _foil = buildCrinkle({
      freq: 18,
      octaves: 6,
      strength: 3.2,
      roughBase: 0.14,
      roughVar: 0.42,
      repeat: [3, 4],
    });
  return _foil;
}

/** Softer, broader crinkles for matte paper wrappers. */
export function paperCrinkle(): CrinkleMaps {
  if (!_paper)
    _paper = buildCrinkle({
      freq: 9,
      octaves: 4,
      strength: 1.5,
      roughBase: 0.55,
      roughVar: 0.35,
      repeat: [2, 3],
    });
  return _paper;
}
