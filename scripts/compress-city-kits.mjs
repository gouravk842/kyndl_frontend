#!/usr/bin/env node
/**
 * Compress Memory City Kenney kits with Draco.
 *
 * Usage (from kyndl_frontend):
 *   npm run kits:compress
 *
 * Writes sibling `*.draco.glb` next to each source GLB under public/kits/city.
 * KitFabric loads uncompressed `.glb` by default (Draco CDN is unreliable);
 * keep the compressed siblings for optional local decoder wiring later.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "public/kits/city");
const DIRS = ["suburban", "roads"];

function listGlbs(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) continue;
    if (name.endsWith(".glb") && !name.endsWith(".draco.glb")) out.push(p);
  }
  return out;
}

function main() {
  const files = DIRS.flatMap((d) => listGlbs(join(ROOT, d))).filter((src) => {
    const dest = src.replace(/\.glb$/i, ".draco.glb");
    return !existsSync(dest);
  });
  if (!files.length) {
    console.log("All GLBs already have .draco.glb siblings.");
    return;
  }

  console.log(`Compressing ${files.length} GLBs with @gltf-transform/cli…`);
  for (const src of files) {
    const dest = src.replace(/\.glb$/i, ".draco.glb");
    const rel = relative(process.cwd(), src);
    const result = spawnSync(
      "npx",
      [
        "--yes",
        "@gltf-transform/cli",
        "optimize",
        src,
        dest,
        "--compress",
        "draco",
      ],
      { stdio: "inherit", shell: process.platform === "win32" },
    );
    if (result.status !== 0) {
      console.error("Failed:", rel);
      process.exit(result.status ?? 1);
    }
    console.log("ok", relative(process.cwd(), dest));
  }
}

main();
