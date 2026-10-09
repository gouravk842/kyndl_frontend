"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { useMemoryCitySync } from "@/hooks/use-memory-city-sync";

import { buildCityConfig } from "../../lib/city-from-memories";
import { useBuilderStore } from "../../store/builder.store";
import { type CityConfig, MOOD_COLORS } from "../../types";
import { MemoryCityExperience } from "../memory-city-experience";
import { BuilderPanel } from "./builder-panel";

/**
 * The Memory City customization surface: the meaning-first editor rail beside a
 * **live top-down map** of the city the layout engine derives from the current
 * draft. Editing a memory or its date visibly re-arranges the map — proving the
 * "add a memory, the city grows" promise in 2D before the heavier 3D. "Walk the
 * city" mounts the real experience full-screen, fed the live draft. Both halves
 * drive the same builder store; the sync hook persists.
 */
export function MemoryCityBuilder() {
  const sync = useMemoryCitySync();
  const doc = useBuilderStore((s) => s.doc);
  const assets = useBuilderStore((s) => s.assets);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const [previewing, setPreviewing] = useState(false);

  const assetMap = useMemo(
    () => ({ ...assets, ...localPreviews }),
    [assets, localPreviews],
  );

  // Derive the placed city from the meaning-only draft. Guarded: a half-typed
  // memory shouldn't blank the map.
  const city = useMemo<CityConfig | null>(() => {
    try {
      return buildCityConfig(doc, {}, assetMap);
    } catch {
      return null;
    }
  }, [doc, assetMap]);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col-reverse sm:flex-row">
      <BuilderPanel
        sync={sync}
        onPreview={() => setPreviewing(true)}
        className="h-1/2 w-full shrink-0 border-t sm:h-full sm:w-[380px] sm:border-t-0 sm:border-r"
      />

      {/* Live top-down map of the derived city. */}
      <div
        className="relative h-1/2 flex-1 overflow-hidden sm:h-full"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 45%, #16143a 0%, #0d0b22 70%, #080716 100%)",
        }}
      >
        {city ? <CityMap city={city} /> : null}
        {(!city || city.nodes.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-lg text-[#b9b2d0]">
              Add a memory to grow your city.
            </p>
          </div>
        )}
      </div>

      {/* Full-screen live 3D preview of the real experience. */}
      {previewing && (
        <div className="fixed inset-0 z-[80] bg-black">
          {/* key remounts the scene fresh from the current draft each open */}
          <MemoryCityExperience
            key={previewing ? "on" : "off"}
            doc={doc}
            assets={assetMap}
            preview
          />
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            aria-label="Close preview"
            className="absolute right-4 top-4 z-[81] inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <X className="size-4" /> Close preview
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * A top-down schematic of the derived city: the spiral avenue + spokes as faint
 * lines, each memory a dot glowing in its mood colour, oldest at the centre and
 * newest on the frontier. Click a dot to select that memory in the rail.
 */
function CityMap({ city }: { city: CityConfig }) {
  const selectMemory = useBuilderStore((s) => s.selectMemory);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const doc = useBuilderStore((s) => s.doc);

  const moodOf = useMemo(
    () => new Map(doc.memories.map((m) => [m.id, m.mood])),
    [doc.memories],
  );

  const r = (city.fabric?.radius ?? 40) + 4;
  const view = `${-r} ${-r} ${2 * r} ${2 * r}`;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={view}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* roads (avenue + spokes) */}
      {city.fabric?.roads.map((road, i) => (
        <polyline
          key={i}
          points={road.map(([x, , z]) => `${x},${z}`).join(" ")}
          fill="none"
          stroke={city.theme.accent}
          strokeOpacity={i === 0 ? 0.35 : 0.16}
          strokeWidth={i === 0 ? 0.5 : 0.35}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* central plaza */}
      <circle
        cx={0}
        cy={0}
        r={1.1}
        fill={city.theme.accent}
        fillOpacity={0.5}
      />

      {/* memory buildings */}
      {city.nodes.map((node) => {
        const [x, , z] = node.transform.position;
        const mood = moodOf.get(node.id);
        const color = (mood && MOOD_COLORS[mood]) || city.theme.accent;
        const active = node.id === selectedId;
        return (
          <g key={node.id} className="cursor-pointer">
            {active && (
              <circle cx={x} cy={z} r={3.2} fill={color} fillOpacity={0.18} />
            )}
            <circle
              cx={x}
              cy={z}
              r={active ? 1.9 : 1.4}
              fill={color}
              stroke="#0b0a1a"
              strokeWidth={0.3}
              vectorEffect="non-scaling-stroke"
              onClick={() => selectMemory(node.id)}
            >
              <title>{moodOf.has(node.id) ? node.id : ""}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
