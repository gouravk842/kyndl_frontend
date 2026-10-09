/** localStorage helpers for “newly opened” sparkle / catch-up dismiss. */

export function seenKey(scope: string): string {
  return `kyndl:24reasons:seen:${scope}`;
}

export function loadSeen(scope: string): Set<string> {
  if (typeof window === "undefined" || !scope) return new Set();
  try {
    const raw = window.localStorage.getItem(seenKey(scope));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markSeen(scope: string, ids: string[]): void {
  if (!scope || ids.length === 0) return;
  try {
    const next = loadSeen(scope);
    for (const id of ids) next.add(id);
    window.localStorage.setItem(seenKey(scope), JSON.stringify([...next]));
  } catch {
    // storage disabled — sparkle just won't persist
  }
}

export function clearSeen(scope: string): void {
  if (!scope) return;
  try {
    window.localStorage.removeItem(seenKey(scope));
  } catch {
    // ignore
  }
}
