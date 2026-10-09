const KEY = "kyndl-memory-bank-last-opened";
const EVENT = "kyndl-memory-bank-last-opened";

let cachedRaw = "__unset__";
let cachedMap: Record<string, string> = {};

export function readLastOpenedMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(KEY) ?? "";
    if (raw === cachedRaw) return cachedMap;
    cachedRaw = raw;
    if (!raw) {
      cachedMap = {};
      return cachedMap;
    }
    const parsed = JSON.parse(raw) as unknown;
    cachedMap =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, string>)
        : {};
    return cachedMap;
  } catch {
    return cachedMap;
  }
}

export function readLastOpened(memoryId: string): string | null {
  return readLastOpenedMap()[memoryId] ?? null;
}

export function rememberOpened(memoryId: string) {
  try {
    const next = {
      ...readLastOpenedMap(),
      [memoryId]: new Date().toISOString(),
    };
    const raw = JSON.stringify(next);
    localStorage.setItem(KEY, raw);
    cachedRaw = raw;
    cachedMap = next;
  } catch {
    // Storage is optional.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function subscribeLastOpened(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
