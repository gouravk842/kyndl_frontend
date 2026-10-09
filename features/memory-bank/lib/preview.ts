import type { MemoryPhoto } from "@/types/memory-bank";

export function formatMemoryDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatMemoryMonth(iso: string | null) {
  if (!iso) return "Undated";
  const [year, month] = iso.split("-").map(Number);
  if (!year || !month) return "Undated";
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function previewLine(preview: {
  title: string;
  excerpt?: string;
  note?: string;
  photo_count?: number;
  photos?: { length: number };
}) {
  if (preview.title) return preview.title;
  const excerpt = preview.excerpt || preview.note || "";
  if (excerpt) return excerpt;
  const photos = preview.photo_count ?? preview.photos?.length ?? 0;
  if (photos === 1) return "A photo";
  if (photos > 1) return `${photos} photos`;
  return "A memory";
}

export function photoSrc(photo: MemoryPhoto): string | null {
  return photo.variants?.thumb?.url || photo.variants?.medium?.url || photo.url;
}
