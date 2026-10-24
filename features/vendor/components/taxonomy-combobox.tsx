"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TaxonomyOption } from "@/types/gift";

function useDebounced(value: string, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function TaxonomyCombobox({
  value,
  onChange,
  placeholder,
  disabled,
  queryKey,
  loadItems,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  queryKey: (q: string) => readonly unknown[];
  loadItems: (q: string) => Promise<TaxonomyOption[]>;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [valueSnapshot, setValueSnapshot] = useState(value);
  const [highlighted, setHighlighted] = useState(0);
  const debounced = useDebounced(query);

  if (value !== valueSnapshot) {
    setValueSnapshot(value);
    setQuery(value);
  }

  const enabled = open && !disabled;
  const { data, isFetching } = useQuery({
    queryKey: queryKey(debounced.trim()),
    queryFn: () => loadItems(debounced.trim()),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });

  const options = useMemo(() => data ?? [], [data]);
  const trimmed = query.trim();
  const canCreate =
    trimmed.length > 0 &&
    !options.some((o) => o.name.toLowerCase() === trimmed.toLowerCase());
  const rows = canCreate
    ? [
        ...options.map((o) => ({ kind: "option" as const, option: o })),
        { kind: "create" as const },
      ]
    : options.map((o) => ({ kind: "option" as const, option: o }));

  const highlightKey = `${debounced}:${options.length}:${canCreate ? 1 : 0}`;
  const [highlightSnapshot, setHighlightSnapshot] = useState(highlightKey);
  if (highlightKey !== highlightSnapshot) {
    setHighlightSnapshot(highlightKey);
    setHighlighted(0);
  }

  const commit = (next: string) => {
    onChange(next);
    setQuery(next);
    setOpen(false);
  };

  const pickHighlighted = () => {
    const row = rows[highlighted];
    if (!row) {
      commit(trimmed);
      return;
    }
    if (row.kind === "create") commit(trimmed);
    else commit(row.option.name);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false);
          if (query !== value) onChange(query);
        }
      }}
    >
      <Input
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${highlighted}` : undefined}
        value={query}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          if (!disabled) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setHighlighted((i) =>
              Math.min(i + 1, Math.max(rows.length - 1, 0)),
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setHighlighted((i) => Math.max(i - 1, 0));
          } else if (event.key === "Enter" && open) {
            event.preventDefault();
            pickHighlighted();
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="pr-8"
      />
      <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />

      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {isFetching && options.length === 0 && (
            <li className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Searching…
            </li>
          )}
          {!isFetching && rows.length === 0 && (
            <li className="px-2 py-2 text-sm text-muted-foreground">
              {trimmed
                ? "No matches — keep typing to add it."
                : "Start typing to search."}
            </li>
          )}
          {rows.map((row, i) => {
            const active = i === highlighted;
            if (row.kind === "create") {
              return (
                <li
                  key="create"
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={active}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => commit(trimmed)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                      active && "bg-accent text-accent-foreground",
                    )}
                  >
                    <Plus className="size-3.5 shrink-0" />
                    Use “{trimmed}”
                  </button>
                </li>
              );
            }
            return (
              <li
                key={row.option.slug}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => commit(row.option.name)}
                  className={cn(
                    "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm",
                    active && "bg-accent text-accent-foreground",
                  )}
                >
                  {row.option.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
