/**
 * Re-encode heavy catalog / hero stills in public/ to WebP.
 * Keeps originals alongside until paths are flipped in lib/experiences.ts.
 *
 * Usage: node scripts/compress-catalog-images.mjs
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "..", "public");

/** Catalog covers + hero stills that show up on marketing / cards. */
const TARGETS = [
  "constellations.jpg",
  "countdown.jpg",
  "relationship_calender.png",
  "timeless_treasure.png",
  "spotify.png",
  "memory_lantern.png",
  "our_places.jpg",
  "digital_scrapbook.png",
  "memory_jar.png",
  "memories.png",
  "scrapbook.png",
  "memory_city.png",
  "24_reason.png",
  "big_question.png",
  "ludo.png",
  "couple.png",
  "dark_zone/dice_desire.png",
  "dark_zone/desire_matcher.png",
  "dark_zone/desire_deck.png",
  "dark_zone/snake_lovers.png",
  "dark_zone/naughty_spins.png",
  "dark_zone/desire_coupon.png",
];

const MAX_EDGE = 1600;
const WEBP_QUALITY = 82;

async function compressOne(rel) {
  const input = path.join(publicDir, rel);
  const parsed = path.parse(rel);
  const outRel = path.join(parsed.dir, `${parsed.name}.webp`);
  const output = path.join(publicDir, outRel);

  await mkdir(path.dirname(output), { recursive: true });

  const before = (await stat(input)).size;
  await sharp(input)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(output);

  const after = (await stat(output)).size;
  const pct = ((1 - after / before) * 100).toFixed(0);
  console.log(
    `${rel} → ${outRel}  ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024).toFixed(0)}KB  (−${pct}%)`,
  );
  return outRel;
}

async function main() {
  // Ensure dark_zone exists if listed
  try {
    await readdir(path.join(publicDir, "dark_zone"));
  } catch {
    /* optional */
  }

  for (const rel of TARGETS) {
    try {
      await compressOne(rel);
    } catch (err) {
      console.warn(`skip ${rel}:`, err.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
