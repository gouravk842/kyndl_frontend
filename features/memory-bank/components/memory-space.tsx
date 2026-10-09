"use client";

import { AnimatePresence, LayoutGroup } from "framer-motion";
import {
  ArrowLeft,
  Atom,
  Download,
  Flame,
  LayoutGrid,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sun,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { HearthPanel } from "@/features/memory-bank/components/hearth-panel";
import { MemoryBankList } from "@/features/memory-bank/components/memory-bank-list";
import {
  type ComposerTab,
  MemoryComposer,
} from "@/features/memory-bank/components/memory-keep-sheet";
import { MemoryReader } from "@/features/memory-bank/components/memory-reader";
import { ViewToggle } from "@/features/memory-bank/components/view-toggle";
import { UsedIn } from "@/features/memory-bank/convert/used-in";
import { ConvertWizard } from "@/features/memory-bank/convert/wizard";
import { useEveningSky } from "@/features/memory-bank/lib/evening";
import { downloadMemoryExport } from "@/features/memory-bank/lib/export";
import {
  readFirstRunDone,
  subscribeFirstRun,
} from "@/features/memory-bank/lib/first-run";
import { bankStreakLine, youAria } from "@/features/memory-bank/lib/hearth";
import {
  forgetCircle,
  readLastCircle,
  rememberCircle,
  subscribeLastCircle,
} from "@/features/memory-bank/lib/last-circle";
import {
  readLastOpenedMap,
  subscribeLastOpened,
} from "@/features/memory-bank/lib/last-opened";
import {
  markSkyHintDone,
  readSkyHintDone,
  subscribeSkyHint,
} from "@/features/memory-bank/lib/sky-hint";
import {
  readSolarZoom,
  subscribeSolarZoom,
  writeSolarZoom,
} from "@/features/memory-bank/lib/solar-zoom";
import {
  type MemoryBankViewMode,
  nextMemoryBankView,
  readMemoryBankView,
  subscribeMemoryBankView,
  writeMemoryBankView,
} from "@/features/memory-bank/lib/view-mode";
import { MemoryMolecule } from "@/features/memory-bank/molecule/memory-molecule";
import { SolarAtmosphere } from "@/features/memory-bank/solar/solar-atmosphere";
import { SolarBank } from "@/features/memory-bank/solar/solar-bank";
import { SolarSky } from "@/features/memory-bank/solar/solar-sky";
import {
  useCircleMemories,
  useDeleteCircle,
  useMemoryCircle,
  useMemoryCircles,
  useMemoryStreak,
} from "@/hooks/use-memory-bank";
import { cn } from "@/lib/utils";
import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

const EMPTY_MEMORIES: BankMemory[] = [];
const EMPTY_CIRCLES: MemoryCircle[] = [];
const EMPTY_OPENED: Record<string, string> = {};

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readMemoryHash(): string {
  return window.location.hash.replace("#memory-", "").replace("#", "");
}

export function MemorySpace({ circleId }: { circleId?: string }) {
  const router = useRouter();
  const circles = useMemoryCircles();
  const hearth = useMemoryStreak();
  const circle = useMemoryCircle(circleId ?? "");
  const memories = useCircleMemories(circleId ?? "");
  const removeCircle = useDeleteCircle();
  const lastId = useSyncExternalStore(
    subscribeLastCircle,
    readLastCircle,
    () => null,
  );
  const firstRunDone = useSyncExternalStore(
    subscribeFirstRun,
    readFirstRunDone,
    () => false,
  );
  const hashId = useSyncExternalStore(subscribeHash, readMemoryHash, () => "");
  const viewMode = useSyncExternalStore(
    subscribeMemoryBankView,
    readMemoryBankView,
    () => "solar" as MemoryBankViewMode,
  );
  const lastOpened = useSyncExternalStore(
    subscribeLastOpened,
    readLastOpenedMap,
    () => EMPTY_OPENED,
  );
  const zoom = useSyncExternalStore(subscribeSolarZoom, readSolarZoom, () => 1);
  const evening = useEveningSky();

  const [query, setQuery] = useState("");
  const [hearthOpen, setHearthOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<ComposerTab>("bank");
  const [editing, setEditing] = useState<BankMemory | null>(null);
  const [readerIndex, setReaderIndex] = useState<number | null>(null);
  const [renameCircle, setRenameCircle] = useState<MemoryCircle | null>(null);
  const [confirmCircle, setConfirmCircle] = useState(false);
  const [convertTarget, setConvertTarget] = useState<{
    circleId: string;
    circleName: string;
    memoryId?: string;
    memoryTitle?: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [listFilter, setListFilter] = useState<{
    circleId: string;
    ids: string[];
  } | null>(null);
  const [spawnedId, setSpawnedId] = useState<string | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const hostRef = useRef<HTMLDivElement>(null);

  const rows = memories.data ?? EMPTY_MEMORIES;
  const bankList = circles.data ?? EMPTY_CIRCLES;
  const inside = Boolean(circleId);

  useEffect(() => {
    const main = hostRef.current?.closest("main");
    if (!main) return;
    const previous = main.style.overflow;
    main.style.overflow = "hidden";
    return () => {
      main.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (circle.data) rememberCircle(circle.data.id);
  }, [circle.data]);

  useEffect(() => {
    const ids = new Set(rows.map((row) => row.id));
    if (!seenIds.current.size) {
      seenIds.current = ids;
      return;
    }
    const fresh = rows.find((row) => !seenIds.current.has(row.id));
    seenIds.current = ids;
    if (fresh) {
      setSpawnedId(fresh.id);
      const timer = window.setTimeout(() => setSpawnedId(null), 1400);
      return () => window.clearTimeout(timer);
    }
  }, [rows]);

  const hashIndex = hashId ? rows.findIndex((row) => row.id === hashId) : -1;
  const openIndex =
    readerIndex ?? (inside && hashIndex >= 0 ? hashIndex : null);

  const needle = query.trim().toLowerCase();
  const searching = needle.length >= 2;
  const keepCircleId =
    circleId ||
    (lastId && bankList.some((row) => row.id === lastId) ? lastId : null) ||
    bankList.find((row) => !row.is_loose)?.id ||
    bankList.find((row) => row.is_loose)?.id ||
    "";

  const namedCount = bankList.filter((row) => !row.is_loose).length;
  const listFilterIds =
    circleId && listFilter?.circleId === circleId ? listFilter.ids : null;
  const showGhost =
    !inside && !namedCount && !firstRunDone && !circles.isPending;
  const reduceMotion = usePrefersReducedMotion();
  const composerOpen =
    showGhost || addOpen || Boolean(editing) || Boolean(renameCircle);

  function openAdd(tab: ComposerTab) {
    setEditing(null);
    setRenameCircle(null);
    setAddTab(tab);
    setAddOpen(true);
  }

  function closeComposer() {
    setAddOpen(false);
    setEditing(null);
    setRenameCircle(null);
  }

  useEffect(() => {
    if (viewMode !== "solar" || composerOpen) return;
    const host = hostRef.current;
    if (!host) return;
    const onWheel = (event: WheelEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-hud], [role='dialog']")
      ) {
        return;
      }
      event.preventDefault();
      writeSolarZoom(zoom * (event.deltaY > 0 ? 0.94 : 1.06));
    };
    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel);
  }, [composerOpen, viewMode, zoom]);

  useEffect(() => {
    if (viewMode !== "solar" || composerOpen) return;
    const host = hostRef.current;
    if (!host) return;
    let startDist = 0;
    let startZoom = 1;
    function dist(touches: TouchList) {
      const a = touches.item(0);
      const b = touches.item(1);
      if (!a || !b) return 0;
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }
    function onStart(event: TouchEvent) {
      if (event.touches.length !== 2) return;
      startDist = dist(event.touches);
      startZoom = readSolarZoom();
    }
    function onMove(event: TouchEvent) {
      if (event.touches.length !== 2 || startDist < 8) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-hud], [role='dialog']")
      ) {
        return;
      }
      event.preventDefault();
      writeSolarZoom(startZoom * (dist(event.touches) / startDist));
    }
    host.addEventListener("touchstart", onStart, { passive: true });
    host.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      host.removeEventListener("touchstart", onStart);
      host.removeEventListener("touchmove", onMove);
    };
  }, [composerOpen, viewMode]);

  useEffect(() => {
    if (inside) markSkyHintDone();
  }, [inside]);

  async function onExport() {
    setExporting(true);
    try {
      if (inside && circle.data) {
        await downloadMemoryExport({
          id: circle.data.id,
          name: circle.data.name,
        });
      } else {
        await downloadMemoryExport();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (openIndex != null) return;
      if (composerOpen) return;
      if (inside) router.push(ROUTES.memories);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composerOpen, inside, openIndex, router]);

  const loadingSky = !inside && circles.isPending;
  const loadingInside =
    inside && (circle.isPending || circle.isLoading || memories.isPending);
  const missingInside =
    inside && (circle.isError || (!circle.isPending && !circle.data));
  const readerMemory =
    openIndex != null && openIndex >= 0 ? rows[openIndex] : undefined;

  function closeReader() {
    setReaderIndex(null);
    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
      window.dispatchEvent(new Event("hashchange"));
    }
  }

  return (
    <div
      ref={hostRef}
      className={cn(
        "relative -m-6 h-[calc(100dvh-4rem)] overflow-hidden bg-[var(--mb-solar-void)]",
        evening && "mb-evening",
      )}
    >
      {viewMode === "list" && !showGhost ? (
        <div className="relative h-full overflow-hidden">
          <SolarAtmosphere />
          <div className="relative z-10 h-full overflow-auto">
            <MemoryBankList
              inside={inside}
              banks={bankList}
              memories={rows}
              needle={needle}
              searching={searching}
              filterIds={listFilterIds}
              onOpenBank={(id) => router.push(ROUTES.memoryCircle(id))}
              onOpenMemory={setReaderIndex}
              onKeep={() => openAdd(keepCircleId ? "memory" : "bank")}
              onConvertBank={(bank) =>
                setConvertTarget({ circleId: bank.id, circleName: bank.name })
              }
            />
            {listFilterIds ? (
              <div className="fixed bottom-28 left-1/2 z-20 -translate-x-1/2 md:bottom-6">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setListFilter(null)}
                >
                  Show all memories
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : viewMode === "molecule" && !showGhost ? (
        <>
          <MemoryMolecule
            inside={inside}
            banks={bankList}
            memories={rows}
            needle={needle}
            searching={searching}
            filterIds={listFilterIds}
            reduceMotion={Boolean(reduceMotion)}
            spawnedId={spawnedId}
            onOpenBank={(id) => router.push(ROUTES.memoryCircle(id))}
            onOpenMemory={setReaderIndex}
            onKeep={() => openAdd(keepCircleId ? "memory" : "bank")}
          />
          {listFilterIds ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center md:bottom-6">
              <Button
                variant="outline"
                className="pointer-events-auto rounded-full"
                onClick={() => setListFilter(null)}
              >
                Show all memories
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <LayoutGroup>
          <AnimatePresence>
            {viewMode === "solar" && !inside && !showGhost ? (
              <SolarSky
                banks={bankList}
                lastId={lastId}
                searching={searching}
                needle={needle}
                reduceMotion={Boolean(reduceMotion)}
                zoom={zoom}
                onZoom={writeSolarZoom}
                onOpenBank={(id) => router.push(ROUTES.memoryCircle(id))}
                onNameBank={() => openAdd("bank")}
                flame={
                  hearth.data
                    ? {
                        state: hearth.data.state,
                        streak: hearth.data.current_streak,
                      }
                    : undefined
                }
                onOpenHearth={() => setHearthOpen(true)}
              />
            ) : null}
          </AnimatePresence>
          {viewMode === "solar" && inside && circle.data ? (
            <SolarBank
              key={circle.data.id}
              circle={circle.data}
              memories={rows}
              lastOpened={lastOpened}
              searching={searching}
              needle={needle}
              reduceMotion={Boolean(reduceMotion)}
              zoom={zoom}
              onZoom={writeSolarZoom}
              onOpenMemory={setReaderIndex}
              onKeep={() => openAdd("memory")}
              onUseList={(ids) => {
                writeMemoryBankView("list");
                if (circleId && ids?.length) {
                  setListFilter({ circleId, ids });
                } else {
                  setListFilter(null);
                }
              }}
              spawnedId={spawnedId}
            />
          ) : null}
        </LayoutGroup>
      )}

      <MemoryComposer
        open={composerOpen}
        tab={renameCircle ? "bank" : editing ? "memory" : addTab}
        onTabChange={setAddTab}
        onClose={closeComposer}
        circleId={editing?.circle_id ?? keepCircleId}
        memory={editing}
        renameCircle={renameCircle}
        firstRun={showGhost}
        namedCount={namedCount}
      />

      <Hud
        inside={inside}
        circle={inside ? circle.data : undefined}
        query={query}
        onQuery={setQuery}
        view={viewMode}
        onView={writeMemoryBankView}
        onBack={() => router.push(ROUTES.memories)}
        onKeep={() => openAdd(keepCircleId ? "memory" : "bank")}
        onExport={onExport}
        exporting={exporting}
        onDelete={
          inside && circle.data && !circle.data.is_loose
            ? () => setConfirmCircle(true)
            : undefined
        }
        onRename={
          inside && circle.data && !circle.data.is_loose
            ? () => {
                const current = circle.data;
                if (!current) return;
                setRenameCircle(current);
              }
            : undefined
        }
        onConvert={
          inside && circle.data
            ? () =>
                setConvertTarget({
                  circleId: circle.data!.id,
                  circleName: circle.data!.name,
                })
            : undefined
        }
        onTrash={() => router.push(ROUTES.memoryTrash)}
        onHearth={() => setHearthOpen(true)}
        hearthLabel={youAria(
          hearth.data?.current_streak ?? 0,
          hearth.data?.state ?? "out",
        )}
      />

      <HearthPanel
        open={hearthOpen}
        onOpenChange={setHearthOpen}
        streak={hearth.data}
      />

      {viewMode === "solar" && !showGhost && !inside ? <SkyHint /> : null}

      {loadingSky || loadingInside ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-[#C75B39]">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : null}

      {missingInside ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--mb-solar-void)]/80">
          <p className="text-[var(--mb-solar-muted)]">
            This circle is not in your bank.
          </p>
          <Link href={ROUTES.memories} className="mt-4 text-sm text-[#C75B39]">
            All banks
          </Link>
        </div>
      ) : null}

      {circles.isError && !inside ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--mb-solar-void)]/80">
          <p className="text-[var(--mb-solar-muted)]">
            We couldn&apos;t open your memories.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => circles.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {inside && circle.data && !circle.data.is_loose ? (
        <ConfirmDialog
          open={confirmCircle}
          onOpenChange={setConfirmCircle}
          title={`Delete ${circle.data.name}?`}
          description={
            <>
              <span className="block">
                {circle.data.memory_count === 1
                  ? "The 1 memory inside goes with it."
                  : `All ${circle.data.memory_count} memories inside go with it.`}
              </span>
              {(circle.data.conversions ?? []).some(
                (item) => item.mode === "live",
              ) ? (
                <span className="mt-2 block">
                  A live keepsake still follows this bank. Keep it as a
                  snapshot, or delete it too.
                </span>
              ) : (
                <span className="mt-2 block">
                  Nothing is destroyed today — you can put it back from the
                  trash.
                </span>
              )}
            </>
          }
          confirmLabel={
            (circle.data.conversions ?? []).some((item) => item.mode === "live")
              ? "Keep as a snapshot"
              : "Move to trash"
          }
          destructive={
            !(circle.data.conversions ?? []).some(
              (item) => item.mode === "live",
            )
          }
          secondaryLabel={
            (circle.data.conversions ?? []).some((item) => item.mode === "live")
              ? "Delete the feature too"
              : undefined
          }
          secondaryDestructive
          busy={removeCircle.isPending}
          onSecondary={() => {
            const current = circle.data;
            if (!current) return;
            removeCircle.mutate(
              { id: current.id, live: "delete" },
              {
                onSuccess: () => {
                  setConfirmCircle(false);
                  forgetCircle(current.id);
                  router.push(ROUTES.memories);
                },
              },
            );
          }}
          onConfirm={() => {
            const current = circle.data;
            if (!current) return;
            const live = (current.conversions ?? []).some(
              (item) => item.mode === "live",
            );
            removeCircle.mutate(
              live ? { id: current.id, live: "snapshot" } : current.id,
              {
                onSuccess: () => {
                  setConfirmCircle(false);
                  forgetCircle(current.id);
                  router.push(ROUTES.memories);
                },
              },
            );
          }}
        />
      ) : null}

      {readerMemory && openIndex != null && circleId && circle.data ? (
        <MemoryReader
          memories={rows}
          index={openIndex}
          onIndex={setReaderIndex}
          onClose={closeReader}
          circleId={circleId}
          circleName={circle.data.name}
          onEdit={(memory) => {
            setReaderIndex(null);
            setEditing(memory);
          }}
          onConvert={(memory) => {
            setReaderIndex(null);
            setConvertTarget({
              circleId: circle.data!.id,
              circleName: circle.data!.name,
              memoryId: memory.id,
              memoryTitle: memory.title,
            });
          }}
        />
      ) : null}

      {convertTarget ? (
        <ConvertWizard
          circleId={convertTarget.circleId}
          circleName={convertTarget.circleName}
          memoryId={convertTarget.memoryId}
          memoryTitle={convertTarget.memoryTitle}
          onClose={() => setConvertTarget(null)}
        />
      ) : null}
    </div>
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function SkyHint() {
  const done = useSyncExternalStore(
    subscribeSkyHint,
    readSkyHintDone,
    () => true,
  );
  if (done) return null;
  return (
    <div
      data-hud
      className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-4 md:top-20 md:bottom-auto"
    >
      <div className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-full border border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/95 px-4 py-2 text-sm text-[var(--mb-solar-ink)] shadow-sm">
        <p>Planets are banks. Moons are memories.</p>
        <button
          type="button"
          className="min-h-11 shrink-0 text-[var(--mb-solar-muted)] hover:text-[var(--mb-solar-ink)]"
          onClick={markSkyHintDone}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function MoreMenu({
  side,
  includeView,
  onView,
  onExport,
  exporting,
  onDelete,
  onRename,
  onConvert,
  onTrash,
}: {
  side?: "top" | "bottom";
  includeView?: boolean;
  onView: (view: MemoryBankViewMode) => void;
  onExport: () => void;
  exporting: boolean;
  onDelete?: () => void;
  onRename?: () => void;
  onConvert?: () => void;
  onTrash: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label="More"
            className="h-11 w-11 rounded-full bg-[var(--mb-solar-void)]/90"
          >
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end" side={side === "top" ? "top" : "bottom"}>
        {includeView ? (
          <>
            <DropdownMenuItem onClick={() => onView("solar")}>
              <Sun className="size-3.5" />
              Solar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView("molecule")}>
              <Atom className="size-3.5" />
              Molecule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView("list")}>
              <LayoutGrid className="size-3.5" />
              List
            </DropdownMenuItem>
          </>
        ) : null}
        {onRename ? (
          <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        ) : null}
        {onConvert ? (
          <DropdownMenuItem onClick={onConvert}>
            Convert to feature
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={onExport} disabled={exporting}>
          <Download className="size-3.5" />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTrash}>
          <Trash2 className="size-3.5" />
          Trash
        </DropdownMenuItem>
        {onDelete ? (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-3.5" />
            Delete bank
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Hud({
  inside,
  circle,
  query,
  onQuery,
  view,
  onView,
  onBack,
  onKeep,
  onExport,
  exporting,
  onDelete,
  onRename,
  onConvert,
  onTrash,
  onHearth,
  hearthLabel,
}: {
  inside: boolean;
  circle?: MemoryCircle;
  query: string;
  onQuery: (value: string) => void;
  view: MemoryBankViewMode;
  onView: (view: MemoryBankViewMode) => void;
  onBack: () => void;
  onKeep: () => void;
  onExport: () => void;
  exporting: boolean;
  onDelete?: () => void;
  onRename?: () => void;
  onConvert?: () => void;
  onTrash: () => void;
  onHearth: () => void;
  hearthLabel: string;
}) {
  const [searchOpen, setSearchOpen] = useState(query.length > 0);
  const searchLabel = inside
    ? `Search in ${circle?.name ?? "this bank"}`
    : "Search banks";
  const keptLine = circle ? bankStreakLine(circle) : null;
  const more = {
    onView,
    onExport,
    exporting,
    onDelete,
    onRename,
    onConvert,
    onTrash,
  };

  return (
    <>
      {inside ? (
        <div
          data-hud
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex p-4 pt-[max(1rem,env(safe-area-inset-top))] md:hidden"
        >
          <button
            type="button"
            onClick={onBack}
            className="pointer-events-auto inline-flex h-11 items-center gap-1 rounded-full border border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/90 px-3 text-sm text-[var(--mb-solar-muted)] backdrop-blur-sm hover:text-[var(--mb-solar-ink)]"
          >
            <ArrowLeft className="size-4" />
            All banks
          </button>
          {keptLine ? (
            <p className="pointer-events-none mt-2 px-1 text-xs text-[#C75B39]">
              {keptLine}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        data-hud
        className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden items-start justify-between gap-3 p-5 md:flex"
      >
        <div className="pointer-events-auto flex min-w-0 items-center gap-2">
          {inside ? (
            <div className="flex min-w-0 flex-col">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 items-center gap-1 rounded-full border border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/90 px-3 text-sm text-[var(--mb-solar-muted)] backdrop-blur-sm hover:text-[var(--mb-solar-ink)]"
              >
                <ArrowLeft className="size-4" />
                All banks
              </button>
              <UsedIn conversions={circle?.conversions} />
              {keptLine ? (
                <p className="mt-1 px-3 text-xs text-[#C75B39]">{keptLine}</p>
              ) : null}
            </div>
          ) : (
            <span className="w-11" />
          )}
        </div>

        <div className="pointer-events-auto relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#C75B39]" />
          <Input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="h-11 rounded-full border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/90 pl-9 backdrop-blur-sm"
          />
        </div>

        <div className="pointer-events-auto flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onHearth}
            aria-label={hearthLabel}
            className="h-11 rounded-full"
          >
            <Flame className="size-4 text-[#C75B39]" />
          </Button>
          <Button type="button" onClick={onKeep} className="h-11 rounded-full">
            <Plus className="size-4" />
            Add
          </Button>
          <ViewToggle view={view} onChange={onView} />
          <MoreMenu {...more} />
        </div>
      </div>

      <div
        data-hud
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 md:hidden"
      >
        <div className="pointer-events-auto flex items-center gap-2 border-t border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)]/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          {searchOpen ? (
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#C75B39]" />
              <Input
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                onBlur={() => {
                  if (!query) setSearchOpen(false);
                }}
                placeholder={searchLabel}
                aria-label={searchLabel}
                autoFocus
                className="h-11 rounded-full border-[var(--mb-solar-line)] bg-[var(--mb-solar-void)] pl-9"
              />
            </div>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={searchLabel}
              className="h-11 w-11 rounded-full"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" />
            </Button>
          )}
          <Button type="button" onClick={onKeep} className="h-11 rounded-full">
            <Plus className="size-4" />
            Add
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={hearthLabel}
            className="h-11 w-11 rounded-full"
            onClick={onHearth}
          >
            <Flame className="size-4 text-[#C75B39]" />
          </Button>
          {searchOpen ? null : (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Switch to ${nextMemoryBankView(view)} view`}
              className="h-11 w-11 rounded-full"
              onClick={() => onView(nextMemoryBankView(view))}
            >
              {nextMemoryBankView(view) === "solar" ? (
                <Sun className="size-4" />
              ) : nextMemoryBankView(view) === "molecule" ? (
                <Atom className="size-4" />
              ) : (
                <LayoutGrid className="size-4" />
              )}
            </Button>
          )}
          <MoreMenu side="top" includeView {...more} />
        </div>
      </div>
    </>
  );
}
