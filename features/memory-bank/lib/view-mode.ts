const KEY = "kyndl-memory-bank-view";
const EVENT = "kyndl-memory-bank-view";

export const MEMORY_BANK_VIEWS = ["solar", "molecule", "list"] as const;

export type MemoryBankViewMode = (typeof MEMORY_BANK_VIEWS)[number];

function isMemoryBankView(value: string | null): value is MemoryBankViewMode {
  return value === "solar" || value === "molecule" || value === "list";
}

export function nextMemoryBankView(
  view: MemoryBankViewMode,
): MemoryBankViewMode {
  const index = MEMORY_BANK_VIEWS.indexOf(view);
  return MEMORY_BANK_VIEWS[(index + 1) % MEMORY_BANK_VIEWS.length] ?? "solar";
}

export function readMemoryBankView(): MemoryBankViewMode {
  try {
    if (typeof window !== "undefined") {
      const fromUrl = new URLSearchParams(window.location.search).get("view");
      if (isMemoryBankView(fromUrl)) return fromUrl;
    }
    const value = localStorage.getItem(KEY);
    if (isMemoryBankView(value)) return value;
  } catch {
    // Private mode can refuse storage and search.
  }
  return "solar";
}

export function writeMemoryBankView(view: MemoryBankViewMode) {
  try {
    localStorage.setItem(KEY, view);
  } catch {
    // Storage is optional.
  }
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    window.dispatchEvent(new Event(EVENT));
  }
}

export function subscribeMemoryBankView(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
}
