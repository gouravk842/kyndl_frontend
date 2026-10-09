"use client";

import { MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UsedIn } from "@/features/memory-bank/convert/used-in";
import { bankColor } from "@/features/memory-bank/lib/bank-color";
import {
  bankStreakLine,
  bankWarmthShadow,
} from "@/features/memory-bank/lib/hearth";
import {
  KeepsakeFace,
  memoryCoverSrc,
} from "@/features/memory-bank/lib/keepsake-face";
import {
  formatMemoryDay,
  previewLine,
} from "@/features/memory-bank/lib/preview";
import { polaroidTilt } from "@/features/memory-bank/solar/solar-caption";
import type { BankMemory, MemoryCircle } from "@/types/memory-bank";

function matchBank(circle: MemoryCircle, needle: string) {
  if (!needle) return true;
  return circle.name.toLowerCase().includes(needle);
}

function matchMemory(memory: BankMemory, needle: string) {
  if (!needle) return true;
  return (
    memory.title.toLowerCase().includes(needle) ||
    memory.note.toLowerCase().includes(needle)
  );
}

function sortMemories(memories: BankMemory[]) {
  return memories.slice().sort((a, b) => {
    const ad = a.occurred_on || a.created_at;
    const bd = b.occurred_on || b.created_at;
    return bd.localeCompare(ad);
  });
}

function formatUpdated(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MemoryBankList({
  inside,
  banks,
  memories,
  needle,
  searching,
  filterIds,
  onOpenBank,
  onOpenMemory,
  onKeep,
  onConvertBank,
}: {
  inside: boolean;
  banks: MemoryCircle[];
  memories: BankMemory[];
  needle: string;
  searching: boolean;
  filterIds?: string[] | null;
  onOpenBank: (id: string) => void;
  onOpenMemory: (index: number) => void;
  onKeep: () => void;
  onConvertBank?: (bank: MemoryCircle) => void;
}) {
  if (inside) {
    const scoped = filterIds
      ? memories.filter((memory) => filterIds.includes(memory.id))
      : memories;
    const rows = sortMemories(scoped);
    const visible = searching
      ? rows.filter((memory) => matchMemory(memory, needle))
      : rows;
    if (!memories.length) {
      return (
        <div className="mx-auto max-w-lg px-4 pt-20 pb-32 text-center md:pt-24 md:pb-24">
          <p className="font-display text-2xl text-[var(--mb-solar-ink)]">
            Keep the first one.
          </p>
          <p className="mt-2 text-sm text-[var(--mb-solar-muted)]">
            A title is enough. Photos can wait.
          </p>
          <Button className="mt-5 min-h-11" onClick={onKeep}>
            <Plus className="size-4" />
            Keep
          </Button>
        </div>
      );
    }
    return (
      <ul className="mx-auto flex max-w-2xl flex-col gap-2 px-4 pt-20 pb-32 md:pt-24 md:pb-24">
        {visible.map((memory) => {
          const index = memories.indexOf(memory);
          const cover = memoryCoverSrc(memory);
          const line = previewLine(memory);
          const tilt = polaroidTilt(memory.id);
          return (
            <li key={memory.id}>
              <button
                type="button"
                onClick={() => onOpenMemory(index)}
                className="flex min-h-11 w-full items-center gap-3 rounded-2xl border border-[var(--mb-solar-line)] bg-[#FFF7F1] px-3 py-3 text-left hover:border-[var(--mb-solar-orbit-strong)] dark:bg-[#221B19]"
              >
                <span
                  className="size-14 shrink-0 overflow-hidden rounded-[4px] border-2 border-[#FFF7F1] bg-[#FFF1E8] shadow-[0_4px_10px_rgba(58,42,37,0.12)]"
                  style={{ transform: `rotate(${tilt}deg)` }}
                >
                  <KeepsakeFace src={cover} seed={memory.id} />
                </span>
                <span className="min-w-0 flex-1">
                  {memory.occurred_on ? (
                    <span className="block text-[11px] tracking-wide text-[#C75B39] uppercase">
                      {formatMemoryDay(memory.occurred_on)}
                    </span>
                  ) : null}
                  <span className="block truncate font-display text-sm text-[var(--mb-solar-ink)]">
                    {line}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  const named = banks.filter((bank) => !bank.is_loose);
  const visible = searching
    ? banks.filter((bank) => matchBank(bank, needle))
    : banks;

  if (!named.length && !searching) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 pb-32 text-center md:pt-24 md:pb-24">
        <p className="font-display text-2xl text-[var(--mb-solar-ink)]">
          Name someone. Keep something.
        </p>
        <p className="mt-2 text-sm text-[var(--mb-solar-muted)]">
          Planets are banks. Moons are memories.
        </p>
        <Button className="mt-5 min-h-11" onClick={onKeep}>
          <Plus className="size-4" />
          Add
        </Button>
        {visible.length ? (
          <ul className="mt-10 flex flex-col gap-2 text-left">
            {visible.map((bank) => (
              <BankRow
                key={bank.id}
                bank={bank}
                onOpen={onOpenBank}
                onConvert={onConvertBank}
              />
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (!visible.length) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 pb-32 text-center md:pt-24 md:pb-24">
        <p className="text-sm text-[var(--mb-solar-muted)]">No banks match.</p>
      </div>
    );
  }

  return (
    <ul className="mx-auto grid max-w-3xl gap-3 px-4 pt-20 pb-32 sm:grid-cols-2 md:pt-24 md:pb-24">
      {visible.map((bank) => (
        <li key={bank.id}>
          <BankRow bank={bank} onOpen={onOpenBank} onConvert={onConvertBank} />
        </li>
      ))}
    </ul>
  );
}

function BankRow({
  bank,
  onOpen,
  onConvert,
}: {
  bank: MemoryCircle;
  onOpen: (id: string) => void;
  onConvert?: (bank: MemoryCircle) => void;
}) {
  const color = bankColor(bank.id, bank.is_loose);
  const warmth = bankWarmthShadow(bank.warmth, bank.streak);
  const streak = bankStreakLine(bank);
  return (
    <div className="flex min-h-11 w-full items-center gap-1 rounded-2xl border border-[var(--mb-solar-line)] bg-[#FFF7F1] py-2 pr-2 pl-4 hover:border-[var(--mb-solar-orbit-strong)] dark:bg-[#221B19]">
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onOpen(bank.id)}
          className="flex min-h-11 w-full items-center gap-3 py-2 text-left"
        >
          <span
            className="size-12 shrink-0 overflow-hidden rounded-full"
            style={{
              background: color.fill,
              boxShadow: warmth ?? "0 6px 16px rgba(58,42,37,0.16)",
            }}
            aria-hidden
          >
            <KeepsakeFace src={bank.cover?.url} seed={bank.id} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-lg text-[var(--mb-solar-ink)]">
              {bank.name}
            </span>
            <span className="block text-xs text-[var(--mb-solar-muted)]">
              {bank.is_loose
                ? "Unfiled"
                : bank.memory_count === 1
                  ? "1 memory"
                  : `${bank.memory_count} memories`}
              {streak ? ` · ${streak}` : ""}
              {bank.updated_at ? ` · ${formatUpdated(bank.updated_at)}` : ""}
            </span>
          </span>
        </button>
        <div className="pl-[3.75rem]">
          <UsedIn conversions={bank.conversions} />
        </div>
      </div>
      {onConvert ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                aria-label={`More for ${bank.name}`}
                className="size-11 shrink-0 rounded-full"
              >
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onConvert(bank)}>
              Convert to feature
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
