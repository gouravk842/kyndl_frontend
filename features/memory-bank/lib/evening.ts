"use client";

import { useSyncExternalStore } from "react";

function hour(): number {
  return new Date().getHours();
}

function isEvening() {
  const h = hour();
  return h >= 18 || h < 6;
}

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

export function useEveningSky() {
  return useSyncExternalStore(subscribe, isEvening, () => false);
}
