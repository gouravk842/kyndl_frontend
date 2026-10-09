const KEY = "kyndl-memory-bank-last-circle";
const EVENT = "kyndl-memory-bank-last-circle";

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function rememberCircle(id: string) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Private mode can refuse storage. The shelf still works without it.
  }
  notify();
}

export function readLastCircle(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function forgetCircle(id: string) {
  try {
    if (localStorage.getItem(KEY) === id) localStorage.removeItem(KEY);
  } catch {
    // Same as rememberCircle: storage is optional.
  }
  notify();
}

export function subscribeLastCircle(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
