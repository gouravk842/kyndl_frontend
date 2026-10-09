import type { CityMemory } from "../types";

/**
 * Display URL for a memory photo: uploaded `image.fileId` via assets map wins,
 * then legacy `imageUrl`.
 */
export function resolveMemoryImageUrl(
  memory: Pick<CityMemory, "imageUrl" | "image">,
  assets: Record<string, string> = {},
): string | undefined {
  const fromRef = memory.image?.fileId
    ? assets[memory.image.fileId]
    : undefined;
  if (fromRef) return fromRef;
  return memory.imageUrl || undefined;
}
