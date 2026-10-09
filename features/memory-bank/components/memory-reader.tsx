"use client";

import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import {
  type RefObject,
  type TouchEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { KeepsakeFace } from "@/features/memory-bank/lib/keepsake-face";
import { rememberOpened } from "@/features/memory-bank/lib/last-opened";
import {
  formatMemoryDay,
  photoSrc,
  previewLine,
} from "@/features/memory-bank/lib/preview";
import type { BankMemory } from "@/types/memory-bank";

import { MemoryActions } from "./memory-actions";

function subscribeMobile(onChange: () => void) {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function focusables(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((node) => !node.hasAttribute("disabled"));
}

function ReaderBody({
  memory,
  memories,
  index,
  onIndex,
  onClose,
  circleId,
  circleName,
  onEdit,
  onConvert,
  dialogRef,
}: {
  memory: BankMemory;
  memories: BankMemory[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  circleId: string;
  circleName: string;
  onEdit: (memory: BankMemory) => void;
  onConvert?: (memory: BankMemory) => void;
  dialogRef: RefObject<HTMLDivElement | null>;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);
  const src = memory.photos[photoIndex]
    ? photoSrc(memory.photos[photoIndex]!)
    : null;
  const line = previewLine({
    title: memory.title,
    note: memory.note,
    photos: memory.photos,
  });

  function onTouchStart(event: TouchEvent) {
    setTouchX(event.changedTouches[0]?.clientX ?? null);
  }

  function onTouchEnd(event: TouchEvent) {
    if (touchX == null) return;
    const end = event.changedTouches[0]?.clientX ?? touchX;
    const delta = end - touchX;
    if (delta < -40) onIndex(Math.min(index + 1, memories.length - 1));
    if (delta > 40) onIndex(Math.max(index - 1, 0));
    setTouchX(null);
  }

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="flex max-h-[90dvh] flex-col outline-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="text-xs tracking-wide text-[#C75B39] uppercase">
          {memory.occurred_on ? formatMemoryDay(memory.occurred_on) : "Undated"}
        </p>
        <div className="flex items-center gap-1">
          <MemoryActions
            circleId={circleId}
            circleName={circleName}
            memory={memory}
            onEdit={() => onEdit(memory)}
            onConvert={onConvert ? () => onConvert(memory) : undefined}
          />
          <button
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#1A1210] px-4 py-6">
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- presigned photo URL */}
            <img
              src={src}
              alt=""
              className="max-h-[50dvh] max-w-full object-contain md:max-h-[56dvh]"
            />
            {memory.photos.length > 1 ? (
              <div className="absolute right-4 bottom-4 rounded-full bg-black/50 px-2 py-1 text-xs text-[#FFF7F1]">
                {photoIndex + 1} / {memory.photos.length}
              </div>
            ) : null}
          </>
        ) : (
          <span className="size-56 overflow-hidden rounded-3xl md:size-72">
            <KeepsakeFace seed={memory.id} />
          </span>
        )}
        {index > 0 ? (
          <button
            type="button"
            onClick={() => onIndex(index - 1)}
            className="absolute left-2 hidden size-11 items-center justify-center rounded-full bg-white/10 text-[#FFF7F1] md:flex"
            aria-label="Previous memory"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        {index < memories.length - 1 ? (
          <button
            type="button"
            onClick={() => onIndex(index + 1)}
            className="absolute right-2 hidden size-11 items-center justify-center rounded-full bg-white/10 text-[#FFF7F1] md:flex"
            aria-label="Next memory"
          >
            <ChevronRight className="size-5" />
          </button>
        ) : null}
      </div>
      <div className="px-5 py-4">
        {src && memory.photos.length > 1 ? (
          <div className="mb-3 flex justify-center gap-1">
            {memory.photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setPhotoIndex(i)}
                className={`h-1.5 min-w-2 rounded-full ${
                  i === photoIndex ? "w-6 bg-[#3A2A25]" : "w-2 bg-[#3A2A25]/30"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        ) : null}
        {memory.title && memory.note && memory.note !== memory.title ? (
          <>
            <p className="font-display text-xl text-[#3A2A25]">
              {memory.title}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#7A6258]">
              {memory.note}
            </p>
          </>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#3A2A25]">
            {line}
          </p>
        )}
        {memory.location?.label || memory.location?.name ? (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-[#7A6258]">
            <MapPin className="mt-px size-3.5 shrink-0 text-[#C75B39]" />
            <span>{memory.location.label || memory.location.name}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function MemoryReader({
  memories,
  index,
  onIndex,
  onClose,
  circleId,
  circleName,
  onEdit,
  onConvert,
}: {
  memories: BankMemory[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  circleId: string;
  circleName: string;
  onEdit: (memory: BankMemory) => void;
  onConvert?: (memory: BankMemory) => void;
}) {
  const memory = memories[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    readMobile,
    () => false,
  );

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      previousFocus.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (memory) rememberOpened(memory.id);
  }, [memory]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        onIndex(Math.min(index + 1, memories.length - 1));
      }
      if (event.key === "ArrowLeft") {
        onIndex(Math.max(index - 1, 0));
      }
      if (event.key === "Tab" && dialogRef.current) {
        const nodes = focusables(dialogRef.current);
        if (!nodes.length) return;
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        const active = document.activeElement;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, memories.length, onClose, onIndex]);

  if (!memory) return null;

  const line = previewLine({
    title: memory.title,
    note: memory.note,
    photos: memory.photos,
  });

  const body = (
    <ReaderBody
      key={memory.id}
      memory={memory}
      memories={memories}
      index={index}
      onIndex={onIndex}
      onClose={onClose}
      circleId={circleId}
      circleName={circleName}
      onEdit={onEdit}
      onConvert={onConvert}
      dialogRef={dialogRef}
    />
  );

  if (isMobile) {
    return (
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[90dvh] gap-0 overflow-hidden rounded-t-3xl p-0"
        >
          <SheetTitle className="sr-only">{line}</SheetTitle>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#3A2A25]/40"
        aria-label="Close memory"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={line}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#F2DACE] bg-[#FFF7F1] shadow-[0_24px_80px_rgba(58,42,37,0.28)]"
      >
        {body}
      </div>
    </div>
  );
}
