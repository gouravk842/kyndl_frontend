"use client";

import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import { useBuilderStore } from "../../store/builder.store";
import type { PlacedElement } from "../../types";
import { renderElement } from "../render-element";
import {
  bodyBoxStyle,
  DESIGN_H,
  DESIGN_W,
  rulingClass,
} from "../scrapbook-page";
import { EditorToolbar } from "./editor-toolbar";
import { PageEditor } from "./page-editor";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type DragState = {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
};

/** First top-level block whose bottom crosses the page boundary, or null when
 *  the content fits. Measured against the height-constrained editor DOM. */
function findOverflowSplit(editor: Editor): number | null {
  const pm = editor.view.dom as HTMLElement;
  if (pm.scrollHeight <= pm.clientHeight + 1) return null;
  // Use offset metrics (pre-transform layout box) so this works even though the
  // editor lives inside a CSS-scaled design box.
  const limit = pm.clientHeight;
  const kids = Array.from(pm.children) as HTMLElement[];
  for (let i = 0; i < kids.length; i++) {
    const el = kids[i]!;
    if (el.offsetTop + el.offsetHeight > limit + 1) return i;
  }
  return null;
}

/** Document position just before the top-level block at `index`. */
function topLevelOffset(editor: Editor, index: number): number {
  let pos = editor.state.doc.content.size;
  editor.state.doc.forEach((_node, offset, i) => {
    if (i === index) pos = offset;
  });
  return pos;
}

