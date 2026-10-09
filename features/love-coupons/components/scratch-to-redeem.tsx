"use client";

import { useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/** Share of the card that must be scratched before the rest of the foil fades. */
const REVEAL_THRESHOLD = 0.36;
/** Brush radius as a fraction of the shorter side — a few swipes, not a grind. */
const BRUSH_RATIO = 0.13;
const GRID_COLS = 12;
const GRID_ROWS = 16;

type Point = { x: number; y: number };

/**
 * A metallic foil you scratch off to redeem a coupon — the scratch *is* the
 * redeem. Fires {@link onComplete} once enough foil is gone (canvas, drag to
 * erase). Falls back to a button when motion is reduced or canvas is missing.
 * The thing being revealed underneath is the caller's `children`.
 */
export function ScratchToRedeem({
  onComplete,
  children,
  accent,
  label = "SCRATCH TO REVEAL",
  className,
}: {
  onComplete: () => void;
  children: React.ReactNode;
  /** Tint for the label + the fallback button icon. */
  accent: string;
  /** Text printed on the foil (and the reduced-motion fallback button). */
  label?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const fired = useRef(false);
  const lastRef = useRef<Point | null>(null);
  const pendingRef = useRef<Point | null>(null);
  const rafRef = useRef(0);
  const brushRef = useRef(32);
  const gridRef = useRef<Uint8Array | null>(null);
  const hitRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const [revealed, setRevealed] = useState(false);

  const finish = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    drawing.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setRevealed(true);
    onComplete();
  }, [onComplete]);

  const paintFoil = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#b9b2bd");
      g.addColorStop(0.45, "#e7e0e6");
      g.addColorStop(0.55, "#cfc6cf");
      g.addColorStop(1, "#a89aa6");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 8;
      for (let x = -h; x < w; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(60,40,46,0.55)";
      ctx.font = "700 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`✦  ${label}  ✦`, w / 2, h / 2 + 4);
    },
    [label],
  );

  const stamp = useCallback((x: number, y: number) => {
    const grid = gridRef.current;
    const { w, h } = sizeRef.current;
    if (!grid || !w || !h) return;
    const r = brushRef.current;
    const cellW = w / GRID_COLS;
    const cellH = h / GRID_ROWS;
    const c0 = Math.max(0, Math.floor((x - r) / cellW));
    const c1 = Math.min(GRID_COLS - 1, Math.floor((x + r) / cellW));
    const r0 = Math.max(0, Math.floor((y - r) / cellH));
    const r1 = Math.min(GRID_ROWS - 1, Math.floor((y + r) / cellH));
    const r2 = r * r;
    for (let row = r0; row <= r1; row++) {
      const cy = (row + 0.5) * cellH;
      const dy = cy - y;
      for (let col = c0; col <= c1; col++) {
        const cx = (col + 0.5) * cellW;
        const dx = cx - x;
        if (dx * dx + dy * dy > r2) continue;
        const i = row * GRID_COLS + col;
        if (grid[i]) continue;
        grid[i] = 1;
        hitRef.current += 1;
      }
    }
  }, []);

  const strokeTo = useCallback(
    (point: Point) => {
      const ctx = ctxRef.current;
      if (!ctx || fired.current) return;
      const brush = brushRef.current;
      const prev = lastRef.current;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "#000";
      ctx.strokeStyle = "#000";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brush * 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, brush, 0, Math.PI * 2);
      ctx.fill();
      if (prev) {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }

      const from = prev ?? point;
      const dx = point.x - from.x;
      const dy = point.y - from.y;
      const dist = Math.hypot(dx, dy);
      const step = Math.max(8, brush * 0.55);
      const steps = Math.max(1, Math.ceil(dist / step));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        stamp(from.x + dx * t, from.y + dy * t);
      }
      lastRef.current = point;
      if (hitRef.current / (GRID_COLS * GRID_ROWS) >= REVEAL_THRESHOLD) {
        finish();
      }
    },
    [finish, stamp],
  );

  const flush = useCallback(() => {
    rafRef.current = 0;
    const point = pendingRef.current;
    pendingRef.current = null;
    if (!point || !drawing.current) return;
    strokeTo(point);
  }, [strokeTo]);

  useLayoutEffect(() => {
    if (reduceMotion) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      if (fired.current) return;
      const w = Math.round(wrap.clientWidth);
      const h = Math.round(wrap.clientHeight);
      if (!w || !h) return;
      if (canvas.width === w && canvas.height === h && ctxRef.current) return;
      canvas.width = w;
      canvas.height = h;
      ctxRef.current = ctx;
      sizeRef.current = { w, h };
      brushRef.current = Math.max(28, Math.round(Math.min(w, h) * BRUSH_RATIO));
      gridRef.current = new Uint8Array(GRID_COLS * GRID_ROWS);
      hitRef.current = 0;
      lastRef.current = null;
      paintFoil(ctx, w, h);
    };

    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [reduceMotion, paintFoil]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toCanvas = (clientX: number, clientY: number): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (fired.current) return;
    drawing.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Capture can fail if the pointer is already gone; the stroke still counts.
    }
    lastRef.current = null;
    const point = toCanvas(e.clientX, e.clientY);
    if (point) strokeTo(point);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || fired.current) return;
    const point = toCanvas(e.clientX, e.clientY);
    if (!point) return;
    pendingRef.current = point;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(flush);
  };

  const onPointerUp = () => {
    drawing.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const point = pendingRef.current;
    pendingRef.current = null;
    if (point && !fired.current) strokeTo(point);
    lastRef.current = null;
  };

  if (reduceMotion) {
    return (
      <div className={cn("relative", className)}>
        {revealed ? (
          children
        ) : (
          <button
            type="button"
            onClick={finish}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-[#7e1426] transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="size-4" style={{ color: accent }} /> Reveal
            this coupon
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative h-24 w-full overflow-hidden rounded-xl",
        className,
      )}
    >
      <div className="absolute inset-0 grid place-items-center">{children}</div>

      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "absolute inset-0 h-full w-full touch-none transition-opacity duration-300 active:cursor-grabbing",
          revealed
            ? "pointer-events-none opacity-0"
            : "cursor-grab opacity-100",
        )}
        aria-label="Scratch to redeem"
      />
    </div>
  );
}
