"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import {
  KyndButton,
  KyndTextButton,
} from "@/features/kynd/components/kynd-button";
import { KyndCard } from "@/features/kynd/components/kynd-card";
import { KyndEmpty } from "@/features/kynd/components/kynd-empty";
import { KyndShell } from "@/features/kynd/components/kynd-shell";
import { NoticeSheet } from "@/features/kynd/components/notice-sheet";
import { PersonSheet } from "@/features/kynd/components/person-sheet";
import {
  isPersonId,
  KYND_CATEGORIES,
  littleThingsLabel,
  relationshipLabel,
} from "@/features/kynd/lib/catalog";
import {
  useCreateKyndItem,
  useDeleteKyndItem,
  useDeleteKyndPerson,
  useKyndItems,
  useKyndPerson,
  useUpdateKyndItem,
  useUpdateKyndPerson,
} from "@/hooks/use-kynd";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import type { KyndCategory, KyndItem, RelationshipType } from "@/types/kynd";

function useDebounced(value: string, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function KyndPerson({ personId }: { personId: string }) {
  const router = useRouter();
  const valid = isPersonId(personId);
  const person = useKyndPerson(valid ? personId : "");
  const updatePerson = useUpdateKyndPerson(personId);
  const removePerson = useDeleteKyndPerson();
  const createItem = useCreateKyndItem(personId);
  const updateItem = useUpdateKyndItem(personId);
  const removeItem = useDeleteKyndItem(personId);

  const [draft, setDraft] = useState("");
  const query = useDebounced(draft);
  const [category, setCategory] = useState("");
  const itemsQuery = useKyndItems(valid ? personId : "", {
    q: query,
    category,
  });

  const [personOpen, setPersonOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [editing, setEditing] = useState<KyndItem | null>(null);
  const [confirmItem, setConfirmItem] = useState(false);

  const profile = person.data;
  const items = useMemo(
    () => itemsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [itemsQuery.data],
  );

  useEffect(() => {
    if (!profile) return;
    const previous = document.title;
    document.title = `${profile.name} · Kynd`;
    return () => {
      document.title = previous;
    };
  }, [profile]);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id.startsWith("item-")) return;
    document.getElementById(id)?.scrollIntoView({ block: "center" });
  }, [items]);

  if (!valid) {
    return (
      <KyndShell width="portrait">
        <MissingPerson />
      </KyndShell>
    );
  }

  if (person.isPending) {
    return (
      <KyndShell width="portrait">
        <div className="h-16 w-64 animate-pulse rounded-md bg-[#eadfd4] motion-reduce:animate-none dark:bg-white/10" />
      </KyndShell>
    );
  }

  if (person.isError) {
    const missing = (person.error as ApiError)?.status === 404;
    return (
      <KyndShell width="portrait">
        {missing ? (
          <MissingPerson />
        ) : (
          <KyndEmpty
            title="This didn't load."
            body="Check your connection, then try again."
            action={{ label: "Try again", onClick: () => person.refetch() }}
          />
        )}
      </KyndShell>
    );
  }

  if (!profile) return null;

  const filtering = Boolean(query.trim() || category);
  const hasCollection = profile.item_count > 0 || items.length > 0 || filtering;
  const listSettled = itemsQuery.isSuccess && !itemsQuery.isFetching;
  const noRows = listSettled && items.length === 0;
  const emptyPerson = noRows && !filtering;
  const busy =
    createItem.isPending || updateItem.isPending || removeItem.isPending;

  async function keep(input: {
    body: string;
    title: string;
    category: KyndCategory;
  }) {
    if (editing) {
      try {
        await updateItem.mutateAsync({
          id: editing.id,
          ...input,
          expected_updated_at: editing.updated_at,
        });
        setNoticeOpen(false);
        setEditing(null);
      } catch (error) {
        if ((error as ApiError)?.status === 409) {
          setNoticeOpen(false);
          setEditing(null);
        }
      }
      return;
    }
    try {
      const created = await createItem.mutateAsync({
        body: input.body,
        title: input.title,
        category: input.category,
      });
      setNoticeOpen(false);
      setDraft("");
      if (!created.category) setCategory("");
      else if (category && category !== created.category)
        setCategory(created.category);
    } catch {
      // The hook already explains what happened.
    }
  }

  async function savePerson(input: {
    name: string;
    relationship_type: RelationshipType;
  }) {
    try {
      await updatePerson.mutateAsync({
        ...input,
        expected_updated_at: profile?.updated_at,
      });
      setPersonOpen(false);
    } catch (error) {
      if ((error as ApiError)?.status === 409) setPersonOpen(false);
    }
  }

  return (
    <KyndShell width="portrait">
      <Link
        href={ROUTES.kynd}
        className="inline-flex min-h-11 items-center text-sm text-[#6b564c] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] dark:text-[#cbb8ad]"
      >
        Kynd
      </Link>

      <header className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-5xl leading-[0.95] text-balance wrap-break-word sm:text-7xl">
            {profile.name}
          </h1>
          <p className="mt-4 text-sm text-[#5c4a43] dark:text-[#cbb8ad]">
            {relationshipLabel(profile.relationship_type)}
            <span aria-hidden> · </span>
            {littleThingsLabel(profile.item_count)}
          </p>
          <p className="mt-2 text-sm text-[#6b564c] dark:text-[#cbb8ad]">
            Things I know about them.
          </p>
          <div className="mt-1 flex items-center gap-1">
            <KyndTextButton
              className="px-0"
              onClick={() => setPersonOpen(true)}
            >
              Edit
            </KyndTextButton>
            <Link
              href={ROUTES.kyndPersonAsk(profile.id)}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-[#5c4a43] underline-offset-4 hover:text-[#2c2420] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] dark:text-[#cbb8ad] dark:hover:text-[#f6efe9]"
            >
              Ask Kynd
            </Link>
          </div>
        </div>
        <KyndButton
          className="hidden sm:inline-flex"
          onClick={() => {
            setEditing(null);
            setNoticeOpen(true);
          }}
        >
          Add to Kynd
        </KyndButton>
      </header>

      {hasCollection ? (
        <div className="mt-10">
          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="kynd-search" className="sr-only">
              Search little things about {profile.name}
            </label>
            <input
              id="kynd-search"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search little things"
              className="h-12 w-full border-b border-[#eadfd4] bg-transparent text-base focus:border-[#8e1020] focus:outline-none dark:border-white/15"
            />
          </form>
          <div
            role="group"
            aria-label="Filter little things"
            className="mt-4 flex flex-wrap gap-x-4 gap-y-1"
          >
            <FilterButton
              pressed={category === ""}
              onClick={() => setCategory("")}
            >
              Everything
            </FilterButton>
            {KYND_CATEGORIES.map((option) => (
              <FilterButton
                key={option.value}
                pressed={category === option.value}
                onClick={() =>
                  setCategory(category === option.value ? "" : option.value)
                }
              >
                {option.label}
              </FilterButton>
            ))}
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {itemsQuery.isSuccess
          ? `${items.length} little ${items.length === 1 ? "thing" : "things"}`
          : ""}
      </p>

      {emptyPerson ? (
        <KyndEmpty
          title="Nothing here yet."
          body="Start with something small you've noticed about them."
          action={{
            label: "Notice something",
            onClick: () => {
              setEditing(null);
              setNoticeOpen(true);
            },
          }}
        />
      ) : null}

      {items.length === 0 && itemsQuery.isFetching && !itemsQuery.isError ? (
        <div className="mt-12 space-y-4" aria-hidden>
          <div className="h-28 animate-pulse rounded-[1.6rem] bg-[#eadfd4] motion-reduce:animate-none dark:bg-white/10" />
          <div className="h-20 w-2/3 animate-pulse rounded-[1.6rem] bg-[#eadfd4] motion-reduce:animate-none dark:bg-white/10" />
        </div>
      ) : null}

      {itemsQuery.isError ? (
        <KyndEmpty
          title="This didn't load."
          body="Check your connection, then try again."
          action={{ label: "Try again", onClick: () => itemsQuery.refetch() }}
        />
      ) : null}

      {noRows && query.trim() ? (
        <KyndEmpty title="Couldn't find that." body="Try another word." />
      ) : null}

      {noRows && !query.trim() && category ? (
        <KyndEmpty title="Nothing here yet." />
      ) : null}

      {items.length > 0 ? (
        <ul className={cn("mt-10 pb-28 sm:pb-0", columnClass(items.length))}>
          {items.map((item, index) => (
            <li key={item.id} className="mb-4 break-inside-avoid">
              <KyndCard
                item={item}
                lead={index === 0 && items.length > 2}
                onEdit={(next) => {
                  setEditing(next);
                  setNoticeOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {itemsQuery.hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <KyndTextButton
            onClick={() => itemsQuery.fetchNextPage()}
            disabled={itemsQuery.isFetchingNextPage}
          >
            {itemsQuery.isFetchingNextPage ? "Looking…" : "More little things"}
          </KyndTextButton>
        </div>
      ) : null}

      {hasCollection ? (
        <div className="sticky bottom-4 z-10 mt-6 flex justify-center sm:hidden">
          <KyndButton
            onClick={() => {
              setEditing(null);
              setNoticeOpen(true);
            }}
          >
            Add to Kynd
          </KyndButton>
        </div>
      ) : null}

      <NoticeSheet
        open={noticeOpen}
        personName={profile.name}
        item={editing}
        busy={busy}
        onClose={() => {
          setNoticeOpen(false);
          setEditing(null);
        }}
        onKeep={keep}
        onDelete={editing ? () => setConfirmItem(true) : undefined}
      />
      <PersonSheet
        open={personOpen}
        person={profile}
        busy={updatePerson.isPending || removePerson.isPending}
        onClose={() => setPersonOpen(false)}
        onSave={savePerson}
        onDelete={async () => {
          try {
            await removePerson.mutateAsync(profile.id);
            router.push(ROUTES.kynd);
          } catch {
            // The hook already explains what happened.
          }
        }}
      />
      <ConfirmDialog
        open={confirmItem}
        onOpenChange={setConfirmItem}
        title="Let this one go?"
        description="It will leave their Kynd. Only you had it."
        confirmLabel="Remove"
        destructive
        busy={removeItem.isPending}
        onConfirm={async () => {
          if (!editing) return;
          try {
            await removeItem.mutateAsync(editing.id);
            setConfirmItem(false);
            setNoticeOpen(false);
            setEditing(null);
          } catch {
            setConfirmItem(false);
          }
        }}
      />
    </KyndShell>
  );
}

function MissingPerson() {
  return (
    <div>
      <KyndEmpty
        level="h1"
        title="This person isn't in your Kynd."
        body="They may have been removed, or the link is no longer right."
      />
      <Link
        href={ROUTES.kynd}
        className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline"
      >
        Back to Kynd
      </Link>
    </div>
  );
}

function FilterButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "min-h-11 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]",
        pressed
          ? "text-[#2c2420] underline decoration-[#8e1020] decoration-2 underline-offset-8 dark:text-[#f6efe9]"
          : "text-[#6b564c] dark:text-[#cbb8ad]",
      )}
    >
      {children}
    </button>
  );
}

function columnClass(count: number) {
  if (count <= 1) return "columns-1 max-w-md";
  if (count <= 3) return "columns-1 gap-4 sm:columns-2";
  return "columns-1 gap-4 sm:columns-2 xl:columns-3";
}
