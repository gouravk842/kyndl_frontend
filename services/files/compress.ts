/**
 * Client-side image downscale/re-encode before upload.
 *
 * Cuts upload bandwidth and storage by shrinking oversized photos in the browser
 * (a 12 MP phone shot is ~4000px; we never need more than `MAX_EDGE`). The
 * backend still generates its own `thumb`/`medium` variants — this only trims the
 * *original* we send. Uses the Canvas API only (no dependency), and is
 * deliberately conservative: anything that wouldn't clearly benefit is returned
 * untouched, and any failure falls back to the original file.
 */

const MAX_EDGE = 2560; // px on the long side; plenty for full-screen viewing
const TARGET_TYPE = "image/webp";
const QUALITY = 0.82;
// Below this, re-encoding rarely pays for itself — skip the work.
const SKIP_BELOW_BYTES = 512 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image."));
    };
    img.src = url;
  });
}

function asciiSafeBase(name: string): string {
  // Defense in depth — backend sanitizes too. Strip non-ASCII (e.g. macOS
  // U+202F in screenshot names) so the declared upload filename stays clean.
  const base = name.replace(/\.[^.]+$/, "");
  const ascii = base
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/[^A-Za-z0-9._\- ]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  return ascii || "file";
}

function renamed(file: File, type: string): string {
  const ext = type === "image/webp" ? "webp" : "jpg";
  return `${asciiSafeBase(file.name)}.${ext}`;
}

/**
 * Return a smaller image File when downscaling/re-encoding helps, else the
 * original. Non-images, GIFs (animation), and small files are passed through.
 */
export async function compressImage(file: File): Promise<File> {
  if (typeof document === "undefined") return file; // SSR guard
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (file.size < SKIP_BELOW_BYTES) return file;

  try {
    const img = await loadImage(file);
    const longEdge = Math.max(img.width, img.height);
    const scale = Math.min(1, MAX_EDGE / longEdge);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, TARGET_TYPE, QUALITY),
    );
    // Keep the original unless the result is genuinely smaller.
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], renamed(file, TARGET_TYPE), {
      type: TARGET_TYPE,
      lastModified: file.lastModified,
    });
  } catch {
    return file; // never block an upload on a compression hiccup
  }
}
