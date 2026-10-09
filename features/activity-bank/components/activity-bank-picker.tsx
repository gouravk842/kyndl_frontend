"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { fetchActivityBank } from "../api";
import type { BankItem, BankKind } from "../types";

export function ActivityBankPicker({
  open,
  onClose,
  onPick,
  includeAdult = false,
  initialKind = "",
  choiceCount,
  openOnly = false,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (items: BankItem[]) => void;
  /** Red Zone builders pass true so Sexual lines are listed. */
  includeAdult?: boolean;
  initialKind?: BankKind | "";
  /** When set, only truths with this many answer choices are listed. */
  choiceCount?: number;
  /** Hide multiple-choice truths. Used by games that want an open question. */
  openOnly?: boolean;
}) {
  const [kind, setKind] = useState<BankKind | "">(
    choiceCount ? "truth" : initialKind,
  );
  const [type, setType] = useState("");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const query = useQuery({
    queryKey: ["activity-bank", includeAdult, kind, type, tag],
    enabled: open,
    queryFn: () =>
      fetchActivityBank({
        includeAdult,
        kind: choiceCount ? "truth" : kind,
        type,
        tags: tag ? [tag] : [],
      }),
  });

  const items = useMemo(() => {
    const rows = query.data?.items ?? [];
    if (choiceCount)
      return rows.filter((row) => row.choices.length === choiceCount);
    if (openOnly) return rows.filter((row) => row.choices.length === 0);
    return rows;
  }, [query.data, choiceCount, openOnly]);

  if (!open) return null;

  function toggle(id: number) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function confirm() {
    const chosen = items.filter((item) => selected.includes(item.id));
    if (chosen.length) onPick(chosen);
    setSelected([]);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/55 p-3 sm:items-center"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[#1a1214] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="font-display text-lg">From the bank</p>
            <p className="text-xs text-white/50">
              Pick lines, or close this and write your own.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/60 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-white/10 px-4 py-3">
          <Filter
            label="Truth or dare"
            value={choiceCount ? "truth" : kind}
            disabled={Boolean(choiceCount)}
            onChange={(value) => setKind(value as BankKind | "")}
            options={[
              { value: "", label: "Either" },
              { value: "truth", label: "Truth" },
              { value: "dare", label: "Dare" },
            ]}
          />
          <Filter
            label="Type"
            value={type}
            onChange={setType}
            options={[
              { value: "", label: "Any type" },
              ...(query.data?.types ?? []).map((row) => ({
                value: row.slug,
                label: row.label,
              })),
            ]}
          />
          <Filter
            label="Tag"
            value={tag}
            onChange={setTag}
            options={[
              { value: "", label: "Any tag" },
              ...(query.data?.tags ?? []).map((row) => ({
                value: row.slug,
                label: row.label,
              })),
            ]}
          />
        </div>

        <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
          {query.isLoading && (
            <li className="py-8 text-center text-sm text-white/45">
              Loading the bank…
            </li>
          )}
          {query.isError && (
            <li className="py-8 text-center text-sm text-white/55">
              The bank could not be loaded. You can still write your own.
            </li>
          )}
          {query.isSuccess && items.length === 0 && (
            <li className="py-8 text-center text-sm text-white/45">
              Nothing matches these filters.
            </li>
          )}
          {items.map((item) => {
            const on = selected.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={`flex w-full gap-3 rounded-xl border px-3 py-2.5 text-left ${
                    on
                      ? "border-[#ff8fae] bg-white/10"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : null}
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-semibold tracking-wide text-[#ff8fae] uppercase">
                      {item.kind} · {item.type.label}
                      {item.tags.length
                        ? ` · ${item.tags.map((row) => row.label).join(", ")}`
                        : ""}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-white/90">
                      {item.text}
                    </span>
                    {item.detail ? (
                      <span className="mt-0.5 block text-xs text-white/50">
                        {item.detail}
                      </span>
                    ) : null}
                    {item.choices.length > 0 ? (
                      <span className="mt-1 block text-xs text-white/55">
                        {item.choices.join("  /  ")}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          <span className="text-xs text-white/45">
            {selected.length} selected
          </span>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={confirm}
            className="rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#c81d4e] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Add selected
          </button>
        </div>
      </div>
    </div>
  );
}

function Filter({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-[0.65rem] text-white/45">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-[#120c0e] px-2 py-1.5 text-xs text-white"
      >
        {options.map((option) => (
          <option key={option.value || "any"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
