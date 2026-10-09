"use client";

import { Plus } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  KeepsakeFace,
  memoryCoverSrc,
} from "@/features/memory-bank/lib/keepsake-face";
import {
  formatMemoryDay,
  previewLine,
} from "@/features/memory-bank/lib/preview";
import { memoryStamp } from "@/features/memory-bank/solar/layout";
import { SolarAtmosphere } from "@/features/memory-bank/solar/solar-atmosphere";
import { polaroidTilt } from "@/features/memory-bank/solar/solar-caption";
import { useHostSize } from "@/features/memory-bank/solar/use-host-size";
import { cn } from "@/lib/utils";
import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

import { layoutMolecule } from "./layout";

type FocalMap = Record<string, boolean>;

function memoryMatch(memory: BankMemory, needle: string) {
  if (!needle) return true;
  return (
    memory.title.toLowerCase().includes(needle) ||
    memory.note.toLowerCase().includes(needle)
  );
}

function bankMatch(circle: MemoryCircle, needle: string) {
  if (!needle) return true;
  return circle.name.toLowerCase().includes(needle);
}

export function MemoryMolecule({
  inside,
  banks,
  memories,
  needle,
  searching,
  filterIds,
  reduceMotion,
  spawnedId,
  onOpenBank,
  onOpenMemory,
  onKeep,
}: {
  inside: boolean;
  banks: MemoryCircle[];
  memories: BankMemory[];
  needle: string;
  searching: boolean;
  filterIds?: string[] | null;
  reduceMotion: boolean;
  spawnedId?: string | null;
  onOpenBank: (id: string) => void;
  onOpenMemory: (index: number) => void;
  onKeep: () => void;
}) {
  const { ref: hostRef, size } = useHostSize();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [focal, setFocal] = useState<FocalMap>({});

  const scoped = useMemo(() => {
    if (!inside) return [];
    return filterIds
      ? memories.filter((memory) => filterIds.includes(memory.id))
      : memories;
  }, [filterIds, inside, memories]);

  const items = useMemo(() => {
    if (inside) {
      return scoped.map((memory) => ({
        id: memory.id,
        stamp: memoryStamp(memory),
      }));
    }
    return banks.map((bank) => ({
      id: bank.id,
      stamp: Date.parse(bank.updated_at) || Date.parse(bank.created_at) || 0,
    }));
  }, [banks, inside, scoped]);

  const layout = useMemo(
    () => layoutMolecule(items, size.ready ? size : { w: 800, h: 700 }),
    [items, size],
  );

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || !size.ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setFocal((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const entry of entries) {
            const id = entry.target.getAttribute("data-node");
            if (!id) continue;
            const on = entry.isIntersecting;
            if (next[id] !== on) {
              next[id] = on;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      {
        root,
        threshold: 0.45,
        rootMargin: "-32% 0px -32% 0px",
      },
    );
    root
      .querySelectorAll("[data-node]")
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [layout.nodes, size.ready]);

  useEffect(() => {
    if (!spawnedId || !scrollerRef.current) return;
    scrollerRef.current.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [reduceMotion, spawnedId]);

  const emptyInside = inside && !memories.length;
  const emptySky = !inside && !banks.length;

  return (
    <div ref={hostRef} className="absolute inset-0">
      {size.ready ? (
        <SolarAtmosphere cx={layout.cx} cy={layout.padTop} />
      ) : null}
      <div
        ref={scrollerRef}
        className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain pb-28 md:pb-10"
      >
        {emptyInside || emptySky ? (
          <EmptyStrand inside={inside} onKeep={onKeep} />
        ) : (
          <div
            className="relative mx-auto"
            style={{ width: layout.width, height: layout.height }}
          >
            <p className="sr-only">
              {inside
                ? `${scoped.length} memories in a timeline strand. Newest first. Scroll to bring older ones forward.`
                : `${banks.length} banks in a timeline strand. Newest first.`}
            </p>
            {size.ready ? (
              <svg
                className="pointer-events-none absolute inset-0"
                width={layout.width}
                height={layout.height}
                aria-hidden
              >
                {layout.bonds.map((bond) => {
                  const live =
                    reduceMotion || focal[bond.from] || focal[bond.to];
                  const d = `M ${bond.x1} ${bond.y1} Q ${bond.cx} ${bond.cy} ${bond.x2} ${bond.y2}`;
                  return (
                    <g key={`${bond.from}-${bond.to}`}>
                      <path
                        d={d}
                        fill="none"
                        stroke="var(--mb-solar-orbit)"
                        strokeWidth={bond.near ? 2.4 : 1.4}
                        strokeLinecap="round"
                        style={{
                          opacity: live ? 0.85 : 0.22,
                          transition: reduceMotion
                            ? undefined
                            : "opacity 420ms ease",
                        }}
                      />
                      {bond.near ? (
                        <path
                          d={d}
                          fill="none"
                          stroke="var(--mb-solar-orbit-strong)"
                          strokeWidth={1}
                          strokeDasharray="3 10"
                          style={{
                            opacity: live ? 0.55 : 0.12,
                            transition: reduceMotion
                              ? undefined
                              : "opacity 420ms ease",
                          }}
                        />
                      ) : null}
                    </g>
                  );
                })}
              </svg>
            ) : null}

            {inside
              ? layout.nodes.map((node) => {
                  const memory = scoped.find((row) => row.id === node.id);
                  if (!memory) return null;
                  const index = memories.indexOf(memory);
                  const hit = memoryMatch(memory, needle);
                  const live =
                    reduceMotion ||
                    focal[node.id] === true ||
                    (node.latest && focal[node.id] !== false);
                  const cover = memoryCoverSrc(memory);
                  const line = previewLine(memory);
                  const tilt = polaroidTilt(memory.id);
                  return (
                    <NodeButton
                      key={node.id}
                      id={node.id}
                      x={node.x}
                      y={node.y}
                      r={node.r}
                      live={live}
                      searchDim={searching && !hit}
                      latest={node.latest}
                      spawned={spawnedId === memory.id}
                      reduceMotion={reduceMotion}
                      label={line}
                      caption={live ? line : node.latest ? "Now" : undefined}
                      sub={
                        live && memory.occurred_on
                          ? formatMemoryDay(memory.occurred_on)
                          : live && node.latest
                            ? "Now"
                            : undefined
                      }
                      onClick={() => onOpenMemory(index)}
                    >
                      <span
                        className="block size-full"
                        style={{ transform: `rotate(${tilt}deg)` }}
                      >
                        <KeepsakeFace src={cover} seed={memory.id} />
                      </span>
                    </NodeButton>
                  );
                })
              : layout.nodes.map((node) => {
                  const bank = banks.find((row) => row.id === node.id);
                  if (!bank) return null;
                  const hit = bankMatch(bank, needle);
                  const live =
                    reduceMotion ||
                    focal[node.id] === true ||
                    (node.latest && focal[node.id] !== false);
                  return (
                    <NodeButton
                      key={node.id}
                      id={node.id}
                      x={node.x}
                      y={node.y}
                      r={node.r}
                      live={live}
                      searchDim={searching && !hit}
                      latest={node.latest}
                      spawned={false}
                      reduceMotion={reduceMotion}
                      label={bank.name}
                      caption={
                        live ? bank.name : node.latest ? "Now" : undefined
                      }
                      sub={
                        live
                          ? bank.memory_count === 1
                            ? "1 memory"
                            : `${bank.memory_count} memories`
                          : undefined
                      }
                      onClick={() => onOpenBank(bank.id)}
                    >
                      <KeepsakeFace src={bank.cover?.url} seed={bank.id} />
                    </NodeButton>
                  );
                })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyStrand({
  inside,
  onKeep,
}: {
  inside: boolean;
  onKeep: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 pt-20 pb-32 text-center">
      <p className="font-display text-2xl text-[var(--mb-solar-ink)]">
        {inside ? "Keep the first one." : "Name someone. Keep something."}
      </p>
      <p className="mt-2 text-sm text-[var(--mb-solar-muted)]">
        {inside
          ? "Newest sits at the top. Scroll brings the rest forward."
          : "A strand of banks, newest first."}
      </p>
      <Button className="mt-5 min-h-11" onClick={onKeep}>
        <Plus className="size-4" />
        {inside ? "Keep" : "Add"}
      </Button>
    </div>
  );
}

function NodeButton({
  id,
  x,
  y,
  r,
  live,
  searchDim,
  latest,
  spawned,
  reduceMotion,
  label,
  caption,
  sub,
  onClick,
  children,
}: {
  id: string;
  x: number;
  y: number;
  r: number;
  live: boolean;
  searchDim: boolean;
  latest: boolean;
  spawned: boolean;
  reduceMotion: boolean;
  label: string;
  caption?: string;
  sub?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const sizePx = Math.max(44, r * 2);
  const pop = live && !searchDim;
  return (
    <button
      type="button"
      data-node={id}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute overflow-visible rounded-full",
        latest && "z-10",
        searchDim && "pointer-events-none",
      )}
      style={{
        width: sizePx,
        height: sizePx,
        left: x - sizePx / 2,
        top: y - sizePx / 2,
        opacity: searchDim ? 0.14 : pop ? 1 : latest ? 0.42 : 0.2,
        filter: pop ? "none" : "saturate(0.45)",
        transition: reduceMotion
          ? undefined
          : "opacity 480ms ease, filter 480ms ease",
        boxShadow: pop
          ? spawned
            ? "0 0 0 6px rgba(199, 91, 57, 0.28), 0 12px 28px rgba(58,42,37,0.2)"
            : "0 12px 28px rgba(58,42,37,0.18)"
          : "none",
      }}
    >
      <span
        className={cn(
          "block size-full overflow-hidden rounded-full border-2 bg-[#FFF1E8]",
          latest ? "border-[#FFF7F1]" : "border-[#F2DACE]",
        )}
        style={{
          transform: reduceMotion ? undefined : `scale(${pop ? 1 : 0.78})`,
          transition: reduceMotion
            ? undefined
            : "transform 480ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {children}
      </span>
      {caption ? (
        <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-20 w-max max-w-[9rem] -translate-x-1/2 text-center">
          <span className="block truncate text-[11px] text-[var(--mb-solar-ink)]">
            {caption}
          </span>
          {sub ? (
            <span className="block text-[10px] text-[var(--mb-solar-muted)]">
              {sub}
            </span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}
