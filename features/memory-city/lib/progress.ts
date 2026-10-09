/** Recipient progress — session Sets hydrated from / persisted to localStorage. */

export interface CityProgress {
  solved: string[];
  recalled: string[];
}

const PREFIX = "kyndl:memory-city:progress:";

export function progressStorageKey(id: string): string {
  return `${PREFIX}${id}`;
}

export function loadProgress(
  id: string | undefined | null,
): CityProgress | null {
  if (!id || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(progressStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CityProgress;
    if (!Array.isArray(parsed.solved) || !Array.isArray(parsed.recalled))
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveProgress(
  id: string | undefined | null,
  progress: CityProgress,
): void {
  if (!id || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      progressStorageKey(id),
      JSON.stringify(progress),
    );
  } catch {
    // Quota / private mode — progress stays session-only.
  }
}
