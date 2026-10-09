"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { bankColor } from "@/features/memory-bank/lib/bank-color";
import {
  bankWarmthShadow,
  type Warmth,
  youAria,
} from "@/features/memory-bank/lib/hearth";
import { KeepsakeFace } from "@/features/memory-bank/lib/keepsake-face";
import { cn } from "@/lib/utils";
import type { MemoryCircle } from "@/types/memory-bank";

import { hashUnit, layoutSolarSky } from "./layout";
import { SolarAtmosphere, YouGlyph } from "./solar-atmosphere";
import { SolarCaption } from "./solar-caption";
import { useHostSize } from "./use-host-size";
import { useOrbitLoop } from "./use-orbit-loop";
import { ZoomControls } from "./zoom-controls";

const ease = [0.22, 1, 0.36, 1] as const;

function bankMatches(circle: MemoryCircle, needle: string) {
  if (!needle) return true;
  return circle.name.toLowerCase().includes(needle);
}

export function SolarSky({
  banks,
  lastId,
  searching,
  needle,
  reduceMotion,
  zoom,
  onZoom,
  onOpenBank,
  onNameBank,
  flame,
  onOpenHearth,
}: {
  banks: MemoryCircle[];
  lastId: string | null;
  searching: boolean;
  needle: string;
  reduceMotion: boolean;
  zoom: number;
  onZoom: (zoom: number) => void;
  onOpenBank: (id: string) => void;
  onNameBank?: () => void;
  flame?: { state: Warmth; streak: number };
  onOpenHearth?: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const { ref, size } = useHostSize();
  const layout = useMemo(
    () => layoutSolarSky(banks, size, zoom),
    [banks, size, zoom],
  );
  const orbit = useOrbitLoop(paused, reduceMotion, layout.cx, layout.cy);
  const named = banks.filter((bank) => !bank.is_loose);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "absolute inset-0 transition-opacity duration-300",
        size.ready ? "opacity-100" : "opacity-0",
        reduceMotion && "duration-0",
      )}
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
    >
      <p className="sr-only">
        {banks.length
          ? `${banks.length} memory banks orbit You. ${banks
              .map(
                (bank) =>
                  `${bank.name}, ${bank.memory_count} ${bank.memory_count === 1 ? "memory" : "memories"}`,
              )
              .join(". ")}`
          : "No memory banks yet."}
      </p>
      {size.ready ? <SolarAtmosphere cx={layout.cx} cy={layout.cy} /> : null}
      {size.ready ? (
        <svg
          className="pointer-events-none absolute inset-0"
          width={size.w}
          height={size.h}
          aria-hidden
        >
          {layout.rings.map((ring, i) => (
            <ellipse
              key={i}
              cx={layout.cx}
              cy={layout.cy}
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke="var(--mb-solar-orbit)"
              strokeWidth={1}
              strokeOpacity={0.85 - i * 0.18}
            />
          ))}
        </svg>
      ) : null}

      {size.ready ? (
        <div
          className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: layout.cx, top: layout.cy }}
        >
          <button
            type="button"
            onClick={onOpenHearth}
            aria-label={youAria(flame?.streak ?? 0, flame?.state ?? "out")}
            className="rounded-full"
          >
            <YouGlyph size={layout.youR * 2} warmth={flame?.state ?? "out"} />
          </button>
          {!named.length && onNameBank ? (
            <button
              type="button"
              onClick={onNameBank}
              className="mt-4 min-h-11 max-w-[16rem] text-center text-sm text-[var(--mb-solar-muted)] hover:text-[var(--mb-solar-ink)]"
            >
              Name someone. Keep something.
            </button>
          ) : null}
        </div>
      ) : null}

      {size.ready
        ? banks.map((bank) => {
            const body = layout.planets.find((planet) => planet.id === bank.id);
            if (!body) return null;
            const color = bankColor(bank.id, bank.is_loose);
            const warmth = bankWarmthShadow(bank.warmth, bank.streak);
            const streakBit =
              bank.streak && bank.warmth !== "out"
                ? `, ${bank.streak} day streak`
                : "";
            const dim = searching && !bankMatches(bank, needle);
            const sizePx = Math.max(44, body.r * 2);
            const hovered = hoverId === bank.id;
            return (
              <div
                key={bank.id}
                ref={orbit.bind(bank.id, {
                  rx: body.rx,
                  ry: body.ry,
                  baseAngle: body.baseAngle,
                  period: body.period * (1 + hashUnit(bank.id) * 0.08),
                  ax: sizePx / 2,
                  ay: sizePx / 2,
                })}
                className={cn(
                  "absolute top-0 left-0 will-change-transform",
                  hovered ? "z-50" : "z-10",
                  dim && "opacity-25",
                )}
                style={{ width: sizePx, height: sizePx }}
              >
                <button
                  type="button"
                  onClick={() => onOpenBank(bank.id)}
                  onMouseEnter={() => {
                    setPaused(true);
                    setHoverId(bank.id);
                  }}
                  onMouseLeave={() => {
                    setPaused(false);
                    setHoverId(null);
                  }}
                  onFocus={() => {
                    setPaused(true);
                    setHoverId(bank.id);
                  }}
                  onBlur={() => {
                    setPaused(false);
                    setHoverId(null);
                  }}
                  aria-label={`${bank.name}, ${bank.memory_count} ${bank.memory_count === 1 ? "memory" : "memories"}${streakBit}`}
                  className="block size-full"
                >
                  <motion.span
                    layoutId={`planet-${bank.id}`}
                    transition={{ duration: reduceMotion ? 0.12 : 0.55, ease }}
                    className="relative block size-full overflow-hidden rounded-full"
                    style={{
                      background: color.fill,
                      boxShadow: [
                        warmth,
                        bank.id === lastId ? `0 0 0 6px ${color.soft}` : null,
                        warmth ? null : "0 10px 28px rgba(58,42,37,0.2)",
                      ]
                        .filter(Boolean)
                        .join(", "),
                    }}
                  >
                    <KeepsakeFace src={bank.cover?.url} seed={bank.id} />
                  </motion.span>
                </button>
                {hovered ? (
                  <SolarCaption
                    text={bank.name}
                    sub={[
                      bank.memory_count === 1
                        ? "1 memory"
                        : `${bank.memory_count} memories`,
                      bank.streak && bank.warmth === "ember"
                        ? `Quiet · ${bank.streak}`
                        : bank.streak && bank.warmth === "lit"
                          ? `${bank.streak} warm`
                          : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                ) : null}
              </div>
            );
          })
        : null}

      {size.ready ? <ZoomControls zoom={zoom} onChange={onZoom} /> : null}
    </motion.div>
  );
}
