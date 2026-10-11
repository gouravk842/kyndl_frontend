import { apiRequest } from "@/services/api/client";
import { compressImage } from "@/services/files/compress";

/**
 * Direct-to-S3 upload, three hops:
 *   1. ask our BFF for a presigned POST (`/files/upload-url`),
 *   2. POST the bytes straight to the bucket (cross-origin, not via the BFF),
 *   3. confirm with the BFF (`/files/{id}/confirm`) so the file becomes
 *      referenceable.
 * Returns the `fileId` to drop into a creation document as `{ fileId }`.
 *
 * Confirmed uploads are staged server-side until a creation/memory/product save
 * attaches them. Clearing a photo before save should call :meth:`release` so
 * bytes don't wait for the staged TTL sweep.
 */

interface PresignedUpload {
  file_id: string;
  upload_url: string;
  fields: Record<string, string>;
  key: string;
  expires_in: number;
}

async function requestUpload(
  file: File,
  purpose: string,
): Promise<PresignedUpload> {
  return apiRequest<PresignedUpload>({
    method: "POST",
    url: "/files/upload-url",
    data: {
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      size: file.size,
      purpose,
    },
  });
}

async function postToStorage(
  presigned: PresignedUpload,
  file: File,
): Promise<void> {
  const form = new FormData();
  // S3 requires the policy fields *before* the file part.
  for (const [key, value] of Object.entries(presigned.fields)) {
    form.append(key, value);
  }
  form.append("file", file);

  // Goes directly to the bucket (MinIO/S3), so it must not carry our cookies or
  // JSON content-type — the browser sets the multipart boundary itself.
  const res = await fetch(presigned.upload_url, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Upload to storage failed (${res.status}).`);
  }
}

async function confirmUpload(fileId: string): Promise<void> {
  await apiRequest({ method: "POST", url: `/files/${fileId}/confirm` });
}

export const fileService = {
  /** Upload one file and return its `fileId`, ready to reference in a document.
   *
   * Images are downscaled/re-encoded in the browser first (see `compressImage`)
   * so the presigned request declares the *compressed* size and type — the two
   * must match the bytes we actually POST, since the S3 policy enforces both. */
  async upload(file: File, purpose = "our-places"): Promise<string> {
    const toUpload = await compressImage(file);
    const presigned = await requestUpload(toUpload, purpose);
    await postToStorage(presigned, toUpload);
    await confirmUpload(presigned.file_id);
    return presigned.file_id;
  },

  /** Soft-delete an owned file (S3 reaped asynchronously). */
  async delete(fileId: string): Promise<void> {
    await apiRequest({ method: "DELETE", url: `/files/${fileId}` });
  },

  /**
   * Best-effort delete when the user clears media before/without a save.
   * Swallows errors (404, network) — the staged TTL sweep is the backstop.
   */
  release(fileId: string | null | undefined): void {
    if (!fileId) return;
    void fileService.delete(fileId).catch(() => {
      /* staged sweep will reclaim */
    });
  },
};