export function BuilderCanvas() {
  const story = useBuilderStore((s) => s.story);
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectedElementId = useBuilderStore((s) => s.selectedElementId);
  const selectElement = useBuilderStore((s) => s.selectElement);
  const updateElement = useBuilderStore((s) => s.updateElement);
  const updatePageBody = useBuilderStore((s) => s.updatePageBody);
  const addPageAfter = useBuilderStore((s) => s.addPageAfter);
  const selectPage = useBuilderStore((s) => s.selectPage);

  const page = story.pages.find((p) => p.id === selectedPageId);
  const locked = !!story.locked;

  const areaRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  // Page box sized to fit BOTH the column width and height so it never overflows.
  const [box, setBox] = useState({ w: 0, h: 0 });

  const [editor, setEditor] = useState<Editor | null>(null);
  // Page that the caret should jump to after an overflow split (so typing
  // continues seamlessly on the new leaf).
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ar = DESIGN_W / DESIGN_H;
    const update = () => {
      const availW = el.clientWidth - 32; // p-4 gutter
      const availH = el.clientHeight - 32;
      const w = Math.max(0, Math.min(availW, availH * ar, 460));
      setBox({ w, h: w / ar });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = box.w / DESIGN_W;

  // -------------------------------------------------- overflow → new page
  const paginate = useCallback(
    (ed: Editor, pageId: string) => {
      const splitIndex = findOverflowSplit(ed);
      // splitIndex < 1 → a single block taller than the page; we can't move it
      // without splitting mid-block (a later refinement), so leave it be.
      if (splitIndex === null || splitIndex < 1) return;

      const doc = ed.getJSON();
      const blocks = (doc.content ?? []) as JSONContent[];
      const head = blocks.slice(0, splitIndex);
      const tail = blocks.slice(splitIndex);
      if (!tail.length) return;

      const caretInTail =
        ed.state.selection.from >= topLevelOffset(ed, splitIndex);

      const headDoc: JSONContent = { type: "doc", content: head };
      // Trim the current leaf without echoing an update back through onChange.
      ed.commands.setContent(headDoc, { emitUpdate: false });
      updatePageBody(pageId, headDoc);

      // Flow the overflow onto the next leaf. In a locked template we only ever
      // flow into a *plain* continuation page (never into the next designed
      // page), creating one when needed; in a free build we prepend to whatever
      // page follows.
      const pages = useBuilderStore.getState().story.pages;
      const idx = pages.findIndex((p) => p.id === pageId);
      const next = pages[idx + 1];
      const canFlowIntoNext = !!next && (!locked || next.elements.length === 0);
      let targetId: string;
      if (next && canFlowIntoNext) {
        const merged: JSONContent = {
          type: "doc",
          content: [...tail, ...((next.body?.content as JSONContent[]) ?? [])],
        };
        updatePageBody(next.id, merged);
        targetId = next.id;
      } else {
        targetId = addPageAfter(pageId, { type: "doc", content: tail });
      }

      if (caretInTail) {
        setPendingFocus(targetId);
        selectPage(targetId);
      }
    },
    [locked, updatePageBody, addPageAfter, selectPage],
  );

  // Debounce measurement to the next frame so the DOM has reflowed and we never
  // re-enter a ProseMirror transaction mid-dispatch.
  const handleContentResize = useCallback(
    (ed: Editor) => {
      const pageId = selectedPageId;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => paginate(ed, pageId));
    },
    [paginate, selectedPageId],
  );

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleBodyChange = useCallback(
    (body: JSONContent) => updatePageBody(selectedPageId, body),
    [updatePageBody, selectedPageId],
  );

  const handleEditorReady = useCallback((ed: Editor | null) => {
    setEditor(ed);
    // The autofocus prop has already been consumed on mount; clear the flag so
    // ordinary page switches don't yank the caret to the end.
    if (ed) setPendingFocus((prev) => (prev ? null : prev));
  }, []);

  if (!page) return null;

  const onElementPointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    el: PlacedElement,
  ) => {
    e.stopPropagation();
    selectElement(el.id);
    drag.current = {
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onElementPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const fit = fitRef.current;
    if (!d || !fit) return;
    const rect = fit.getBoundingClientRect();
    const dxPct = ((e.clientX - d.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - d.startY) / rect.height) * 100;
    updateElement(d.id, {
      x: clamp(d.origX + dxPct, 0, 96),
      y: clamp(d.origY + dyPct, 0, 96),
    });
  };

  const onElementPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Locked (template) mode: select a photo frame to swap its image/caption.
  const onElementSelect = (
    e: ReactPointerEvent<HTMLDivElement>,
    el: PlacedElement,
  ) => {
    e.stopPropagation();
    selectElement(el.id);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <EditorToolbar editor={editor} />

      <div
        ref={areaRef}
        className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4"
      >
        <div
          className="kyndl-book-shadow"
          style={{ width: box.w || undefined, height: box.h || undefined }}
        >
          {/* page surface */}
          <div
            className="kyndl-paper relative h-full w-full overflow-hidden rounded-[4px]"
            style={
              page.background
                ? { backgroundColor: page.background, backgroundImage: "none" }
                : undefined
            }
            onPointerDown={() => selectElement(null)}
          >
            {/* one scaled design box holds the ruling, writing surface, header
                and elements so they all stay aligned at any leaf size */}
            <div ref={fitRef} className="absolute inset-0">
              {scale > 0 && (
                <div
                  className="relative"
                  style={{
                    width: DESIGN_W,
                    height: DESIGN_H,
                    transformOrigin: "top left",
                    transform: `scale(${scale})`,
                  }}
                >
                  {/* surface ruling */}
                  {rulingClass(page.paper) && (
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-0 z-0",
                        rulingClass(page.paper),
                      )}
                    />
                  )}

                  {/* writing surface — beneath the placed elements */}
                  <div
                    className="pointer-events-auto absolute z-[1] overflow-hidden"
                    style={bodyBoxStyle(!!(page.eyebrow || page.heading))}
                  >
                    <PageEditor
                      key={page.id}
                      body={page.body}
                      autoFocusEnd={pendingFocus === page.id}
                      onChange={handleBodyChange}
                      onEditorReady={handleEditorReady}
                      onContentResize={handleContentResize}
                    />
                  </div>

                  {/* header (non-interactive) */}
                  {(page.eyebrow || page.heading) && (
                    <header className="pointer-events-none absolute top-[5%] left-[8%] z-[2]">
                      {page.eyebrow && (
                        <p className="font-hand text-base tracking-wide text-[#c08552]">
                          {page.eyebrow}
                        </p>
                      )}
                      {page.heading && (
                        <h3 className="font-display text-2xl text-[#3a2a25]">
                          {page.heading}
                        </h3>
                      )}
                    </header>
                  )}

                  {/* placed elements — draggable when free, photo-only and
                      non-draggable when locked to a template */}
                  {page.elements.map((el) => {
                    const selected = el.id === selectedElementId;
                    const isPhoto = el.kind === "photo";
                    const interactive = !locked || isPhoto;
                    const draggable = !locked;
                    return (
                      <div
                        key={el.id}
                        role={interactive ? "button" : undefined}
                        tabIndex={interactive ? 0 : undefined}
                        onPointerDown={
                          draggable
                            ? (e) => onElementPointerDown(e, el)
                            : interactive
                              ? (e) => onElementSelect(e, el)
                              : undefined
                        }
                        onPointerMove={
                          draggable ? onElementPointerMove : undefined
                        }
                        onPointerUp={draggable ? onElementPointerUp : undefined}
                        className={cn(
                          "absolute rounded-[2px] outline-offset-4",
                          interactive
                            ? "pointer-events-auto"
                            : "pointer-events-none",
                          draggable &&
                            "cursor-grab touch-none active:cursor-grabbing",
                          !draggable &&
                            interactive &&
                            "cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-[#FF7A59]/50",
                          selected &&
                            "outline-dashed outline-2 outline-[#FF7A59]",
                        )}
                        style={{
                          left: `${el.x}%`,
                          top: `${el.y}%`,
                          width:
                            el.kind === "photo" && el.width
                              ? `${el.width}%`
                              : undefined,
                          zIndex: (el.z ?? 1) + 3,
                          transform: `rotate(${el.rotate ?? 0}deg) scale(${el.scale ?? 1})`,
                          transformOrigin: "top left",
                        }}
                      >
                        {/* block inner interactivity so dragging always wins */}
                        <div className="pointer-events-none">
                          {renderElement(el)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* paper grain — sits above everything, very subtle */}
            <span
              aria-hidden
              className="kyndl-paper-grain pointer-events-none absolute inset-0 z-[3]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
