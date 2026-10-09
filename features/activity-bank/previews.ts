const previews = new Map<string, string>();

/** Remember a catalog image URL so the builder preview can show it before save. */
export function rememberBankImage(fileId: string, url: string) {
  previews.set(fileId, url);
}

export function bankImageUrl(fileId: string): string | undefined {
  return previews.get(fileId);
}

export function fileRef(item: {
  imageFileId: string | null;
  imageUrl: string | null;
}): { fileId: string } | undefined {
  if (!item.imageFileId) return undefined;
  if (item.imageUrl) rememberBankImage(item.imageFileId, item.imageUrl);
  return { fileId: item.imageFileId };
}
