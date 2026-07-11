"use client";

import { useReducedMotion } from "framer-motion";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";

import { playFlipSound } from "@/features/scrapbook/components/viewer/flip-sound";
import { cn } from "@/lib/utils";

import { sampleAlbum } from "../../data/sample";
import { type AmbientMusic, createAmbientMusic } from "../../lib/ambient-music";
import { packPages } from "../../lib/paginate";
import type { MemoryPagesDoc, ResolveAuthor, ResolvePhoto } from "../../types";
import { MemoryPage } from "../memory-page";

const PAGE_W = 460;
const PAGE_H = 620;
const SPREAD_AR = (2 * PAGE_W) / PAGE_H;
const PORTRAIT_AR = PAGE_W / PAGE_H;
const H_BUDGET = "(100svh - 11rem)";
const FLIP_MS = 900;

type FlipApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
    getPageCount: () => number;
  };
};

type LeafKind = "cover" | "page" | "filler" | "back";
type Leaf = { render: () => ReactNode; label: string; kind: LeafKind };

/** Build the album as a flat list of leaves: cover · pages · (filler) · back. */
function buildAlbum(
  doc: MemoryPagesDoc,
  resolvePhoto: ResolvePhoto,
  resolveAuthor: ResolveAuthor,
): Leaf[] {
  const leaves: Leaf[] = [];

  leaves.push({
    kind: "cover",
    label: "Cover",
    render: () => <AlbumCover doc={doc} resolvePhoto={resolvePhoto} />,
  });

  // Re-arrange from the flat memory list so long write-ups get their own leaf
  // and existing albums pick up the improved layout without needing a re-save.
  const memories = doc.pages.flatMap((p) => p.entries);
  const surface = doc.pages[0]?.theme ?? "paper";
  const pages = packPages(memories, surface);

  const start = leaves.length;
  pages.forEach((page, i) => {
    const leafIdx = start + i;
    leaves.push({
      kind: "page",
      label: page.entries[0]?.title || `Page ${i + 1}`,
      render: () => (
        <MemoryPage
          page={page}
          pageNumber={i + 1}
          side={leafIdx % 2 === 1 ? "left" : "right"}
          resolvePhoto={resolvePhoto}
          resolveAuthor={resolveAuthor}
        />
      ),
    });
  });

  // The back cover must land alone (single hard page) → needs an even total.
  if ((leaves.length + 1) % 2 !== 0) {
    leaves.push({
      kind: "filler",
      label: "",
      render: () => <div className="kyndl-mp-leaf h-full w-full" />,
    });
  }

  leaves.push({
    kind: "back",
    label: "The end",
    // Carries its own shadow, like the front cover — so the book-level shadow can
    // be dropped when closed at the end and the empty facing page stays
    // transparent (rather than showing a shadowed "board").
    render: () => (
      <div
        className="kyndl-mp-cover kyndl-book-shadow flex h-full w-full items-center justify-center"
        style={doc.coverColor ? { backgroundColor: doc.coverColor } : undefined}
      >
        <p className="font-cursive text-3xl text-[#4a3526]/85">the end</p>
      </div>
    ),
  });

  return leaves;
}

/** Gold geometric ornament for the cover board (double frame, art-deco corners,
 *  centre flourishes), authored in the leaf design units (460×620). */
