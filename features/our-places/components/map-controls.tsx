"use client";

import { Minus, Plus } from "lucide-react";
import { useMap } from "react-leaflet";

/**
 * Minimal custom zoom control — Leaflet's default is disabled (`zoomControl:
 * false`) because its boxy buttons look like a navigation app. Lives inside the
 * MapContainer so `useMap()` resolves the live map instance.
 */
export function MapControls() {
  const map = useMap();
  return (
    <div className="absolute right-4 bottom-6 z-[600] flex flex-col gap-1.5 sm:right-6">
      <ControlButton label="Zoom in" onClick={() => map.zoomIn()}>
        <Plus className="h-4 w-4" />
      </ControlButton>
      <ControlButton label="Zoom out" onClick={() => map.zoomOut()}>
        <Minus className="h-4 w-4" />
      </ControlButton>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full border border-[#f2dace]/70 bg-[#fff7f1]/85 text-[#3a2a25] shadow-[0_6px_18px_-10px_rgba(58,42,37,0.5)] backdrop-blur-md outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#ff7a59]"
    >
      {children}
    </button>
  );
}
