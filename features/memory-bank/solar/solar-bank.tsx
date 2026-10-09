"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { bankColor } from "@/features/memory-bank/lib/bank-color";
import {
  bankStreakLine,
  bankWarmthShadow,
} from "@/features/memory-bank/lib/hearth";
import {
  KeepsakeFace,
  memoryCoverSrc,
} from "@/features/memory-bank/lib/keepsake-face";
import {
  formatMemoryDay,
  previewLine,
} from "@/features/memory-bank/lib/preview";
import { cn } from "@/lib/utils";
import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

import { hashUnit, layoutSolarBank, quantileTimeRings } from "./layout";
import { SolarAtmosphere } from "./solar-atmosphere";
import { polaroidTilt, SolarCaption } from "./solar-caption";
import { useHostSize } from "./use-host-size";
import { useOrbitLoop } from "./use-orbit-loop";
import { ZoomControls } from "./zoom-controls";

const ease = [0.22, 1, 0.36, 1] as const;

function memoryMatches(memory: BankMemory, needle: string) {
  if (!needle) return true;
  return (
    memory.title.toLowerCase().includes(needle) ||
    memory.note.toLowerCase().includes(needle)
  );
}

export function SolarBank({
  circle,
  memories,
  lastOpened,
  searching,
  needle,
  reduceMotion,
  zoom,
  onZoom,
  onOpenMemory,
  onKeep,
  onUseList,
  spawnedId,
}: {
  circle: MemoryCircle;
  memories: BankMemory[];
  lastOpened: Record<string, string>;
  searching: boolean;
  needle: string;
  reduceMotion: boolean;
  zoom: number;
  onZoom: (zoom: number) => void;
  onOpenMemory: (index: number) => void;
  onKeep: () => void;
  onUseList: (ids?: string[]) => void;
  spawnedId?: string | null;
}) {
  const [paused, setPaused] = useState(false);
  const [expandRing, setExpandRing] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const { ref, size } = useHostSize();
  const color = bankColor(circle.id, circle.is_loose);
  const warmth = bankWarmthShadow(circle.warmth, circle.streak);
  const streakLine = bankStreakLine(circle);
  const layout = useMemo(
    () => layoutSolarBank(memories, size, lastOpened, { expandRing, zoom }),
    [lastOpened, memories, size, expandRing, zoom],
  );
  const intro = useMemo(
    () => ({ releasing: revealed, innerR: layout.sunR }),
    [layout.sunR, revealed],
  );
  const orbit = useOrbitLoop(
    paused || !settled,
    reduceMotion,
    layout.cx,
    layout.cy,
    intro,
  );

  useEffect(() => {
    if (!size.ready) return;
    const start = window.setTimeout(
      () => setRevealed(true),
      reduceMotion ? 0 : 180,
    );
    return () => window.clearTimeout(start);
  }, [reduceMotion, size.ready]);

  useEffect(() => {
    if (!revealed) return;
    const start = window.setTimeout(
      () => setSettled(true),
      reduceMotion ? 0 : 1100,
    );
    return () => window.clearTimeout(start);
  }, [reduceMotion, revealed]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 transition-opacity duration-300",
        size.ready ? "opacity-100" : "opacity-0",
      )}
    >
      <p className="sr-only">
        {circle.name}. {memories.length}{" "}
        {memories.length === 1 ? "memory" : "memories"} on time rings.
      </p>
      {size.ready ? (
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { scale: 0.97 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.55, ease }}
        >
          <SolarAtmosphere cx={layout.cx} cy={layout.cy} />
        </motion.div>
      ) : null}
      {size.ready ? (
        <svg
          className="pointer-events-none absolute inset-0"
          width={size.w}
          height={size.h}
          aria-hidden
        >
          {layout.rings.map((ring, i) => (
            <motion.circle
              key={ring.label}
              cx={layout.cx}
              cy={layout.cy}
              r={ring.r}
              fill="none"
              stroke="var(--mb-solar-orbit)"
              strokeWidth={1}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: revealed ? 0.85 - i * 0.16 : 0 }}
              transition={{
                duration: 0.7,
                delay: reduceMotion ? 0 : i * 0.14,
                ease,
              }}
            />
          ))}
        </svg>
      ) : null}

      {size.ready ? (
        <div
          className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: layout.cx, top: layout.cy }}
        >
          <motion.div
            layoutId={`planet-${circle.id}`}
            transition={{ duration: reduceMotion ? 0.12 : 0.55, ease }}
            className="flex min-h-11 min-w-11 items-center justify-center overflow-hidden rounded-full"
            style={{
              width: Math.max(88, layout.sunR * 2),
              height: Math.max(88, layout.sunR * 2),
              background: color.fill,
              boxShadow: warmth ?? "0 12px 36px rgba(58,42,37,0.22)",
            }}
          >
            <KeepsakeFace src={circle.cover?.url} seed={circle.id} />
          </motion.div>
          <p className="mt-3 font-display text-lg text-[var(--mb-solar-ink)]">
            {circle.name}
          </p>
          {streakLine ? (
            <p className="text-xs text-[#C75B39]">{streakLine}</p>
          ) : null}
        </div>
      ) : null}

      <AnimatePresence>
        {size.ready
          ? layout.moons.map((moon) => {
              const memory = memories.find((row) => row.id === moon.id);
              if (!memory) return null;
              const index = memories.indexOf(memory);
              const ringR = layout.rings[moon.ring]?.r ?? moon.r;
              const hit = memoryMatches(memory, needle);
              const dim = (searching && !hit) || moon.dim;
              const line = previewLine(memory);
              const cover = memoryCoverSrc(memory);
              const delay = reduceMotion
                ? 0
                : 0.12 + moon.ring * 0.18 + (index % 7) * 0.06;
              const sizePx = Math.max(44, moon.r * 2);
              const spawned = spawnedId === memory.id && !reduceMotion;
              const tilt = polaroidTilt(memory.id);
              return (
                <div
                  key={moon.clustered ? `cluster-${moon.ring}` : memory.id}
                  ref={orbit.bind(
                    moon.clustered ? `cluster-${moon.ring}` : memory.id,
                    {
                      rx: ringR,
                      ry: ringR,
                      baseAngle: moon.baseAngle,
                      period: moon.period * (1 + hashUnit(memory.id) * 0.08),
                      ax: sizePx / 2,
                      ay: sizePx / 2,
                      delay: spawned ? 0 : delay,
                      duration: spawned ? 0.72 : 0.95,
                    },
                  )}
                  className={cn(
                    "absolute top-0 left-0 will-change-transform",
                    hoverId === memory.id ? "z-50" : "z-10",
                  )}
                  style={{ width: sizePx, height: sizePx }}
                >
                  {spawned ? (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-[#C75B39]/35"
                      initial={{ opacity: 0.7, scale: 1.4 }}
                      animate={{ opacity: 0, scale: 2.1 }}
                      transition={{ duration: 0.4, ease }}
                      aria-hidden
                    />
                  ) : null}
                  {moon.clustered ? (
                    <button
                      type="button"
                      className="relative flex size-full items-center justify-center"
                      onMouseEnter={() => {
                        setPaused(true);
                        setHoverId(memory.id);
                      }}
                      onMouseLeave={() => {
                        setPaused(false);
                        setHoverId(null);
                      }}
                      onFocus={() => {
                        setPaused(true);
                        setHoverId(memory.id);
                      }}
                      onBlur={() => {
                        setPaused(false);
                        setHoverId(null);
                      }}
                      onClick={() => {
                        if (memories.length > 60) {
                          const bucket = quantileTimeRings(memories)[moon.ring];
                          onUseList(bucket?.memories.map((row) => row.id));
                        } else {
                          setExpandRing(moon.ring);
                        }
                      }}
                      aria-label={`${moon.hiddenCount} more memories from ${moon.label}`}
                    >
                      <span className="absolute inset-[10px] rounded-full bg-[#E3A78C] shadow-sm" />
                      <span className="absolute inset-[5px] rounded-full bg-[#F2DACE] shadow-sm" />
                      <span className="relative flex size-[74%] items-center justify-center rounded-full border border-[#F2DACE] bg-[#FFF1E8] text-xs font-medium text-[var(--mb-solar-ink)]">
                        +{moon.hiddenCount}
                      </span>
                    </button>
                  ) : (
                    <motion.button
                      type="button"
                      layoutId={`moon-${memory.id}`}
                      initial={
                        reduceMotion
                          ? false
                          : { scale: spawned ? 0.08 : 0.18, opacity: 0 }
                      }
                      animate={{
                        scale: revealed ? 1 : 0.18,
                        opacity: revealed
                          ? dim
                            ? moon.dim
                              ? 0.45
                              : 0.28
                            : 1
                          : 0,
                      }}
                      exit={
                        reduceMotion ? undefined : { opacity: 0, scale: 0.5 }
                      }
                      transition={
                        reduceMotion
                          ? { duration: 0.12 }
                          : {
                              duration: spawned ? 0.72 : 0.85,
                              delay: spawned ? 0 : delay,
                              ease,
                            }
                      }
                      onClick={() => onOpenMemory(index)}
                      onMouseEnter={() => {
                        setPaused(true);
                        setHoverId(memory.id);
                      }}
                      onMouseLeave={() => {
                        setPaused(false);
                        setHoverId(null);
                      }}
                      onFocus={() => {
                        setPaused(true);
                        setHoverId(memory.id);
                      }}
                      onBlur={() => {
                        setPaused(false);
                        setHoverId(null);
                      }}
                      aria-label={line}
                      className={cn(
                        "size-full overflow-hidden rounded-full bg-[#FFF1E8] border-2 border-[#FFF7F1] shadow-[0_4px_12px_rgba(58,42,37,0.16)]",
                        moon.dim && "saturate-50",
                        dim && searching && "pointer-events-none",
                      )}
                    >
                      <span
                        className="block size-full"
                        style={{ transform: `rotate(${tilt}deg)` }}
                      >
                        <KeepsakeFace src={cover} seed={memory.id} />
                      </span>
                    </motion.button>
                  )}
                  {hoverId === memory.id ? (
                    <SolarCaption
                      text={line}
                      sub={
                        moon.clustered
                          ? moon.label
                          : memory.occurred_on
                            ? formatMemoryDay(memory.occurred_on)
                            : moon.label
                      }
                    />
                  ) : null}
                </div>
              );
            })
          : null}
      </AnimatePresence>

      {size.ready && !memories.length ? (
        <div className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center md:bottom-24">
          <p className="text-sm text-[var(--mb-solar-muted)]">
            Keep the first one.
          </p>
          <Button className="mt-3 min-h-11" onClick={onKeep}>
            <Plus className="size-4" />
            Keep
          </Button>
        </div>
      ) : null}

      {layout.suggestList ? (
        <div
          data-hud
          className="absolute bottom-28 left-1/2 z-20 w-[min(90vw,28rem)] -translate-x-1/2 rounded-2xl border border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/95 px-4 py-3 text-center text-sm text-[var(--mb-solar-ink)] md:bottom-6"
        >
          This bank is large. List is easier to scan.
          <button
            type="button"
            className="ml-2 min-h-11 underline"
            onClick={() => onUseList()}
          >
            Open List
          </button>
        </div>
      ) : null}

      {size.ready ? <ZoomControls zoom={zoom} onChange={onZoom} /> : null}
    </div>
  );
}
