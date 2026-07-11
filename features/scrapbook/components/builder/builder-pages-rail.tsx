"use client";

import { cn } from "@/lib/utils";

import { useBuilderStore } from "../../store/builder.store";

export function BuilderPagesRail() {
  const pages = useBuilderStore((s) => s.story.pages);
  const selectedPageId = useBuilderStore((s) => s.selectedPageId);
  const selectPage = useBuilderStore((s) => s.selectPage);
  const addPage = useBuilderStore((s) => s.addPage);
  const removePage = useBuilderStore((s) => s.removePage);
  const movePage = useBuilderStore((s) => s.movePage);
  // In guided template mode pages are navigation-only (the template defines the
  // structure; overflow still auto-adds plain pages behind the scenes).
  const locked = useBuilderStore((s) => !!s.story.locked);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-3">
        <h3 className="text-xs font-semibold tracking-wide text-[#92786C] uppercase">
          Pages
        </h3>
        <span className="text-xs text-[#b29a89]">{pages.length}</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3">
        {pages.map((page, i) => {
          const active = page.id === selectedPageId;
          return (
            <div
              key={page.id}
              className={cn(
                "group rounded-xl border p-3 transition-colors",
                active
                  ? "border-[#FF7A59] bg-[#FFF1E9]"
                  : "border-[#F2DACE] bg-white hover:border-[#FF7A59]/40",
              )}
            >
              <button
                type="button"
                onClick={() => selectPage(page.id)}
                className="block w-full text-left"
              >
                <p className="text-[11px] text-[#b29a89]">Page {i + 1}</p>
                <p className="truncate text-sm font-medium text-[#3A2A25]">
                  {page.heading || page.chapter || "Untitled"}
                </p>
                <p className="text-[11px] text-[#92786C]">
                  {page.elements.length} item
                  {page.elements.length === 1 ? "" : "s"}
                </p>
              </button>

              {!locked && (
                <div className="mt-2 flex items-center gap-1">
                  <RailIconButton
                    label="Move up"
                    disabled={i === 0}
                    onClick={() => movePage(page.id, -1)}
                  >
                    ↑
                  </RailIconButton>
                  <RailIconButton
                    label="Move down"
                    disabled={i === pages.length - 1}
                    onClick={() => movePage(page.id, 1)}
                  >
                    ↓
                  </RailIconButton>
                  <RailIconButton
                    label="Delete page"
                    disabled={pages.length <= 1}
                    onClick={() => removePage(page.id)}
                    className="ml-auto text-[#C0392B]"
                  >
                    ✕
                  </RailIconButton>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!locked && (
        <div className="p-3">
          <button
            type="button"
            onClick={addPage}
            className="w-full rounded-xl bg-gradient-to-r from-[#FF7A59] to-[#F2596F] px-4 py-2.5 text-sm font-medium text-white kyndl-glow-warm transition-transform hover:-translate-y-0.5"
          >
            + Add page
          </button>
        </div>
      )}
    </div>
  );
}

function RailIconButton({
  children,
  onClick,
  disabled,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md border border-[#F2DACE] bg-white text-sm text-[#7A6258] hover:border-[#FF7A59]/50 disabled:cursor-not-allowed disabled:opacity-30",
        className,
      )}
    >
      {children}
    </button>
  );
}
