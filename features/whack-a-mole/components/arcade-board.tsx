"use client";

/**
 * Full-bleed arcade board. The mallet is a rigid swing (see hammer-physics);
 * face moles are a photo worn as a head.
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { impactDelayMs } from "@/features/whack-a-mole/lib/hammer-physics";
import {
  playHitThud,
  unlockHitAudio,
} from "@/features/whack-a-mole/lib/hit-audio";
import { cn } from "@/lib/utils";

import { HumanHead } from "./human-head";
import { Mallet, useMallet } from "./mallet";

type MoleKind = "face" | "apology" | "sacred";
type Mole = { id: string; hole: number; kind: MoleKind };

type Burst = {
  id: string;
  hole: number;
  kind: MoleKind | "miss";
  x: number;
  y: number;
};

type Smash = { id: string; hole: number; kind: MoleKind };

export function ArcadeBoard({
  holeCount,
  moles,
  faceUrl,
  onWhack,
  className,
}: {
  holeCount: number;
  moles: Mole[];
  faceUrl: string;
  onWhack: (hole: number) => void;
  className?: string;
}) {
  const reduceMotion = !!useReducedMotion();
  const boardRef = useRef<HTMLDivElement>(null);
  const [shaking, setShaking] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [smashes, setSmashes] = useState<Smash[]>([]);
  const byHole = new Map(moles.map((m) => [m.hole, m]));
  const mallet = useMallet(reduceMotion);
  const impactMs = impactDelayMs(reduceMotion);

  useEffect(() => {
    if (!shaking) return;
    const t = window.setTimeout(() => setShaking(false), 280);
    return () => window.clearTimeout(t);
  }, [shaking]);

  const boardPoint = (clientX: number, clientY: number) => {
    const el = boardRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const strike = (hole: number, e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (smashes.some((s) => s.hole === hole)) return;
    const el = boardRef.current;
    if (!el) return;

    unlockHitAudio();
    const br = el.getBoundingClientRect();
    const hr = e.currentTarget.getBoundingClientRect();
    const x = hr.left - br.left + hr.width * 0.5;
    const y = hr.top - br.top + hr.height * 0.36;
    mallet.strike(x, y);

    const mole = byHole.get(hole);
    const burstId = `b-${performance.now()}-${hole}`;
    if (mole) {
      setSmashes((s) => [...s, { id: mole.id, hole, kind: mole.kind }]);
    }

    window.setTimeout(() => {
      playHitThud(mole ? mole.kind : "miss");
      if (mole && !reduceMotion) setShaking(true);
      if (mole) {
        window.setTimeout(
          () => {
            setSmashes((s) => s.filter((hit) => hit.id !== mole.id));
          },
          reduceMotion ? 90 : 340,
        );
      }
      setBursts((b) => [
        ...b,
        {
          id: burstId,
          hole,
          kind: mole ? mole.kind : "miss",
          x,
          y: y + hr.height * 0.08,
        },
      ]);
      window.setTimeout(() => {
        setBursts((b) => b.filter((burst) => burst.id !== burstId));
      }, 560);
    }, impactMs);

    onWhack(hole);
  };

  return (
    <div
      ref={boardRef}
      onPointerMove={(e) => {
        const p = boardPoint(e.clientX, e.clientY);
        if (p) mallet.follow(p.x, p.y);
      }}
      onPointerLeave={() => mallet.hide()}
      className={cn(
        "relative h-full w-full select-none touch-none",
        shaking && "wm-board-shake",
        className,
      )}
      style={{ cursor: mallet.visible ? "none" : "auto" }}
    >
      <style>{`
        @keyframes wm-board-shake {
          0%, 100% { transform: translate3d(0,0,0); }
          20% { transform: translate3d(-3px, 2px, 0); }
          40% { transform: translate3d(3px, -1px, 0); }
          60% { transform: translate3d(-2px, 1px, 0); }
          80% { transform: translate3d(1px, 0, 0); }
        }
        .wm-board-shake { animation: wm-board-shake 0.28s ease-out; }
        @keyframes wm-head-idle {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 1.2%, 0); }
        }
        .wm-head-idle { animation: wm-head-idle 2.8s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden rounded-[1.25rem] border border-[#e0c3ae] bg-[#f3e2d2] shadow-[0_24px_56px_-28px_rgba(58,42,37,0.5)] sm:rounded-[1.75rem]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 0%, #f8efe6 0%, #e7cbb4 48%, #d7b192 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(90,52,28,0.05) 0 2px, transparent 2px 11px)",
          }}
        />

        <div
          className="absolute inset-0 grid gap-[2.5%] p-[3.5%] sm:gap-[3%] sm:p-[4%]"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {Array.from({ length: holeCount }, (_, hole) => {
            const mole = byHole.get(hole);
            const smash = smashes.find((s) => s.hole === hole);
            const show = smash ?? mole;
            return (
              <Hole
                key={hole}
                hole={hole}
                mole={show ?? null}
                smashed={Boolean(smash)}
                faceUrl={faceUrl}
                reduceMotion={reduceMotion}
                impactSeconds={impactMs / 1000}
                onStrike={strike}
              />
            );
          })}
        </div>

        <AnimatePresence>
          {bursts.map((b) => (
            <WhackBurst key={b.id} burst={b} reduceMotion={reduceMotion} />
          ))}
        </AnimatePresence>

        <Mallet
          malletRef={mallet.malletRef}
          shadowRef={mallet.shadowRef}
          visible={mallet.visible}
        />
      </div>
    </div>
  );
}

function Hole({
  hole,
  mole,
  smashed,
  faceUrl,
  reduceMotion,
  impactSeconds,
  onStrike,
}: {
  hole: number;
  mole: Mole | null;
  smashed: boolean;
  faceUrl: string;
  reduceMotion: boolean;
  impactSeconds: number;
  onStrike: (hole: number, e: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      aria-label={mole ? `Whack ${mole.kind}` : "Empty hole"}
      onPointerDown={(e) => onStrike(hole, e)}
      className="relative touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2596F]/60"
    >
      <span
        aria-hidden
        className="absolute inset-x-[1%] top-[44%] bottom-0 rounded-[50%] bg-gradient-to-b from-[#edd3b6] via-[#c49262] to-[#7a4e30] shadow-[0_7px_0_#5c3822]"
      />
      <span
        aria-hidden
        className="absolute inset-x-[12%] top-[54%] bottom-[5%] rounded-[50%] bg-gradient-to-b from-[#2a1a12] to-[#0c0604] shadow-[inset_0_12px_16px_rgba(0,0,0,0.72)]"
      />

      <span className="absolute inset-x-[14%] top-[6%] bottom-[14%] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {mole && (
            <motion.span
              key={mole.id}
              initial={reduceMotion ? { y: "6%" } : { y: "108%" }}
              animate={
                smashed
                  ? { y: "62%", scaleY: 0.42, scaleX: 1.08, opacity: 1 }
                  : { y: "0%", scaleY: 1, scaleX: 1, opacity: 1 }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { y: "110%", opacity: 0, transition: { duration: 0.18 } }
              }
              transition={
                smashed
                  ? {
                      delay: impactSeconds,
                      type: "spring",
                      stiffness: 520,
                      damping: 28,
                      mass: 0.8,
                    }
                  : {
                      type: "spring",
                      stiffness: 220,
                      damping: 22,
                      mass: 1,
                    }
              }
              className="absolute inset-x-0 top-0 bottom-0 origin-bottom"
            >
              <span
                className={cn(
                  "block h-full w-full",
                  !smashed && !reduceMotion && "wm-head-idle",
                )}
              >
                <MoleBody
                  kind={mole.kind}
                  faceUrl={faceUrl}
                  smashed={smashed}
                />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] bottom-[2%] z-20 h-[16%] rounded-[50%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(90,52,30,0.15) 42%, #9a6844 100%)",
          boxShadow: "0 5px 0 rgba(92, 56, 34, 0.35)",
        }}
      />
    </button>
  );
}

function MoleBody({
  kind,
  faceUrl,
  smashed,
}: {
  kind: MoleKind;
  faceUrl: string;
  smashed: boolean;
}) {
  if (kind === "sacred") {
    return (
      <span className="flex h-full w-full flex-col items-center justify-end">
        <span className="grid aspect-square w-[78%] place-items-center rounded-full bg-gradient-to-b from-white to-[#ffe0ea] shadow-[0_8px_16px_rgba(40,18,10,0.28)] ring-[3px] ring-white/90">
          <Heart className="size-[48%] fill-[#F2596F] text-[#F2596F]" />
        </span>
        <span className="mt-[-6%] h-[26%] w-[58%] rounded-b-full bg-gradient-to-b from-[#ffe0ea] to-[#e090a8] shadow-[inset_0_-8px_10px_rgba(90,20,40,0.18)]" />
      </span>
    );
  }

  if (kind === "apology") {
    return (
      <span className="flex h-full w-full flex-col items-center justify-end">
        <span className="relative grid aspect-square w-[78%] place-items-center overflow-hidden rounded-full bg-gradient-to-b from-[#ffe7b0] to-[#e0942a] shadow-[0_8px_16px_rgba(40,18,10,0.28)] ring-[3px] ring-[#fff1c8]">
          <Sparkles className="size-[46%] text-white drop-shadow" />
        </span>
        <span className="mt-[-6%] h-[26%] w-[58%] rounded-b-full bg-gradient-to-b from-[#e0942a] to-[#a86412]" />
      </span>
    );
  }

  return <HumanHead src={faceUrl} smashed={smashed} />;
}

function WhackBurst({
  burst,
  reduceMotion,
}: {
  burst: Burst;
  reduceMotion: boolean;
}) {
  const isHit = burst.kind !== "miss";
  const isSacred = burst.kind === "sacred";
  const isApology = burst.kind === "apology";

  return (
    <motion.div
      className="pointer-events-none absolute z-30"
      style={{ left: burst.x, top: burst.y }}
      initial={{ opacity: 0, scale: 0.4, x: "-50%", y: "-50%" }}
      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
      exit={{ opacity: 0, scale: 1.15 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
    >
      {isHit && !reduceMotion && (
        <motion.span
          className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#8a5a38]/50 sm:size-24"
          initial={{ scale: 0.2, opacity: 0.7 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}

      {isHit && (
        <>
          <motion.span
            initial={reduceMotion ? false : { scale: 0.6 }}
            animate={{ scale: 1 }}
            className="relative z-10 block text-center font-display text-[clamp(1.1rem,4vw,1.7rem)] font-black tracking-wide whitespace-nowrap"
            style={{
              color: isSacred ? "#F2596F" : isApology ? "#C97A18" : "#C21830",
              WebkitTextStroke: "2px #fff",
              textShadow: "0 2px 0 rgba(58,42,37,0.18)",
            }}
          >
            {isSacred ? "OOPS" : isApology ? "SORRY" : "WHACK"}
          </motion.span>
          {!reduceMotion &&
            Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const dist = 18 + (i % 3) * 10;
              return (
                <motion.span
                  key={i}
                  className={cn(
                    "absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                    isApology ? "bg-[#F0A13D]" : "bg-[#c4a484]",
                  )}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(a) * dist,
                    y: Math.sin(a) * dist,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              );
            })}
        </>
      )}
    </motion.div>
  );
}
