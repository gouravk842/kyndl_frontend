const KEY = "kyndl-memory-bank-sky-hint";
const EVENT = "kyndl-memory-bank-sky-hint";

export function readSkyHintDone(): boolean {
  try {
    return localStorage.getItem(KEY) === "done";
  } catch {
    return false;
  }
}

export function markSkyHintDone() {
  try {
    localStorage.setItem(KEY, "done");
  } catch {
    // Storage is optional.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function subscribeSkyHint(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
