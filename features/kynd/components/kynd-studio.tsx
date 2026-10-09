"use client";

import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Conversation } from "@/features/kynd/components/kynd-chat";
import { KyndEmpty } from "@/features/kynd/components/kynd-empty";
import { KyndGraph } from "@/features/kynd/components/kynd-graph";
import { NoticeSheet } from "@/features/kynd/components/notice-sheet";
import { PersonSheet } from "@/features/kynd/components/person-sheet";
import { monogram, relationshipLabel } from "@/features/kynd/lib/catalog";
import {
  useCreateKyndItem,
  useCreateKyndPerson,
  useDeleteKyndItem,
  useDeleteKyndPerson,
  useKyndChat,
  useKyndItems,
  useKyndPeople,
  useUpdateKyndItem,
  useUpdateKyndPerson,
} from "@/hooks/use-kynd";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/api";
import type { KyndCategory, KyndItem, RelationshipType } from "@/types/kynd";

export function KyndStudio() {
  const people = useKyndPeople();
  const rows = people.data ?? [];
  const [picked, setPicked] = useState<string | "all" | null>(null);
  const [tab, setTab] = useState<"talk" | "graph">("talk");
  const [prefill, setPrefill] = useState<{ id: number; text: string } | null>(
    null,
  );
  const [personOpen, setPersonOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [editing, setEditing] = useState<KyndItem | null>(null);
  const [confirmItem, setConfirmItem] = useState(false);

  const focusId =
    picked === "all"
      ? null
      : picked && rows.some((person) => person.id === picked)
        ? picked
        : (rows[0]?.id ?? null);
  const person = rows.find((row) => row.id === focusId) ?? null;

  const chat = useKyndChat(focusId);
  const itemsQuery = useKyndItems(focusId ?? "", {});
  const createPerson = useCreateKyndPerson();
  const updatePerson = useUpdateKyndPerson(focusId ?? "");
  const removePerson = useDeleteKyndPerson();
  const createItem = useCreateKyndItem(focusId ?? "");
  const updateItem = useUpdateKyndItem(focusId ?? "");
  const removeItem = useDeleteKyndItem(focusId ?? "");

  const items = useMemo(
    () => itemsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [itemsQuery.data],
  );
  const lit = useMemo(() => {
    const messages = chat.history.data?.messages ?? [];
    const last = [...messages]
      .reverse()
      .find((message) => message.role === "kynd" && message.items.length > 0);
    return new Set(last?.items.map((item) => item.id) ?? []);
  }, [chat.history.data]);

  const busy =
    createItem.isPending || updateItem.isPending || removeItem.isPending;

  function choose(id: string | "all") {
    setPicked(id);
  }

  function editItem(item: KyndItem) {
    setEditing(item);
    setNoticeOpen(true);
  }

  function askAbout(item: KyndItem) {
    const subject = item.title || item.body;
    setPrefill({
      id: Date.now(),
      text: `What should I remember about ${subject}?`,
    });
    setTab("talk");
  }

  async function savePerson(input: {
    name: string;
    relationship_type: RelationshipType;
  }) {
    if (creating || !person) {
      try {
        const created = await createPerson.mutateAsync(input);
        setPersonOpen(false);
        setCreating(false);
        setPicked(created.id);
        setTab("talk");
      } catch {
        // The hook already explains what happened.
      }
      return;
    }
    try {
      await updatePerson.mutateAsync({
        ...input,
        expected_updated_at: person.updated_at,
      });
      setPersonOpen(false);
    } catch (error) {
      if ((error as ApiError)?.status === 409) setPersonOpen(false);
    }
  }

  async function keep(input: {
    body: string;
    title: string;
    category: KyndCategory;
  }) {
    if (!focusId) return;
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
      await createItem.mutateAsync(input);
      setNoticeOpen(false);
    } catch {
      // The hook already explains what happened.
    }
  }

  return (
    <div className="-m-6 flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-[#f6f0e9] text-[#2c2420] dark:bg-[#161311] dark:text-[#f6efe9]">
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-[#eadfd4] px-4 py-3 dark:border-white/10">
        <PersonChip
          pressed={focusId === null && picked === "all"}
          label="Everyone"
          detail="Ask across your Kynd"
          onClick={() => choose("all")}
        />
        {rows.map((row, index) => (
          <PersonChip
            key={row.id}
            pressed={row.id === focusId}
            label={row.name}
            mark={monogram(row.name)}
            detail={relationshipLabel(row.relationship_type)}
            wash={PERSON_WASH[index % PERSON_WASH.length] ?? "#FBD3DE"}
            onClick={() => choose(row.id)}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setPersonOpen(true);
          }}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-dashed border-[#c4b2a6] px-4 text-sm text-[#5c4a43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] dark:text-[#cbb8ad]"
        >
          Add someone
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Kynd"
        className="mx-4 mt-3 flex max-w-sm shrink-0 rounded-full bg-white p-1 shadow-[0_8px_24px_-18px_rgba(58,42,37,0.45)] dark:bg-white/10"
      >
        <TabButton
          pressed={tab === "talk"}
          onClick={() => setTab("talk")}
          tone="bg-gradient-to-r from-[#FF7A59] to-[#F2596F]"
        >
          Chat
        </TabButton>
        <TabButton
          pressed={tab === "graph"}
          onClick={() => setTab("graph")}
          tone="bg-gradient-to-r from-[#F0A13D] to-[#F2596F]"
        >
          Graph
        </TabButton>
      </div>

      {people.isError ? (
        <KyndEmpty
          title="This didn't load."
          body="Check your connection, then try again."
          action={{ label: "Try again", onClick: () => people.refetch() }}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <section
            role="tabpanel"
            aria-label="Chat"
            className={cn(
              "min-h-0 flex-1 flex-col",
              tab === "talk" ? "flex" : "hidden",
            )}
          >
            <Conversation
              key={focusId ?? "all"}
              layout="pane"
              personId={focusId ?? undefined}
              name={person?.name}
              messages={chat.history.data?.messages ?? []}
              loading={chat.history.isPending}
              failed={chat.history.isError}
              onRetryLoad={() => chat.history.refetch()}
              asking={chat.ask.isPending}
              onAsk={(message) => chat.ask.mutateAsync(message)}
              prefill={prefill}
              onFocusPerson={(id) => choose(id)}
            />
          </section>
          <section
            role="tabpanel"
            aria-label="Graph"
            className={cn(
              "min-h-0 flex-1 flex-col",
              tab === "graph" ? "flex" : "hidden",
            )}
          >
            <KyndGraph
              people={rows}
              person={person}
              items={items}
              loading={Boolean(focusId) && itemsQuery.isPending}
              lit={lit}
              onSelectPerson={(id) => {
                choose(id);
                setTab("graph");
              }}
              onAdd={() => {
                setEditing(null);
                setNoticeOpen(true);
              }}
              onEdit={editItem}
              onEditPerson={() => {
                setCreating(false);
                setPersonOpen(true);
              }}
              onAsk={askAbout}
              hasMore={Boolean(itemsQuery.hasNextPage)}
              loadingMore={itemsQuery.isFetchingNextPage}
              onMore={() => itemsQuery.fetchNextPage()}
            />
          </section>
        </div>
      )}

      <PersonSheet
        open={personOpen}
        person={creating ? null : person}
        busy={createPerson.isPending || updatePerson.isPending}
        onClose={() => {
          setPersonOpen(false);
          setCreating(false);
        }}
        onSave={savePerson}
        onDelete={
          person && !creating
            ? async () => {
                try {
                  await removePerson.mutateAsync(person.id);
                  setPersonOpen(false);
                  setPicked("all");
                } catch {
                  // The hook already explains what happened.
                }
              }
            : undefined
        }
      />
      {person ? (
        <NoticeSheet
          open={noticeOpen}
          personName={person.name}
          item={editing}
          busy={busy}
          onClose={() => {
            setNoticeOpen(false);
            setEditing(null);
          }}
          onKeep={keep}
          onDelete={editing ? () => setConfirmItem(true) : undefined}
        />
      ) : null}
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
    </div>
  );
}

const PERSON_WASH = [
  "#FBD3DE",
  "#FDE7B8",
  "#FFD5C8",
  "#DCEAD6",
  "#F7C9D8",
  "#F3D7B0",
];

function PersonChip({
  pressed,
  label,
  detail,
  mark,
  wash = "#FBD3DE",
  onClick,
}: {
  pressed: boolean;
  label: string;
  detail: string;
  mark?: string;
  wash?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]",
        pressed
          ? "bg-[#8e1020] text-[#f6f0e9]"
          : "bg-white text-[#2c2420] dark:bg-white/10 dark:text-[#f6efe9]",
      )}
    >
      {mark ? (
        <span
          aria-hidden
          className={cn(
            "flex size-7 items-center justify-center rounded-full font-serif text-sm",
            pressed ? "bg-white/15" : "text-[#8e1020]",
          )}
          style={pressed ? undefined : { background: wash }}
        >
          {mark}
        </span>
      ) : null}
      <span>
        <span className="block text-sm leading-tight">{label}</span>
        <span
          className={cn(
            "block text-[11px] leading-tight",
            pressed ? "text-white/75" : "text-[#6b564c] dark:text-[#cbb8ad]",
          )}
        >
          {detail}
        </span>
      </span>
    </button>
  );
}

function TabButton({
  pressed,
  onClick,
  tone,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  tone: string;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={pressed}
      onClick={onClick}
      className={cn(
        "min-h-11 flex-1 rounded-full text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]",
        pressed ? cn(tone, "text-white") : "text-[#5c4a43] dark:text-[#cbb8ad]",
      )}
    >
      {children}
    </button>
  );
}
