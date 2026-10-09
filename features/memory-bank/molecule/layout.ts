import { hashUnit } from "@/features/memory-bank/solar/layout";

export const NODE_STEP = 148;
export const NODE_R = 34;
export const LATEST_R = 46;

export type MoleculeItem = {
  id: string;
  stamp: number;
};

export type MoleculeNode = {
  id: string;
  x: number;
  y: number;
  r: number;
  latest: boolean;
  stamp: number;
};

export type MoleculeBond = {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  near: boolean;
};

export type MoleculeLayout = {
  cx: number;
  nodes: MoleculeNode[];
  bonds: MoleculeBond[];
  width: number;
  height: number;
  padTop: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function sortNewestFirst<T extends MoleculeItem>(items: T[]): T[] {
  return items.slice().sort((a, b) => {
    if (b.stamp !== a.stamp) return b.stamp - a.stamp;
    return a.id.localeCompare(b.id);
  });
}

export function layoutMolecule(
  items: MoleculeItem[],
  view: { w: number; h: number },
): MoleculeLayout {
  const width = Math.max(view.w, 320);
  const heightView = Math.max(view.h, 320);
  const cx = width / 2;
  const padTop = Math.max(112, heightView * 0.36);
  const padBottom = Math.max(240, heightView * 0.58);
  const amp = Math.max(36, Math.min(96, width / 2 - LATEST_R - 40));
  const ordered = sortNewestFirst(items);

  if (!ordered.length) {
    return {
      cx,
      nodes: [],
      bonds: [],
      width,
      height: heightView,
      padTop,
    };
  }

  const nodes: MoleculeNode[] = ordered.map((item, i) => {
    const latest = i === 0;
    const r = latest ? LATEST_R : NODE_R;
    const swing = Math.sin(i * 1.12) * amp;
    const jitter = (hashUnit(item.id, 7) - 0.5) * 28;
    return {
      id: item.id,
      x: cx + swing + jitter,
      y: padTop + i * NODE_STEP,
      r,
      latest,
      stamp: item.stamp,
    };
  });

  const bonds: MoleculeBond[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]!;
    const b = nodes[i + 1]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bulge = 16 + hashUnit(a.id, 3) * 24;
    bonds.push({
      from: a.id,
      to: b.id,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      cx: (a.x + b.x) / 2 + (-dy / len) * bulge,
      cy: (a.y + b.y) / 2 + (dx / len) * bulge,
      near: Math.abs(a.stamp - b.stamp) < WEEK_MS,
    });
  }

  const last = nodes[nodes.length - 1]!;
  return {
    cx,
    nodes,
    bonds,
    width,
    height: last.y + last.r + padBottom,
    padTop,
  };
}
