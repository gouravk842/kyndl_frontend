"use client";

import { useReducedMotion } from "framer-motion";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";

import { cn } from "@/lib/utils";

import { story as defaultStory } from "../../data/story";
import type { ScrapbookStory } from "../../types";
import { BookCover } from "../book-cover";
import { FlyLeaf, type IndexEntry, IndexPage } from "../index-page";
import { ScrapbookPage } from "../scrapbook-page";
import { playFlipSound } from "./flip-sound";

const PAGE_W = 460;
const PAGE_H = 620;
const SPREAD_AR = (2 * PAGE_W) / PAGE_H;
const PORTRAIT_AR = PAGE_W / PAGE_H;
const ZOOM_LEVELS = [1, 1.5, 2.2];
const H_BUDGET = "(100svh - 13rem)";
const H_BUDGET_MOBILE = "(100svh - 11rem)";
const FLIP_MS = 1000;

type FlipApi = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
    getPageCount: () => number;
  };
};

type LeafKind = "cover" | "fly" | "index" | "page" | "filler" | "back";
type Leaf = {
  render: (entries: IndexEntry[]) => ReactNode;
  label: string;
  kind: LeafKind;
};

type BuiltBook = { leaves: Leaf[]; entries: IndexEntry[]; lastIndex: number };

/**
 * Assemble the whole book as one flat list of leaves so react-pageflip owns the
 * entire 3D object — hard front/back covers included. With `showCover`, leaf 0
 * and the last leaf are marked hard and shown single, so the book sits closed
 * and the covers swing open/shut as one continuous native flip.
 *
 * Order: front cover · flyleaf · Contents · story pages · closing flyleaf ·
 * (filler so the back cover lands alone) · back cover.
 */
function buildBook(story: ScrapbookStory): BuiltBook {
  const leaves: Leaf[] = [];

  leaves.push({
    kind: "cover",
    label: "Cover",
    render: () => (
      <BookCover
        variant="front"
        title={story.title}
        subtitle={story.subtitle}
        dedication={story.dedication}
        coverPhoto={story.coverPhoto}
        coverColor={story.coverColor}
      />
    ),
  });
  leaves.push({ kind: "fly", label: "", render: () => <FlyLeaf /> });
  // Contents leaf — rendered specially by the viewer so its rows get a live
  // jump handler. The placeholder render here is never used.
  leaves.push({ kind: "index", label: "Contents", render: () => null });

  const storyStart = leaves.length;
  story.pages.forEach((p, i) => {
    const leafIdx = storyStart + i;
    leaves.push({
      kind: "page",
      label: p.heading || p.chapter,
      render: () => (
        <ScrapbookPage
          page={p}
          pageNumber={i + 1}
          side={leafIdx % 2 === 1 ? "left" : "right"}
        />
      ),
    });
  });

  const entries: IndexEntry[] = story.pages.map((p, i) => ({
    label: p.heading || p.chapter,
    number: i + 1,
    leaf: storyStart + i,
  }));

  leaves.push({
    kind: "fly",
    label: "",
    render: () => (
      <FlyLeaf title="the end" caption="thank you for turning every page" />
    ),
  });

  // The back cover must land alone (single hard page) → needs an even total.
  if ((leaves.length + 1) % 2 !== 0) {
    leaves.push({
      kind: "filler",
      label: "",
      render: () => <div className="kyndl-paper h-full w-full" />,
    });
  }

  leaves.push({ kind: "back", label: "The end", render: () => null });

  return { leaves, entries, lastIndex: leaves.length - 1 };
}

