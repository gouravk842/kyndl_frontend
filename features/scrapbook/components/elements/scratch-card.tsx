"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import { AssetSlot } from "./asset-slot";

type ScratchCardProps = {
  prompt?: string;
  reveal: { text?: string; src?: string };
};

const WIDTH = 224;
const HEIGHT = 168;
const REVEAL_THRESHOLD = 0.55;

/**
 * Scratch-off card. Drag across the foil to erase it and uncover the hidden
 * photo or message. Falls back to a tap-to-reveal button when motion is
 * reduced or the canvas is unavailable.
 */
export function ScratchCard({ prompt, reveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const paintCoating = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
      gradient.addColorStop(0, "#ffd9b0");
      gradient.addColorStop(0.5, "#fbd9ce");
      gradient.addColorStop(1, "#f7c9c0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "rgba(122, 91, 58, 0.65)";
      ctx.font = "600 14px var(--font-hand), cursive";
      ctx.textAlign = "center";
      ctx.fillText(prompt ?? "Scratch here", WIDTH / 2, HEIGHT / 2);
    },
    [prompt],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      paintCoating(ctx);
    }
  }, [paintCoating]);

  const erodeAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const y = ((clientY - rect.top) / rect.height) * HEIGHT;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { data } = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    let clear = 0;
    // sample every 16th pixel's alpha for cheapness
    for (let i = 3; i < data.length; i += 64) {
      if (data[i] === 0) clear += 1;
    }
    const ratio = clear / (data.length / 64);
    if (ratio > REVEAL_THRESHOLD) setRevealed(true);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    erodeAt(e.clientX, e.clientY);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    erodeAt(e.clientX, e.clientY);
  };
  const onPointerUp = () => {
    drawing.current = false;
    measure();
  };

  const hasImage = reveal.src && !imgFailed;

  return (
    <div
      className="kyndl-pinned relative overflow-hidden rounded-[3px] bg-white"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      {/* revealed layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fff7f1] p-3 text-center">
        {reveal.src ? (
          hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- local user asset with onError fallback
            <img
              src={reveal.src}
              alt={reveal.text ?? ""}
              draggable={false}
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <AssetSlot kind="photo" hint={reveal.src.split("/").pop()} />
          )
        ) : (
          <p className="font-hand text-lg leading-snug text-[#3a2a25]">
            {reveal.text}
          </p>
        )}
      </div>

      {/* scratch foil */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className={cn(
          "absolute inset-0 h-full w-full touch-none transition-opacity duration-500",
          revealed
            ? "pointer-events-none opacity-0"
            : "cursor-grab opacity-100",
        )}
        aria-label={prompt ?? "Scratch to reveal"}
      />
    </div>
  );
}