function CoverFrame() {
  const corners: [number, number][] = [
    [30, 30],
    [430, 30],
    [30, 590],
    [430, 590],
  ];
  return (
    <svg
      viewBox="0 0 460 620"
      aria-hidden
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      fill="none"
      stroke="#fbf3e2"
    >
      <rect
        x="30"
        y="30"
        width="400"
        height="560"
        strokeWidth="1.4"
        opacity="0.7"
      />
      <rect
        x="38"
        y="38"
        width="384"
        height="544"
        strokeWidth="0.7"
        opacity="0.5"
      />
      {corners.map(([cx, cy], i) => {
        const sx = cx < 230 ? 1 : -1;
        const sy = cy < 310 ? 1 : -1;
        return (
          <g key={i} opacity="0.85">
            <path
              d={`M${cx + sx * 26} ${cy} L${cx} ${cy} L${cx} ${cy + sy * 26}`}
              strokeWidth="1.2"
            />
            <path
              d={`M${cx + sx * 14} ${cy + sy * 6} L${cx + sx * 6} ${cy + sy * 14}`}
              strokeWidth="0.8"
            />
            <rect
              x={cx - 4}
              y={cy - 4}
              width="8"
              height="8"
              strokeWidth="1"
              transform={`rotate(45 ${cx} ${cy})`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** A small gilt divider: a line with a centred diamond and end dots. */
function Flourish() {
  return (
    <svg
      viewBox="0 0 160 14"
      aria-hidden
      className="h-3 w-36 text-[#fbf3e2]"
      fill="none"
      stroke="currentColor"
    >
      <line x1="6" y1="7" x2="66" y2="7" strokeWidth="1" opacity="0.75" />
      <line x1="94" y1="7" x2="154" y2="7" strokeWidth="1" opacity="0.75" />
      <path
        d="M80 1 l6 6 -6 6 -6 -6 z"
        strokeWidth="1"
        fill="#fbf3e2"
        fillOpacity="0.55"
      />
      <circle cx="6" cy="7" r="1.5" fill="#fbf3e2" stroke="none" />
      <circle cx="154" cy="7" r="1.5" fill="#fbf3e2" stroke="none" />
    </svg>
  );
}

/** The leather-bound front cover board: gilt frame, script title, cover photo. */
function AlbumCover({
  doc,
  resolvePhoto,
}: {
  doc: MemoryPagesDoc;
  resolvePhoto: ResolvePhoto;
}) {
  const cover = resolvePhoto(doc.coverPhoto?.fileId);
  return (
    <div
      className="kyndl-mp-cover kyndl-book-shadow relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden px-12 text-center"
      style={doc.coverColor ? { backgroundColor: doc.coverColor } : undefined}
    >
      <CoverFrame />

      <div className="relative z-[2] flex flex-col items-center gap-4">
        <p className="font-serif text-[11px] tracking-[0.42em] text-[#fbf3e2]/90 uppercase">
          a keepsake
        </p>
        <Flourish />

        {cover && (
          <div className="bg-[#fdfaf1] p-2 shadow-[0_14px_30px_-14px_rgba(80,52,25,0.55)]">
            <div className="border border-[#c2a266] p-[3px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- presigned/object URL */}
              <img
                src={cover}
                alt=""
                className="aspect-square w-[150px] object-cover"
              />
            </div>
          </div>
        )}

        <h2
          className="font-cursive text-[3.1rem] leading-tight text-[#4a3526]"
          style={{ textShadow: "0 1px 0 rgba(255,248,236,0.35)" }}
        >
          {doc.title}
        </h2>
        {doc.subtitle && (
          <p className="-mt-1 font-serif text-sm text-[#5b4233]/90 italic">
            {doc.subtitle}
          </p>
        )}
        <Flourish />
      </div>
    </div>
  );
}

/**
 * The audience-facing album viewer. Turns leaves with react-pageflip, the same
 * engine the scrapbook uses, with a reduced-motion stacked fallback.
 */
export function AlbumViewer({
  doc = sampleAlbum,
  assets = {},
  authors = {},
  autoPlay = false,
  fit = "viewport",
  frame = false,
  goToLeaf = null,
}: {
  doc?: MemoryPagesDoc;
  assets?: Record<string, string>;
  /** `authorId → display name` map so each memory can show who added it. */
  authors?: Record<string, string>;
  /** Turn pages on their own; pauses while the reader hovers/focuses it. */
  autoPlay?: boolean;
  /** "viewport" sizes the book to the screen; "container" fits it to its
   *  parent so it can sit in a side-by-side column. */
  fit?: "viewport" | "container";
  /** Off by default: the book floats directly on the page (no caramel desk),
   *  keeping viewport sizing and its own drop-shadow. Pass `frame` to bring the
   *  leather desk back for a deliberately staged, standalone presentation. */
  frame?: boolean;
  /** When set, the book turns to this leaf index once ready and whenever it
   *  changes — used by the builder to reveal a just-added memory's page. */
  goToLeaf?: number | null;
}) {
  const reduceMotion = useReducedMotion();
  const bookRef = useRef<FlipApi>(null);
  const lastState = useRef<string>("read");
  // True while the *current* flip was started by autoplay, so we can keep those
  // page-turns silent (a book turning itself shouldn't click every few seconds).
  const autoFlipRef = useRef(false);

  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  // Reader-controlled playback options.
  const [autoOn, setAutoOn] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  // Read from inside the flip callback (which is memoised) without restaling it.
  const mutedRef = useRef(false);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const resolvePhoto = useCallback<ResolvePhoto>(
    (fileId) => (fileId ? (assets[fileId] ?? null) : null),
    [assets],
  );
  const resolveAuthor = useCallback<ResolveAuthor>(
    // A blank authorId means the owner, keyed under "" in the map.
    (authorId) => authors[authorId ?? ""] ?? null,
    [authors],
  );

  const leaves = useMemo(
    () => buildAlbum(doc, resolvePhoto, resolveAuthor),
    [doc, resolvePhoto, resolveAuthor],
  );
  const lastIndex = leaves.length - 1;
  const onCover = page === 0;
  const onBack = page === lastIndex;

  const flip = useCallback(
    (fn: (api: ReturnType<FlipApi["pageFlip"]>) => void) => {
      const api = bookRef.current?.pageFlip();
      if (api) fn(api);
    },
    [],
  );
  const goNext = useCallback(() => flip((a) => a.flipNext()), [flip]);
  const goPrev = useCallback(() => flip((a) => a.flipPrev()), [flip]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // ── autoplay: gently turn pages on their own ──
  // Re-armed on every page change so the timer always starts fresh after a flip
  // (manual or automatic). Pauses while hovered/focused so a reader can catch
  // up, and loops back to the cover once it reaches the end.
  useEffect(() => {
    if (!autoOn || !ready || reduceMotion || paused) return;
    const id = window.setTimeout(
      () => {
        autoFlipRef.current = true; // silence this self-initiated turn
        flip((a) => (page >= lastIndex ? a.turnToPage(0) : a.flipNext()));
      },
      page === 0 ? 1600 : 3400,
    );
    return () => window.clearTimeout(id);
  }, [autoOn, ready, reduceMotion, paused, page, lastIndex, flip]);

  // ── soft background music ──
  // Synthesised in-app (no asset). Created once; disposed on unmount.
  const musicRef = useRef<AmbientMusic | null>(null);
  const musicTouched = useRef(false); // did the reader toggle it themselves?
  const opened = useRef(false);
  useEffect(() => {
    musicRef.current = createAmbientMusic();
    return () => musicRef.current?.dispose();
  }, []);

  const toggleMusic = useCallback(() => {
    musicTouched.current = true;
    setMusicOn((on) => {
      if (on) musicRef.current?.stop();
      else musicRef.current?.start();
      return !on;
    });
  }, []);

  // Builder-driven: reveal a specific leaf (e.g. a just-added memory's page).
  useEffect(() => {
    if (goToLeaf == null || !ready || reduceMotion) return;
    flip((a) => {
      const count = a.getPageCount();
      a.turnToPage(Math.max(0, Math.min(goToLeaf, count - 1)));
    });
  }, [goToLeaf, ready, reduceMotion, flip]);

  const onChangeState = useCallback(
    (e: { data: string }) => {
      if (e.data === "flipping") {
        // The first flip is the reader opening the album — a real user gesture,
        // so start the soft music here (browsers block audio that starts on its
        // own) unless they've already toggled it off themselves.
        if (!opened.current) {
          opened.current = true;
          if (!musicTouched.current) {
            musicRef.current?.start();
            setMusicOn(true);
          }
        }
        if (
          lastState.current !== "flipping" &&
          !reduceMotion &&
          !mutedRef.current && // reader muted the page-turn sound
          !autoFlipRef.current // stay silent for autoplay's own page-turns
        ) {
          playFlipSound();
        }
      }
      // Once the turn settles, clear the autoplay flag so a following manual
      // flip clicks as usual.
      if (e.data !== "flipping") autoFlipRef.current = false;
      lastState.current = e.data;
    },
    [reduceMotion],
  );

  // ── reduced motion: simple stacked reader ──
  if (reduceMotion) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6">
        {leaves
          .filter((l) => l.kind !== "filler")
          .map((leaf, i) => (
            <div
              key={i}
              className="aspect-[460/620] overflow-hidden rounded-lg border border-[#f2dace] shadow-sm"
            >
              {leaf.render()}
            </div>
          ))}
      </div>
    );
  }

  const container = fit === "container";
  // The leather desk only shows in framed viewport mode; the container variant
  // and the explicitly frameless viewer both sit straight on the page.
  const showDesk = !container && frame;
  // Only narrow screens fall back to a single portrait page; the container
  // (side-by-side) variant keeps the full two-page spread, just smaller.
  const portrait = isMobile;
  const bookWidth = container
    ? "100%"
    : isMobile
      ? `min(94vw, calc(${H_BUDGET} * ${PORTRAIT_AR.toFixed(4)}))`
      : `min(96vw, calc(${H_BUDGET} * ${SPREAD_AR.toFixed(4)}))`;

  const label = onCover
    ? "Cover"
    : onBack
      ? "The end"
      : leaves[page]?.label || leaves[page - 1]?.label || "";

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className={cn(
          "relative flex w-full items-center justify-center",
          // The container (side-by-side) variant and the frameless viewer sit
          // straight on the page; only the framed viewer keeps its leather desk.
          showDesk
            ? "kyndl-mp-leather max-w-[1200px] overflow-hidden rounded-[24px] px-3 py-6 sm:px-6"
            : "max-w-full",
        )}
        style={{ perspective: "2600px" }}
        onMouseEnter={autoOn ? () => setPaused(true) : undefined}
        onMouseLeave={autoOn ? () => setPaused(false) : undefined}
        onFocusCapture={autoOn ? () => setPaused(true) : undefined}
        onBlurCapture={autoOn ? () => setPaused(false) : undefined}
      >
        {showDesk && (
          <span
            aria-hidden
            className="kyndl-grain pointer-events-none absolute inset-0 rounded-[24px] opacity-25"
          />
        )}
        {!ready && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <p className="animate-pulse font-cursive text-2xl text-[#5b3d28]">
              opening the album…
            </p>
          </div>
        )}

        <div style={{ width: bookWidth }}>
          <HTMLFlipBook
            key={portrait ? "portrait" : "spread"}
            ref={bookRef}
            // In the frameless demo the drop shadow lives on each page instead
            // of the whole book box — otherwise the book's shadow is cast under
            // the empty half beside a closed cover, reading as a blank board.
            // Dropped on both the front and back cover (each carries its own
            // shadow) so their empty facing page stays transparent.
            className={cn(
              "kyndl-book",
              !container && !onCover && !onBack && "kyndl-book-shadow",
            )}
            style={{}}
            width={PAGE_W}
            height={PAGE_H}
            minWidth={container ? 200 : 280}
            maxWidth={container ? 460 : 760}
            minHeight={container ? 270 : 380}
            maxHeight={container ? 640 : 1000}
            size="stretch"
            drawShadow
            maxShadowOpacity={0.5}
            flippingTime={FLIP_MS}
            showCover
            usePortrait={portrait}
            mobileScrollSupport
            showPageCorners
            startZIndex={20}
            autoSize
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            startPage={0}
            disableFlipByClick={false}
            onInit={() => setReady(true)}
            onFlip={(e: { data: number }) => setPage(e.data)}
            onChangeState={onChangeState}
          >
            {leaves.map((leaf, i) => (
              <div
                className={cn(
                  "h-full w-full",
                  // Per-page shadow only in the frameless demo; cover/back carry
                  // their own, so shadow never falls on an empty facing page.
                  container && leaf.kind === "page" && "kyndl-book-shadow",
                )}
                key={`leaf-${i}`}
              >
                {leaf.render()}
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {ready && onCover && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 animate-pulse font-hand text-sm text-[#6b4a2e]/80">
            tap the cover to open →
          </div>
        )}
      </div>

      {/* control bar */}
      <div className="mt-4 flex items-center justify-center gap-1 rounded-full border border-[#F2DACE] bg-white/80 px-2 py-1.5 backdrop-blur">
        <Ctrl label="Previous" onClick={goPrev} disabled={onCover}>
          ‹
        </Ctrl>
        <p className="min-w-20 px-1 text-center font-hand text-sm leading-none text-[#C75B39]">
          {label}
        </p>
        <Ctrl label="Next" onClick={goNext} disabled={onBack}>
          ›
        </Ctrl>

        <span className="mx-1 h-5 w-px bg-[#f0dccb]" aria-hidden />

        <Toggle
          label={autoOn ? "Stop auto-play" : "Auto-play the album"}
          active={autoOn}
          onClick={() => setAutoOn((v) => !v)}
        >
          {autoOn ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Toggle>
        <Toggle
          label={muted ? "Unmute page-turn sound" : "Mute page-turn sound"}
          active={!muted}
          onClick={() => setMuted((v) => !v)}
        >
          {muted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </Toggle>
        <Toggle
          label={musicOn ? "Turn off music" : "Play soft music"}
          active={musicOn}
          onClick={toggleMusic}
        >
          <Music className={cn("size-4", musicOn && "animate-pulse")} />
        </Toggle>
      </div>
    </div>
  );
}

/** A control-bar toggle button that reads its on/off state visually. */
function Toggle({
  children,
  onClick,
  active,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-colors",
        active
          ? "bg-[#FFEDE2] text-[#C75B39]"
          : "text-[#7A6258] hover:bg-[#FFF7F1] hover:text-[#3A2A25]",
      )}
    >
      {children}
    </button>
  );
}

function Ctrl({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-lg transition-colors",
        "text-[#7A6258] hover:bg-[#FFF7F1] hover:text-[#3A2A25]",
        disabled && "cursor-not-allowed opacity-30 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}