export function BookViewer({
  story = defaultStory,
}: {
  story?: ScrapbookStory;
}) {
  const reduceMotion = useReducedMotion();

  const bookRef = useRef<FlipApi>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastState = useRef<string>("read");

  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panel, setPanel] = useState<"none" | "thumbs" | "toc">("none");

  const zoom = ZOOM_LEVELS[zoomIdx]!;
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  const built = useMemo(() => buildBook(story), [story]);
  const { leaves, entries, lastIndex } = built;

  const onCover = page === 0;
  const onBack = page === lastIndex;
  const single = onCover || onBack;

  const flip = useCallback(
    (fn: (api: ReturnType<FlipApi["pageFlip"]>) => void) => {
      const api = bookRef.current?.pageFlip();
      if (api) fn(api);
    },
    [],
  );

  const closeBook = useCallback(() => {
    flip((a) => a.turnToPage(0));
    setZoomIdx(0);
    setPan({ x: 0, y: 0 });
  }, [flip]);

  const jumpToPage = useCallback(
    (p: number) => {
      flip((a) => a.turnToPage(p));
      setPanel("none");
    },
    [flip],
  );

  const renderLeaf = useCallback(
    (leaf: Leaf, idx: number): ReactNode => {
      let inner: ReactNode;
      if (leaf.kind === "index") {
        inner = (
          <IndexPage
            entries={entries}
            onJump={jumpToPage}
            side={idx % 2 === 1 ? "left" : "right"}
          />
        );
      } else if (leaf.kind === "back") {
        inner = (
          <BookCover
            variant="back"
            coverColor={story.coverColor}
            onClose={closeBook}
          />
        );
      } else {
        inner = leaf.render(entries);
      }
      return (
        <div className="h-full w-full" key={`leaf-${idx}`}>
          {inner}
        </div>
      );
    },
    [entries, jumpToPage, closeBook, story.coverColor],
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const goNext = useCallback(() => flip((a) => a.flipNext()), [flip]);
  const goPrev = useCallback(() => flip((a) => a.flipPrev()), [flip]);
  const goLast = useCallback(
    () => flip((a) => a.turnToPage(a.getPageCount() - 1)),
    [flip],
  );

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

  useEffect(() => {
    const on = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = stageRef.current;
    if (!node) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void node.requestFullscreen?.();
  }, []);

  const cycleZoom = useCallback(() => {
    if (single) return;
    setZoomIdx((i) => {
      const next = (i + 1) % ZOOM_LEVELS.length;
      if (next === 0) setPan({ x: 0, y: 0 });
      return next;
    });
  }, [single]);

  const onPanDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom === 1) return;
    drag.current = { x: e.clientX, y: e.clientY, ox: pan.x, oy: pan.y };
    setPanning(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPanMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || zoom === 1) return;
    setPan({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
  };
  const onPanUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = null;
    setPanning(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onInit = useCallback(() => {
    setReady(true);
    flip((a) => setPageCount(a.getPageCount()));
  }, [flip]);

  const onFlip = useCallback((e: { data: number }) => setPage(e.data), []);

  const onChangeState = useCallback(
    (e: { data: string }) => {
      if (e.data === "flipping" && lastState.current !== "flipping") {
        if (soundOn && !reduceMotion) playFlipSound();
      }
      lastState.current = e.data;
    },
    [soundOn, reduceMotion],
  );

  // ── reduced motion: simple stacked reader ──
  if (reduceMotion) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4">
        {leaves
          .filter((l) => l.kind !== "filler" && l.kind !== "fly")
          .map((leaf, i) => (
            <div
              key={i}
              className="aspect-[460/620] overflow-hidden rounded-lg border border-[#f2dace] shadow-sm"
            >
              {leaf.kind === "index" ? (
                <IndexPage
                  entries={entries}
                  onJump={() => undefined}
                  side="right"
                />
              ) : leaf.kind === "back" ? (
                <BookCover variant="back" coverColor={story.coverColor} />
              ) : (
                leaf.render(entries)
              )}
            </div>
          ))}
      </div>
    );
  }

  const bookWidth = isMobile
    ? `min(100%, calc(100vw - 1.5rem), calc(${H_BUDGET_MOBILE} * ${PORTRAIT_AR.toFixed(4)}))`
    : `min(96vw, calc(${H_BUDGET} * ${SPREAD_AR.toFixed(4)}))`;

  const label = onCover
    ? "Cover"
    : onBack
      ? "The end"
      : leaves[page]?.kind === "index"
        ? "Contents"
        : leaves[page]?.label || leaves[page - 1]?.label || "";

  return (
    <div className="flex w-full flex-col items-center px-1 sm:px-0">
      {/* No mat — the book floats directly on the page and keeps its own
          drop-shadow (so no overflow-hidden, which would clip that shadow). */}
      <div
        ref={stageRef}
        className="relative flex w-full max-w-[1200px] items-center justify-center px-2 py-4 sm:px-6 sm:py-6"
        style={{ perspective: "2600px" }}
      >
        {!ready && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <p className="animate-pulse font-cursive text-2xl text-[#5b3d28]">
              opening the book…
            </p>
          </div>
        )}

        {/* the whole book — covers and pages in one engine, spine fixed centre */}
        <div
          className={cn(
            "relative",
            zoom > 1 && "cursor-grab active:cursor-grabbing",
          )}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: panning ? "none" : "transform 0.3s ease",
          }}
          onDoubleClick={cycleZoom}
          onPointerDown={onPanDown}
          onPointerMove={onPanMove}
          onPointerUp={onPanUp}
        >
          <div style={{ width: bookWidth }}>
            <HTMLFlipBook
              key={isMobile ? "portrait" : "spread"}
              ref={bookRef}
              // No whole-book shadow on the cover: it would cast behind the
              // full two-page box and darken the empty half beside the closed
              // cover into a "blank board". The cover carries its own shadow.
              className={cn("kyndl-book", !onCover && "kyndl-book-shadow")}
              style={{}}
              width={PAGE_W}
              height={PAGE_H}
              minWidth={240}
              maxWidth={760}
              minHeight={320}
              maxHeight={1000}
              size="stretch"
              drawShadow
              maxShadowOpacity={0.5}
              flippingTime={FLIP_MS}
              showCover
              usePortrait={isMobile}
              mobileScrollSupport
              showPageCorners
              startZIndex={20}
              autoSize
              clickEventForward
              useMouseEvents={zoom === 1}
              swipeDistance={30}
              startPage={0}
              disableFlipByClick={false}
              onInit={onInit}
              onFlip={onFlip}
              onChangeState={onChangeState}
            >
              {leaves.map((leaf, i) => renderLeaf(leaf, i))}
            </HTMLFlipBook>
          </div>
        </div>

        {/* open-me hint while the book sits closed */}
        {ready && onCover && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 animate-pulse font-hand text-sm text-[#e8c79b]/80">
            tap the cover to open →
          </div>
        )}

        {panel === "thumbs" && (
          <ThumbStrip
            leaves={leaves}
            current={page}
            onCover={closeBook}
            onPick={jumpToPage}
            onClose={() => setPanel("none")}
            render={(leaf, i) => renderLeaf(leaf, i)}
          />
        )}
        {panel === "toc" && (
          <TocPanel
            entries={entries}
            onCover={() => {
              closeBook();
              setPanel("none");
            }}
            onPick={jumpToPage}
            onClose={() => setPanel("none")}
          />
        )}
      </div>

      {/* control bar */}
      <div className="mt-3 flex max-w-[min(100%,36rem)] flex-wrap items-center justify-center gap-1 rounded-3xl border border-[#F2DACE] bg-white/80 px-2 py-2 backdrop-blur sm:mt-4 sm:gap-1.5 sm:rounded-full sm:px-2 sm:py-1.5">
        <Ctrl label="Close book" onClick={closeBook} disabled={onCover}>
          ⏮
        </Ctrl>
        <Ctrl label="Previous" onClick={goPrev} disabled={onCover}>
          ‹
        </Ctrl>
        <div className="min-w-0 max-w-[7.5rem] px-1.5 text-center sm:max-w-none sm:px-2">
          <p className="truncate font-hand text-sm leading-none text-[#C75B39]">
            {label}
          </p>
          <p className="text-[10px] text-[#92786C]">
            {onCover
              ? "closed"
              : onBack
                ? "the end"
                : `${page} / ${Math.max(pageCount - 2, 1)}`}
          </p>
        </div>
        <Ctrl label="Next" onClick={goNext} disabled={onBack}>
          ›
        </Ctrl>
        <Ctrl label="Last page" onClick={goLast} disabled={onBack}>
          ⏭
        </Ctrl>

        <span className="mx-0.5 hidden h-5 w-px bg-[#F2DACE] sm:mx-1 sm:block" />

        <Ctrl
          label="Zoom out"
          onClick={() =>
            setZoomIdx((i) => {
              const n = Math.max(0, i - 1);
              if (n === 0) setPan({ x: 0, y: 0 });
              return n;
            })
          }
          disabled={zoomIdx === 0 || single}
        >
          −
        </Ctrl>
        <button
          type="button"
          onClick={cycleZoom}
          disabled={single}
          className="flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-xs text-[#7A6258] hover:text-[#3A2A25] disabled:opacity-40"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Ctrl
          label="Zoom in"
          onClick={() =>
            setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))
          }
          disabled={zoomIdx === ZOOM_LEVELS.length - 1 || single}
        >
          ＋
        </Ctrl>

        <span className="mx-0.5 hidden h-5 w-px bg-[#F2DACE] sm:mx-1 sm:block" />

        <Ctrl
          label="Contents"
          onClick={() => setPanel((p) => (p === "toc" ? "none" : "toc"))}
          active={panel === "toc"}
        >
          ☰
        </Ctrl>
        <Ctrl
          label="Thumbnails"
          onClick={() => setPanel((p) => (p === "thumbs" ? "none" : "thumbs"))}
          active={panel === "thumbs"}
        >
          ▦
        </Ctrl>
        <Ctrl
          label={soundOn ? "Mute" : "Unmute"}
          onClick={() => setSoundOn((s) => !s)}
          active={soundOn}
        >
          {soundOn ? "🔊" : "🔇"}
        </Ctrl>
        <Ctrl
          label="Fullscreen"
          onClick={toggleFullscreen}
          active={isFullscreen}
        >
          ⛶
        </Ctrl>
      </div>
    </div>
  );
}

