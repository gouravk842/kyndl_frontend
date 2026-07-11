"use client";

import { useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const REVEAL_THRESHOLD = 0.5;

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
  const drawing = useRef(false);
  const fired = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const finish = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
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
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // diagonal shimmer streaks
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

  useEffect(() => {
    if (reduceMotion) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    const w = Math.round(wrap.clientWidth);
    const h = Math.round(wrap.clientHeight);
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    paintFoil(ctx, w, h);
  }, [reduceMotion, paintFoil]);

  const erodeAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    for (let i = 3; i < data.length; i += 64) {
      if (data[i] === 0) clear += 1;
    }
    if (clear / (data.length / 64) > REVEAL_THRESHOLD) finish();
  }, [finish]);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    erodeAt(e.clientX, e.clientY);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    erodeAt(e.clientX, e.clientY);
    measure();
  };
  const onPointerUp = () => {
    drawing.current = false;
    measure();
  };

  // Reduced motion / no-scratch fallback: a plain redeem button.
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
            <Sparkles className="size-4" style={{ color: accent }} /> Reveal this
            coupon
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
      {/* revealed layer */}
      <div className="absolute inset-0 grid place-items-center">{children}</div>

      {/* scratch foil */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className={cn(
          "absolute inset-0 h-full w-full touch-none transition-opacity duration-500",
          revealed ? "pointer-events-none opacity-0" : "cursor-grab opacity-100",
        )}
        aria-label="Scratch to redeem"
      />
    </div>
  );
}
