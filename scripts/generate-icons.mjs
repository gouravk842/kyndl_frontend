import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "assets/icon.svg"));

function packIco(images) {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const entries = images.map(({ size, png }) => {
    const entry = { size, png, offset };
    offset += png.length;
    return entry;
  });

  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);

  let cursor = 6;
  for (const entry of entries) {
    out.writeUInt8(entry.size >= 256 ? 0 : entry.size, cursor);
    out.writeUInt8(entry.size >= 256 ? 0 : entry.size, cursor + 1);
    out.writeUInt8(0, cursor + 2);
    out.writeUInt8(0, cursor + 3);
    out.writeUInt16LE(1, cursor + 4);
    out.writeUInt16LE(32, cursor + 6);
    out.writeUInt32LE(entry.png.length, cursor + 8);
    out.writeUInt32LE(entry.offset, cursor + 12);
    cursor += 16;
  }

  for (const entry of entries) {
    entry.png.copy(out, entry.offset);
  }
  return out;
}

async function pngAt(size) {
  return sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
}

const publicDir = join(root, "public");
const appDir = join(root, "app");
mkdirSync(publicDir, { recursive: true });
mkdirSync(appDir, { recursive: true });

const png512 = await pngAt(512);
const png192 = await pngAt(192);
const png180 = await pngAt(180);
const png48 = await pngAt(48);
const png32 = await pngAt(32);
const png16 = await pngAt(16);

writeFileSync(join(appDir, "icon.png"), png192);
writeFileSync(join(appDir, "apple-icon.png"), png180);
writeFileSync(join(publicDir, "icon-192.png"), png192);
writeFileSync(join(publicDir, "icon-512.png"), png512);
writeFileSync(
  join(appDir, "favicon.ico"),
  packIco([
    { size: 16, png: png16 },
    { size: 32, png: png32 },
    { size: 48, png: png48 },
  ]),
);
copyFileSync(join(root, "assets/icon.svg"), join(publicDir, "icon.svg"));

console.log("Generated app/favicon.ico, app/icon.png, app/apple-icon.png");
console.log(
  "Generated public/icon-192.png, public/icon-512.png, public/icon.svg",
);