function Ctrl({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
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
        "flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-sm transition-colors",
        active
          ? "bg-[#FFF1E9] text-[#C75B39]"
          : "text-[#7A6258] hover:bg-[#FFF7F1] hover:text-[#3A2A25]",
        disabled && "cursor-not-allowed opacity-30 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}

function ThumbStrip({
  leaves,
  current,
  onCover,
  onPick,
  onClose,
  render,
}: {
  leaves: Leaf[];
  current: number;
  onCover: () => void;
  onPick: (page: number) => void;
  onClose: () => void;
  render: (leaf: Leaf, idx: number) => ReactNode;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/55 p-3 backdrop-blur">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-medium tracking-wide text-white/80 uppercase">
          Pages
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-white/70 hover:text-white"
        >
          Close ✕
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={onCover}
          className={cn(
            "kyndl-paper flex h-24 w-16 shrink-0 flex-col justify-between rounded-[3px] p-1.5 text-left transition-transform hover:-translate-y-0.5",
            current === 0 && "ring-2 ring-[#FF7A59]",
          )}
        >
          <span className="font-hand text-[10px] leading-tight text-[#5b4034]">
            Cover
          </span>
        </button>
        {leaves.map((leaf, i) =>
          leaf.kind === "page" || leaf.kind === "index" ? (
            <button
              key={i}
              type="button"
              onClick={() => onPick(i)}
              className={cn(
                "relative h-24 w-16 shrink-0 overflow-hidden rounded-[3px] transition-transform hover:-translate-y-0.5",
                i === current && "ring-2 ring-[#FF7A59]",
              )}
              title={leaf.label}
            >
              <span className="pointer-events-none absolute inset-0">
                {render(leaf, i)}
              </span>
            </button>
          ) : null,
        )}
      </div>
    </div>
  );
}

function TocPanel({
  entries,
  onCover,
  onPick,
  onClose,
}: {
  entries: IndexEntry[];
  onCover: () => void;
  onPick: (page: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-4 left-1/2 z-20 w-64 -translate-x-1/2 rounded-2xl border border-[#F2DACE] bg-white/95 p-3 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-sm text-[#3A2A25]">Contents</span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#92786C] hover:text-[#3A2A25]"
        >
          ✕
        </button>
      </div>
      <ul className="max-h-72 space-y-0.5 overflow-y-auto">
        <li>
          <button
            type="button"
            onClick={onCover}
            className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-[#7A6258] hover:bg-[#FFF1E9] hover:text-[#3A2A25]"
          >
            Cover
          </button>
        </li>
        {entries.map((entry) => (
          <li key={entry.leaf}>
            <button
              type="button"
              onClick={() => onPick(entry.leaf)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[#7A6258] hover:bg-[#FFF1E9] hover:text-[#3A2A25]"
            >
              <span className="truncate">{entry.label}</span>
              <span className="text-xs text-[#b29a89] tabular-nums">
                {entry.number}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
