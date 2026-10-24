"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type NavSnapshot = { id: number; active: boolean };

const SERVER_SNAPSHOT: NavSnapshot = { id: 0, active: false };
let snapshot: NavSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(next: NavSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/** Call before `router.push` so programmatic nav gets the same top bar as Links. */
export function startNavigation() {
  emit({ id: snapshot.id + 1, active: true });
}

function completeNavigation() {
  if (!snapshot.active) return;
  emit({ ...snapshot, active: false });
}

function isInternalNavClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const target = event.target;
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a");
  if (!anchor) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  if (anchor.hasAttribute("download")) return false;
  const dest = anchor.getAttribute("target");
  if (dest && dest !== "_self") return false;
  if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return false;
  }
  return true;
}

function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nav = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [phase, setPhase] = useState<"idle" | "running" | "finishing">("idle");
  const [navSnapshot, setNavSnapshot] = useState(nav);
  const showTimer = useRef(0);
  const finishTimer = useRef(0);

  if (nav.id !== navSnapshot.id || nav.active !== navSnapshot.active) {
    setNavSnapshot(nav);
    if (!nav.active) {
      setPhase((current) => (current === "running" ? "finishing" : "idle"));
    }
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isInternalNavClick(event)) startNavigation();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    completeNavigation();
  }, [pathname, searchParams]);

  useEffect(() => {
    window.clearTimeout(showTimer.current);
    window.clearTimeout(finishTimer.current);
    if (!nav.active) return;
    showTimer.current = window.setTimeout(() => setPhase("running"), 100);
    return () => window.clearTimeout(showTimer.current);
  }, [nav.id, nav.active]);

  useEffect(() => {
    if (!nav.active) return;
    const safety = window.setTimeout(() => completeNavigation(), 12_000);
    return () => window.clearTimeout(safety);
  }, [nav.id, nav.active]);

  useEffect(() => {
    if (phase !== "finishing") return;
    finishTimer.current = window.setTimeout(() => setPhase("idle"), 280);
    return () => window.clearTimeout(finishTimer.current);
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        className={
          phase === "finishing"
            ? "kyndl-nav-bar is-finishing h-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] shadow-[0_0_8px_rgba(242,89,111,0.55)]"
            : "kyndl-nav-bar is-running h-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] shadow-[0_0_8px_rgba(242,89,111,0.55)]"
        }
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
}
