"use client";

import { motion } from "framer-motion";

import type { SceneTokens, TreasureTheme } from "../config";

/**
 * The keepsake spread the album rests in — the ambient collage that turns a lone
 * card on a plain wash into a life's worth of memorabilia laid out on linen:
 * faded prints scattered at the edges, a pulled "PHOTO" tab, a pressed leaf, a
 * postage stamp, pencilled marginalia, and a few dust motes drifting through the
 * light. Purely atmospheric — `pointer-events-none`, `aria-hidden`, tucked
 * behind the album, thinned out on small screens so it never crowds the hero.
 * Themed off the scene tokens so it re-tints with every leather finish.
 */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** A faded old print — cream mount, a sepia scene, a strip of tape, a tilt. */
function VintagePhoto({
  theme,
  tone,
  width = 150,
  caption,
  tape = true,
  className = "",
  rotate = 0,
}: {
  theme: TreasureTheme;
  /** Two-stop sepia scene suggestion (sky → ground). */
  tone: [string, string];
  width?: number;
  caption?: string;
  tape?: boolean;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ width, transform: `rotate(${rotate}deg)` }}
    >
      <div
        className="relative rounded-[3px] p-2 pb-2.5"
        style={{
          background: theme.paper,
          boxShadow:
            "0 20px 30px -20px rgba(20,12,4,0.55), 0 2px 6px -3px rgba(0,0,0,0.3)",
        }}
      >
        {tape && (
          <span
            className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-2 rounded-[1px]"
            style={{
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.5), rgba(228,220,202,0.38))",
            }}
          />
        )}
        <div
          className="relative overflow-hidden rounded-[2px]"
          style={{
            aspectRatio: "5 / 4",
            background: `linear-gradient(170deg, ${tone[0]} 0%, ${tone[1]} 100%)`,
          }}
        >
          {/* a faint horizon + sun bloom, so it reads as an old landscape */}
          <span
            className="absolute inset-x-0 top-[46%] h-px"
            style={{ background: "rgba(60,40,20,0.18)" }}
          />
          <span
            className="absolute top-[20%] right-[20%] size-6 rounded-full blur-md"
            style={{ background: "rgba(255,244,214,0.55)" }}
          />
          <span
            className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
            style={{ backgroundImage: GRAIN }}
          />
          <span
            className="absolute inset-0"
            style={{ boxShadow: "inset 0 0 22px rgba(40,24,10,0.35)" }}
          />
        </div>
        {caption && (
          <p
            className="font-hand mt-1 text-center text-[13px] leading-none"
            style={{ color: theme.ink, opacity: 0.6 }}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}

/** A scrap of pencilled marginalia. */
function Doodle({
  children,
  className = "",
  theme,
  rotate = 0,
  cursive = false,
  size = 20,
}: {
  children: React.ReactNode;
  className?: string;
  theme: TreasureTheme;
  rotate?: number;
  cursive?: boolean;
  size?: number;
}) {
  return (
    <span
      className={`absolute ${cursive ? "font-cursive" : "font-hand"} ${className}`}
      style={{
        color: theme.ink,
        opacity: 0.34,
        transform: `rotate(${rotate}deg)`,
        fontSize: size,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

/** A themed line-art frame — children draw with `currentColor`. */
function LineArt({
  children,
  className = "",
  color,
  rotate = 0,
  opacity = 0.4,
  size = 60,
  vb = 64,
}: {
  children: React.ReactNode;
  className?: string;
  color: string;
  rotate?: number;
  opacity?: number;
  size?: number;
  vb?: number;
}) {
  return (
    <svg
      className={`absolute ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill="none"
      style={{ transform: `rotate(${rotate}deg)`, opacity, color }}
    >
      {children}
    </svg>
  );
}

/** A little sun with rays. */
function Sun() {
  return (
    <>
      <circle cx="32" cy="32" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={32 + 13 * Math.cos(a)}
            y1={32 + 13 * Math.sin(a)}
            x2={32 + 19 * Math.cos(a)}
            y2={32 + 19 * Math.sin(a)}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

/** Concentric rings. */
function Rings() {
  return (
    <>
      {[8, 15, 22].map((r) => (
        <circle
          key={r}
          cx="32"
          cy="32"
          r={r}
          stroke="currentColor"
          strokeWidth="1.2"
        />
      ))}
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </>
  );
}

/** A nested-arch rainbow. */
function Arches() {
  return (
    <>
      {[26, 19, 12].map((r) => (
        <path
          key={r}
          d={`M ${32 - r} 40 A ${r} ${r} 0 0 1 ${32 + r} 40`}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

/** A small grid of dots. */
function DotGrid() {
  const pts: number[] = [12, 24, 36, 48];
  return (
    <>
      {pts.map((y) =>
        pts.map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="currentColor" />
        )),
      )}
    </>
  );
}

/** A four-point sparkle. */
function Sparkle() {
  return (
    <path
      d="M32 8 C34 24 40 30 56 32 C40 34 34 40 32 56 C30 40 24 34 8 32 C24 30 30 24 32 8 Z"
      fill="currentColor"
    />
  );
}

/** A drifting squiggle. */
function Wave() {
  return (
    <path
      d="M4 40 C14 24 22 56 32 40 C42 24 50 56 60 40"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  );
}

/** A eucalyptus sprig — round leaves paired along a curved stem. */
function Eucalyptus() {
  return (
    <>
      <path
        d="M32 92 C30 64 34 34 32 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 20 + i * 13;
        return (
          <g key={i}>
            <ellipse
              cx="20"
              cy={y}
              rx="8"
              ry="5"
              fill="currentColor"
              opacity="0.55"
              transform={`rotate(-24 20 ${y})`}
            />
            <ellipse
              cx="44"
              cy={y + 6}
              rx="8"
              ry="5"
              fill="currentColor"
              opacity="0.55"
              transform={`rotate(24 44 ${y + 6})`}
            />
          </g>
        );
      })}
    </>
  );
}

/** A fern frond — angled leaflets up a spine. */
function Fern() {
  return (
    <>
      <path
        d="M32 94 C32 60 32 30 32 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {Array.from({ length: 8 }).map((_, i) => {
        const y = 14 + i * 10;
        const len = 8 + (8 - i);
        return (
          <g key={i}>
            <line
              x1="32"
              y1={y}
              x2={32 - len}
              y2={y - 6}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="32"
              y1={y + 3}
              x2={32 + len}
              y2={y - 3}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </>
  );
}

export function SceneDecor({
  theme,
  scene,
  reduceMotion,
}: {
  theme: TreasureTheme;
  scene: SceneTokens;
  reduceMotion: boolean | null;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden"
    >
      {/* warm key-light pouring in from the top, catching the album */}
      <div
        className="absolute -top-[10%] left-1/2 h-[46%] w-[80%] -translate-x-1/2 blur-3xl"
        style={{ background: scene.leatherSheen, opacity: 0.5 }}
      />

      {/* ── scattered prints ──────────────────────────────────────────── */}
      <VintagePhoto
        theme={theme}
        tone={["#d8c199", "#a17e4f"]}
        width={168}
        rotate={-9}
        caption="summer '23"
        className="top-[9%] left-[-3%] hidden blur-[0.5px] lg:block"
      />
      <VintagePhoto
        theme={theme}
        tone={["#cdd4d0", "#8a7c63"]}
        width={128}
        rotate={6}
        className="top-[30%] left-[4%] hidden opacity-90 blur-[1px] xl:block"
      />
      <VintagePhoto
        theme={theme}
        tone={["#e0c9a6", "#9c7b52"]}
        width={158}
        rotate={8}
        caption="the two of us"
        className="right-[-3%] bottom-[12%] hidden blur-[0.5px] lg:block"
      />
      <VintagePhoto
        theme={theme}
        tone={["#d3bfa0", "#8f7350"]}
        width={120}
        rotate={-6}
        tape={false}
        className="right-[5%] top-[13%] hidden opacity-90 blur-[1px] xl:block"
      />

      {/* ── the pulled "PHOTO" tab, top-right ─────────────────────────── */}
      <div
        className="absolute top-[6%] right-[8%] hidden md:block"
        style={{ transform: "rotate(4deg)" }}
      >
        <div
          className="relative flex h-9 w-24 items-center justify-center rounded-sm"
          style={{
            background: theme.paper,
            boxShadow: "0 12px 20px -12px rgba(20,12,4,0.5)",
          }}
        >
          <span
            className="absolute -top-1.5 left-1/2 h-3 w-10 -translate-x-1/2 rounded-[1px]"
            style={{
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.5), rgba(228,220,202,0.4))",
            }}
          />
          <span
            className="text-[11px] font-semibold tracking-[0.42em]"
            style={{ color: theme.ink, opacity: 0.55 }}
          >
            PHOTO
          </span>
        </div>
      </div>

      {/* ── postage stamp, bottom-left ────────────────────────────────── */}
      <div
        className="absolute bottom-[16%] left-[7%] hidden lg:block"
        style={{ transform: "rotate(-7deg)" }}
      >
        <div
          className="grid size-14 place-items-center rounded-[2px] p-1"
          style={{
            background: theme.paper,
            boxShadow: "0 10px 18px -12px rgba(20,12,4,0.5)",
            // perforated edge
            WebkitMaskImage:
              "radial-gradient(circle 3px at 0 50%, transparent 3px, #000 3px), radial-gradient(circle 3px at 100% 50%, transparent 3px, #000 3px)",
          }}
        >
          <div
            className="grid size-full place-items-center rounded-[1px]"
            style={{
              border: `1px solid ${scene.foil}`,
              background: `${theme.accent}14`,
            }}
          >
            <span
              className="font-cursive text-lg"
              style={{ color: theme.accent, opacity: 0.75 }}
            >
              ♡
            </span>
          </div>
        </div>
      </div>

      {/* ── pressed sprig, bottom-right ───────────────────────────────── */}
      <svg
        className="absolute right-[10%] bottom-[7%] hidden h-24 w-16 lg:block"
        viewBox="0 0 64 96"
        fill="none"
        style={{ transform: "rotate(8deg)", opacity: 0.4 }}
      >
        <path
          d="M32 92 C32 60 30 36 32 6"
          stroke={theme.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {Array.from({ length: 6 }).map((_, i) => {
          const y = 20 + i * 11;
          return (
            <g key={i}>
              <path
                d={`M32 ${y} C20 ${y - 8} 12 ${y - 4} 8 ${y + 2} C16 ${y + 6} 26 ${y + 4} 32 ${y}`}
                fill={theme.accent}
                opacity={0.5}
              />
              <path
                d={`M32 ${y} C44 ${y - 8} 52 ${y - 4} 56 ${y + 2} C48 ${y + 6} 38 ${y + 4} 32 ${y}`}
                fill={theme.accent}
                opacity={0.5}
              />
            </g>
          );
        })}
      </svg>

      {/* ── pencilled marginalia ──────────────────────────────────────── */}
      <Doodle
        theme={theme}
        className="top-[20%] right-[26%] hidden sm:block"
        rotate={-8}
        cursive
        size={26}
      >
        keep forever
      </Doodle>
      <Doodle
        theme={theme}
        className="bottom-[24%] left-[24%] hidden sm:block"
        rotate={6}
        size={22}
      >
        est. MMXXIV
      </Doodle>
      <Doodle
        theme={theme}
        className="top-[42%] right-[7%] hidden lg:block"
        rotate={12}
        size={30}
      >
        ♡
      </Doodle>
      <Doodle
        theme={theme}
        className="bottom-[40%] left-[16%] hidden lg:block"
        rotate={-18}
        size={30}
      >
        ↝
      </Doodle>
      <Doodle
        theme={theme}
        className="top-[62%] left-[9%] hidden xl:block"
        rotate={-7}
        cursive
        size={24}
      >
        the good days
      </Doodle>
      <Doodle
        theme={theme}
        className="top-[8%] left-[30%] hidden lg:block"
        rotate={9}
        size={26}
      >
        us ✦
      </Doodle>

      {/* ── geometric line-art ────────────────────────────────────────── */}
      <LineArt
        className="top-[15%] left-[20%] hidden lg:block"
        color={theme.accent}
        rotate={-6}
        size={52}
      >
        <Sun />
      </LineArt>
      <LineArt
        className="top-[24%] right-[15%] hidden xl:block"
        color={theme.accent}
        opacity={0.32}
        size={56}
      >
        <Rings />
      </LineArt>
      <LineArt
        className="bottom-[10%] left-[30%] hidden lg:block"
        color={theme.accent}
        opacity={0.38}
        size={58}
      >
        <Arches />
      </LineArt>
      <LineArt
        className="top-[52%] left-[6%] hidden xl:block"
        color={theme.ink}
        opacity={0.26}
        size={46}
      >
        <DotGrid />
      </LineArt>
      <LineArt
        className="bottom-[30%] right-[10%] hidden lg:block"
        color={theme.ink}
        opacity={0.3}
        rotate={8}
        size={54}
      >
        <Wave />
      </LineArt>
      <LineArt
        className="top-[10%] right-[30%] hidden md:block"
        color={theme.accent}
        opacity={0.5}
        size={22}
      >
        <Sparkle />
      </LineArt>
      <LineArt
        className="bottom-[46%] right-[22%] hidden lg:block"
        color={theme.accent}
        opacity={0.45}
        rotate={12}
        size={16}
      >
        <Sparkle />
      </LineArt>
      <LineArt
        className="bottom-[54%] left-[34%] hidden xl:block"
        color={theme.accent}
        opacity={0.4}
        size={14}
      >
        <Sparkle />
      </LineArt>

      {/* ── botanicals ────────────────────────────────────────────────── */}
      <LineArt
        className="top-[30%] left-[2%] hidden lg:block"
        color={theme.accent}
        opacity={0.42}
        rotate={-12}
        size={80}
        vb={96}
      >
        <Eucalyptus />
      </LineArt>
      <LineArt
        className="top-[40%] right-[3%] hidden xl:block"
        color={theme.accent}
        opacity={0.4}
        rotate={14}
        size={80}
        vb={96}
      >
        <Fern />
      </LineArt>

      {/* ── dust motes drifting through the light ─────────────────────── */}
      {!reduceMotion &&
        MOTES.map((m, i) => (
          <motion.span
            key={i}
            className="absolute hidden rounded-full sm:block"
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              background: scene.foil,
              opacity: 0.35,
              filter: "blur(0.5px)",
            }}
            animate={{
              y: [0, -22, 4, 0],
              x: [0, 10, -6, 0],
              opacity: [0.12, 0.4, 0.2, 0.12],
            }}
            transition={{
              duration: m.dur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: m.delay,
            }}
          />
        ))}
    </div>
  );
}

/** Fixed mote layout — no Math.random (keeps SSR + resume deterministic). */
const MOTES = [
  { left: "18%", top: "26%", size: 4, dur: 11, delay: 0 },
  { left: "72%", top: "20%", size: 3, dur: 13, delay: 1.5 },
  { left: "40%", top: "62%", size: 5, dur: 12, delay: 0.8 },
  { left: "84%", top: "54%", size: 3, dur: 14, delay: 2.2 },
  { left: "30%", top: "78%", size: 4, dur: 10, delay: 1.1 },
  { left: "60%", top: "40%", size: 3, dur: 15, delay: 3 },
];
