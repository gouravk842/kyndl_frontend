"use client";

import { bankImageUrl } from "../previews";

/** Catalog diagram on a result card. Falls back to a URL remembered at pick time. */
export function CatalogImage({
  fileId,
  assets,
  className = "mx-auto mt-3 max-h-40 w-full rounded-xl object-contain",
}: {
  fileId?: string | null;
  assets?: Record<string, string>;
  className?: string;
}) {
  if (!fileId) return null;
  const url = assets?.[fileId] ?? bankImageUrl(fileId);
  if (!url) return null;
  return <img src={url} alt="" className={className} />;
}
