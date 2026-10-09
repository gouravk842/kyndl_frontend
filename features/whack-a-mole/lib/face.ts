/** Stand-in portrait used until a selfie is uploaded. */
export const DEFAULT_FACE_SRC = "/whack-a-mole/default-face.jpg";

export function resolveFaceSrc(faceUrl: string | null | undefined): string {
  return faceUrl || DEFAULT_FACE_SRC;
}
