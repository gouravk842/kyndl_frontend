const KEY = "kyndl-memory-bank-first-run";
const EVENT = "kyndl-memory-bank-first-run";

export function readFirstRunDone(): boolean {
  try {
    return localStorage.getItem(KEY) === "done";
  } catch {
    return false;
  }
}

export function markFirstRunDone() {
  try {
    localStorage.setItem(KEY, "done");
  } catch {
    // Storage is optional.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function subscribeFirstRun(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
