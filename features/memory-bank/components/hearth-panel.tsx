"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  flameCopy,
  HEARTH_BOARDS,
  type HearthBoardId,
} from "@/features/memory-bank/lib/hearth";
import { useStreakLeaderboard, useUpdateStreak } from "@/hooks/use-memory-bank";
import { cn } from "@/lib/utils";
import type { MemoryStreak } from "@/types/memory-bank";

export function HearthPanel({
  open,
  onOpenChange,
  streak,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streak: MemoryStreak | undefined;
}) {
  const [board, setBoard] = useState<HearthBoardId>("current");
  const [isPublic, setIsPublic] = useState(false);
  const [name, setName] = useState("");
  const update = useUpdateStreak();
  const standings = useStreakLeaderboard(board, open);
  const copy = flameCopy(
    streak?.state ?? "out",
    streak?.current_streak ?? 0,
    Boolean(streak?.kept_today),
  );

  useEffect(() => {
    if (!streak) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- copy the saved hearth into the form
    setIsPublic(streak.public);

    setName(streak.public_name || streak.suggested_name || "");
  }, [streak]);

  const entries = standings.data?.entries ?? [];
  const you = standings.data?.you;
  const pinned = you && !entries.some((row) => row.is_you) ? you : null;
  const warmBanks = (streak?.banks ?? []).filter((bank) => bank.streak > 0);

  function save() {
    update.mutate({ public: isPublic, public_name: name.trim() });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-[#FFF7F1] sm:max-w-md dark:bg-[#221B19]"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-2xl text-[var(--mb-solar-ink)]">
            Hearth
          </SheetTitle>
          <SheetDescription className="text-[var(--mb-solar-muted)]">
            A day counts when you keep a memory. One quiet day holds the flame.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-8">
          <div>
            <p className="font-display text-4xl text-[#C75B39]">{copy.title}</p>
            <p className="mt-1 text-sm text-[var(--mb-solar-muted)]">
              {copy.body}
            </p>
            {streak && streak.longest_streak > 0 ? (
              <p className="mt-2 text-xs text-[var(--mb-solar-muted)]">
                Longest kept · {streak.longest_streak}{" "}
                {streak.longest_streak === 1 ? "day" : "days"}
                {streak.milestone ? ` · ${streak.milestone}` : ""}
              </p>
            ) : null}
          </div>

          {warmBanks.length ? (
            <ul className="flex flex-col gap-1">
              {warmBanks.map((bank) => (
                <li
                  key={bank.circle_id}
                  className="flex items-center justify-between text-sm text-[var(--mb-solar-ink)]"
                >
                  <span className="truncate">{bank.name}</span>
                  <span className="shrink-0 text-xs text-[#C75B39]">
                    {bank.warmth === "ember" ? "Quiet · " : ""}
                    {bank.streak} {bank.streak === 1 ? "day" : "days"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <form
            className="flex flex-col gap-3 rounded-2xl border border-[var(--mb-solar-line)] p-3"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <label className="flex min-h-11 items-center gap-3 text-sm text-[var(--mb-solar-ink)]">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="size-4 accent-[#C75B39]"
              />
              Show my streak on the board
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--mb-solar-muted)]">
              Name on the board
              <Input
                value={name}
                maxLength={24}
                onChange={(event) => setName(event.target.value)}
                aria-label="Name on the board"
                className="h-11"
              />
            </label>
            <p className="text-xs text-[var(--mb-solar-muted)]">
              Only this name and your numbers are public. Memories stay yours.
            </p>
            <Button type="submit" className="h-11" disabled={update.isPending}>
              {update.isPending ? "Saving" : "Save"}
            </Button>
          </form>

          <div>
            <div
              className="flex gap-1"
              role="tablist"
              aria-label="Leaderboards"
            >
              {HEARTH_BOARDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={board === item.id}
                  onClick={() => setBoard(item.id)}
                  className={cn(
                    "min-h-11 flex-1 rounded-full px-2 text-xs",
                    board === item.id
                      ? "bg-[#C75B39] text-white"
                      : "text-[var(--mb-solar-muted)] hover:text-[var(--mb-solar-ink)]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <ol className="mt-3 flex flex-col gap-1">
              {standings.isPending ? (
                <li className="py-3 text-sm text-[var(--mb-solar-muted)]">
                  Loading the board.
                </li>
              ) : null}
              {!standings.isPending && !entries.length ? (
                <li className="py-3 text-sm text-[var(--mb-solar-muted)]">
                  No one is on this board yet.
                </li>
              ) : null}
              {entries.map((row) => (
                <li key={`${row.rank}-${row.public_name}`}>
                  <BoardRow
                    rank={row.rank}
                    name={row.public_name}
                    value={row.value}
                    yours={row.is_you}
                  />
                </li>
              ))}
              {pinned ? (
                <li>
                  <BoardRow
                    rank={pinned.rank}
                    name={pinned.public_name}
                    value={pinned.value}
                    yours
                  />
                </li>
              ) : null}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function BoardRow({
  rank,
  name,
  value,
  yours,
}: {
  rank: number;
  name: string;
  value: number;
  yours: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm",
        yours && "bg-[#C75B39]/10",
      )}
    >
      <span className="w-6 text-xs text-[var(--mb-solar-muted)]">{rank}</span>
      <span className="min-w-0 flex-1 truncate text-[var(--mb-solar-ink)]">
        {name}
        {yours ? " · you" : ""}
      </span>
      <span className="text-[#C75B39]">{value}</span>
    </div>
  );
}
