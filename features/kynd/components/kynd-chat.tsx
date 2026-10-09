"use client";

import { useQueryClient } from "@tanstack/react-query";
import { SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type RefObject, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import {
  KyndButton,
  KyndTextButton,
} from "@/features/kynd/components/kynd-button";
import { KyndEmpty } from "@/features/kynd/components/kynd-empty";
import { KyndShell } from "@/features/kynd/components/kynd-shell";
import {
  categoryLabel,
  isPersonId,
  monogram,
} from "@/features/kynd/lib/catalog";
import { useKyndChat, useKyndPerson } from "@/hooks/use-kynd";
import { kyndService } from "@/services/kynd/kynd.service";
import type { KyndChatMessage, KyndChatOffer, KyndItem } from "@/types/kynd";

function suggestionsFor(name?: string) {
  if (name) {
    return [
      `What lipstick does ${name} like?`,
      `What's ${name}'s shoe size?`,
      `What's ${name}'s favourite food?`,
      `What does ${name} want?`,
      `What places does ${name} want to visit?`,
    ];
  }
  return [
    "What's my partner's lipstick?",
    "What's my partner's shoe size?",
    "What does Mom like?",
    "What do I know about Dad?",
    "What places does my partner want to visit?",
  ];
}

function savedLabel(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Saved";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Saved today";
  if (days === 1) return "Saved yesterday";
  if (days < 14) return `Saved ${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 8) {
    return weeks === 1 ? "Saved 1 week ago" : `Saved ${weeks} weeks ago`;
  }
  const months = Math.max(1, Math.round(days / 30));
  return months === 1 ? "Saved 1 month ago" : `Saved ${months} months ago`;
}

export function KyndChat({ personId }: { personId?: string }) {
  const valid = !personId || isPersonId(personId);
  const person = useKyndPerson(valid && personId ? personId : "");
  const chat = useKyndChat(valid ? (personId ?? null) : null, valid);

  if (!valid) {
    return (
      <KyndShell>
        <Missing />
      </KyndShell>
    );
  }

  if (personId && person.isPending) {
    return (
      <KyndShell>
        <div className="h-16 w-64 animate-pulse rounded-md bg-[#eadfd4] motion-reduce:animate-none dark:bg-white/10" />
      </KyndShell>
    );
  }

  if (personId && (person.isError || !person.data)) {
    return (
      <KyndShell>
        <Missing />
      </KyndShell>
    );
  }

  const name = person.data?.name;

  return (
    <KyndShell>
      <Conversation
        personId={personId}
        name={name}
        messages={chat.history.data?.messages ?? []}
        loading={chat.history.isPending}
        failed={chat.history.isError}
        onRetryLoad={() => chat.history.refetch()}
        asking={chat.ask.isPending}
        onAsk={(message) => chat.ask.mutateAsync(message)}
      />
    </KyndShell>
  );
}

export function Conversation({
  personId,
  name,
  messages,
  loading,
  failed,
  onRetryLoad,
  asking,
  onAsk,
  layout = "page",
  prefill,
  onFocusPerson,
}: {
  personId?: string;
  name?: string;
  messages: KyndChatMessage[];
  loading: boolean;
  failed: boolean;
  onRetryLoad: () => void;
  asking: boolean;
  onAsk: (message: string) => Promise<unknown>;
  layout?: "page" | "pane";
  prefill?: { id: number; text: string } | null;
  onFocusPerson?: (personId: string) => void;
}) {
  const pane = layout === "pane";
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [appliedPrefill, setAppliedPrefill] = useState(0);
  if (prefill && prefill.id !== appliedPrefill) {
    setAppliedPrefill(prefill.id);
    setDraft(prefill.text);
  }
  const [pending, setPending] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending, asking]);

  useEffect(() => {
    if (!appliedPrefill) return;
    fieldRef.current?.focus();
  }, [appliedPrefill]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || asking) return;
    setDraft("");
    setPending(message);
    setSendError(null);
    try {
      await onAsk(message);
      setPending(null);
    } catch {
      setPending(null);
      setDraft(message);
      setSendError("That didn't send.");
      fieldRef.current?.focus();
    }
  }

  async function keep(message: KyndChatMessage, offer: KyndChatOffer) {
    if (!message.person_id) return;
    setSaving(message.id);
    try {
      await kyndService.createItem(message.person_id, {
        body: offer.body,
        ...(offer.category ? { category: offer.category } : {}),
      });
      toast.success("Kept.");
      setDismissed((ids) => [...ids, message.id]);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.itemsRoot(message.person_id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.person(message.person_id),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.kynd.people(),
      });
    } catch {
      toast.error("Couldn't keep that.");
    } finally {
      setSaving(null);
    }
  }

  async function choosePerson(nextId: string, text: string) {
    try {
      await kyndService.askPerson(nextId, text);
      if (onFocusPerson) onFocusPerson(nextId);
      else router.push(ROUTES.kyndPersonAsk(nextId));
    } catch {
      toast.error("That didn't send.");
    }
  }

  const back = personId ? ROUTES.kyndPerson(personId) : ROUTES.kynd;
  const backLabel = name ?? "Kynd";
  const open = messages.length === 0 && !pending && !loading && !failed;

  return (
    <div
      className={
        pane
          ? "flex h-full min-h-0 flex-col"
          : "flex min-h-[calc(100dvh-8rem)] flex-col"
      }
    >
      {pane ? (
        <div className="flex h-full min-h-0 flex-col px-3 pt-3 pb-3 sm:px-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-[#F4C9C0] bg-white shadow-[0_24px_50px_-28px_rgba(242,89,111,0.45)] dark:border-white/10 dark:bg-[#1c1715]">
            <header className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#FF7A59] via-[#F2596F] to-[#E07A92] px-4 py-3 text-white">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white font-serif text-base text-[#F2596F]">
                {name ? monogram(name) : "K"}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {name ?? "Kynd"}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/85">
                  <span
                    className={
                      asking
                        ? "size-1.5 rounded-full bg-[#D7F5C8] motion-safe:animate-pulse"
                        : "size-1.5 rounded-full bg-[#D7F5C8]"
                    }
                  />
                  {asking ? "Looking that up" : "With you"}
                </span>
              </span>
            </header>
            <PaneThread
              open={open}
              name={name}
              loading={loading}
              failed={failed}
              onRetryLoad={onRetryLoad}
              onSuggest={send}
              messages={messages}
              pending={pending}
              asking={asking}
              personId={personId}
              dismissed={dismissed}
              saving={saving}
              onDismiss={(id) => setDismissed((ids) => [...ids, id])}
              onKeep={keep}
              onChoose={choosePerson}
              endRef={endRef}
            />
            <PaneComposer
              draft={draft}
              asking={asking}
              name={name}
              sendError={sendError}
              fieldRef={fieldRef}
              onDraft={setDraft}
              onSend={() => void send(draft)}
            />
          </div>
        </div>
      ) : (
        <header>
          <Link
            href={back}
            className="inline-flex min-h-11 items-center text-sm text-[#6b564c] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] dark:text-[#cbb8ad]"
          >
            {backLabel}
          </Link>
          <p className="mt-4 text-[11px] tracking-[0.22em] text-[#8e1020] uppercase dark:text-[#e7b2b8]">
            Kynd
          </p>
          <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[1.02] text-balance sm:text-6xl">
            {name ? `Ask Kynd about ${name}` : "Ask Kynd"}
          </h1>
          {open ? (
            <p className="mt-5 max-w-md font-serif text-2xl leading-snug text-[#5c4a43] italic dark:text-[#cbb8ad]">
              What would you like to remember?
            </p>
          ) : null}
        </header>
      )}

      {!pane ? (
        <>
          <div>
            {loading ? (
              <div className="mt-16 space-y-6" aria-hidden>
                <div className="h-8 w-40 animate-pulse rounded-md bg-[#eadfd4] motion-reduce:animate-none dark:bg-white/10" />
                <div className="h-28 animate-pulse rounded-[1.6rem] bg-[#eadfd4] motion-reduce:animate-none dark:bg-white/10" />
              </div>
            ) : null}

            {failed ? (
              <KyndEmpty
                title="This didn't load."
                body="Check your connection, then try again."
                action={{ label: "Try again", onClick: onRetryLoad }}
              />
            ) : null}

            {open ? (
              <ul className="mt-12 space-y-1">
                {suggestionsFor(name).map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => send(question)}
                      className="min-h-11 w-full rounded-2xl px-1 py-3 text-left font-serif text-xl leading-snug text-[#2c2420] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020] sm:text-2xl dark:text-[#f6efe9]"
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {messages.length > 0 ? (
              <ol className="mt-12 space-y-10" aria-live="polite">
                {messages.map((message, index) => {
                  const earlier = index > 0 ? messages[index - 1] : undefined;
                  return (
                    <li key={message.id}>
                      <Turn
                        message={message}
                        previous={earlier}
                        dismissed={dismissed.includes(message.id)}
                        saving={saving === message.id}
                        onDismiss={() =>
                          setDismissed((ids) => [...ids, message.id])
                        }
                        onKeep={(offer) => keep(message, offer)}
                        onChoose={(nextId) =>
                          choosePerson(
                            nextId,
                            earlier?.role === "user" ? earlier.body : "",
                          )
                        }
                      />
                    </li>
                  );
                })}
              </ol>
            ) : null}

            {pending ? (
              <div className="mt-10" aria-live="polite">
                <Turn
                  message={{
                    id: "pending",
                    role: "user",
                    body: pending,
                    kind: "user",
                    items: [],
                    offer_save: null,
                    clarification_people: null,
                    person_id: personId ?? null,
                    created_at: "",
                  }}
                />
                {asking ? (
                  <p className="mt-8 font-serif text-2xl text-[#6b564c] italic dark:text-[#cbb8ad]">
                    Looking through Kynd…
                  </p>
                ) : null}
              </div>
            ) : null}

            <div ref={endRef} />
          </div>

          <form
            className="sticky bottom-0 z-10 mt-auto bg-[#f6f0e9] pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:bg-[#161311]"
            onSubmit={(event) => {
              event.preventDefault();
              void send(draft);
            }}
          >
            <div className="border-t border-[#eadfd4] pt-4 dark:border-white/10">
              {sendError ? (
                <p className="mb-3 text-sm text-[#8e1020]" role="alert">
                  {sendError}{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => void send(draft)}
                  >
                    Try again
                  </button>
                </p>
              ) : null}
              <label htmlFor="kynd-ask" className="sr-only">
                {name ? `Ask Kynd about ${name}` : "Ask Kynd"}
              </label>
              <div className="flex items-end gap-3">
                <textarea
                  ref={fieldRef}
                  id="kynd-ask"
                  value={draft}
                  rows={Math.min(4, Math.max(1, draft.split("\n").length))}
                  disabled={asking}
                  placeholder={
                    name
                      ? "Ask me something about them..."
                      : "What do you want to remember?"
                  }
                  enterKeyHint="send"
                  autoComplete="off"
                  className="max-h-36 min-h-12 flex-1 resize-none bg-transparent py-3 text-base leading-relaxed focus:outline-none disabled:opacity-60"
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send(draft);
                    }
                  }}
                />
                <KyndButton type="submit" disabled={asking || !draft.trim()}>
                  {asking ? "Looking…" : "Ask"}
                </KyndButton>
              </div>
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
}

function bubbleTime(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function PaneThread({
  open,
  name,
  loading,
  failed,
  onRetryLoad,
  onSuggest,
  messages,
  pending,
  asking,
  personId,
  dismissed,
  saving,
  onDismiss,
  onKeep,
  onChoose,
  endRef,
}: {
  open: boolean;
  name?: string;
  loading: boolean;
  failed: boolean;
  onRetryLoad: () => void;
  onSuggest: (text: string) => void;
  messages: KyndChatMessage[];
  pending: string | null;
  asking: boolean;
  personId?: string;
  dismissed: string[];
  saving: string | null;
  onDismiss: (id: string) => void;
  onKeep: (message: KyndChatMessage, offer: KyndChatOffer) => void;
  onChoose: (personId: string, text: string) => void;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[linear-gradient(180deg,#FFF8F3_0%,#FFF0F4_55%,#FFF8EC_100%)] px-4 py-4 dark:bg-[#161311]">
      {loading ? (
        <div className="space-y-3" aria-hidden>
          <div className="h-10 w-40 animate-pulse rounded-2xl bg-[#FBD3DE] motion-reduce:animate-none" />
          <div className="ml-auto h-10 w-52 animate-pulse rounded-2xl bg-[#FFD5C8] motion-reduce:animate-none" />
        </div>
      ) : null}
      {failed ? (
        <KyndEmpty
          title="This didn't load."
          body="Check your connection, then try again."
          action={{ label: "Try again", onClick: onRetryLoad }}
        />
      ) : null}
      {open ? (
        <div className="mt-auto flex flex-col items-start gap-2">
          <p className="text-xs text-[#92786C]">Try one of these</p>
          {suggestionsFor(name).map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onSuggest(question)}
              className="max-w-[85%] rounded-2xl rounded-bl-md border border-[#F2DACE] bg-white px-3.5 py-2.5 text-left text-[15px] leading-snug text-[#3A2A25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F] dark:border-white/10 dark:bg-white/10 dark:text-[#f6efe9]"
            >
              {question}
            </button>
          ))}
        </div>
      ) : null}
      {messages.length > 0 ? (
        <ol className="space-y-3" aria-live="polite">
          {messages.map((message, index) => {
            const earlier = index > 0 ? messages[index - 1] : undefined;
            return (
              <li key={message.id}>
                <Turn
                  compact
                  message={message}
                  previous={earlier}
                  dismissed={dismissed.includes(message.id)}
                  saving={saving === message.id}
                  onDismiss={() => onDismiss(message.id)}
                  onKeep={(offer) => onKeep(message, offer)}
                  onChoose={(nextId) =>
                    onChoose(
                      nextId,
                      earlier?.role === "user" ? earlier.body : "",
                    )
                  }
                />
              </li>
            );
          })}
        </ol>
      ) : null}
      {pending ? (
        <div className="mt-3" aria-live="polite">
          <Turn
            compact
            message={{
              id: "pending",
              role: "user",
              body: pending,
              kind: "user",
              items: [],
              offer_save: null,
              clarification_people: null,
              person_id: personId ?? null,
              created_at: "",
            }}
          />
          {asking ? <Typing /> : null}
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}

function Typing() {
  return (
    <div className="mt-3 flex items-end gap-2" aria-label="Kynd is answering">
      <span className="flex size-7 items-center justify-center rounded-full bg-[#F2596F] font-serif text-[10px] text-white">
        K
      </span>
      <p className="flex h-10 items-center gap-1 rounded-2xl rounded-bl-md border border-[#F4C9C0] bg-white px-3.5 dark:bg-white/10">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 rounded-full bg-[#F2596F] motion-safe:animate-bounce"
            style={{ animationDelay: `${dot * 140}ms` }}
          />
        ))}
      </p>
    </div>
  );
}

function PaneComposer({
  draft,
  asking,
  name,
  sendError,
  fieldRef,
  onDraft,
  onSend,
}: {
  draft: string;
  asking: boolean;
  name?: string;
  sendError: string | null;
  fieldRef: RefObject<HTMLTextAreaElement | null>;
  onDraft: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <form
      className="shrink-0 border-t border-[#F2DACE] bg-white px-3 py-3 dark:border-white/10 dark:bg-[#1c1715]"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      {sendError ? (
        <p className="mb-2 px-1 text-sm text-[#8e1020]" role="alert">
          {sendError}{" "}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={onSend}
          >
            Try again
          </button>
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">
            {name ? `Message Kynd about ${name}` : "Message Kynd"}
          </span>
          <textarea
            ref={fieldRef}
            value={draft}
            rows={Math.min(4, Math.max(1, draft.split("\n").length))}
            disabled={asking}
            placeholder={name ? `Message about ${name}` : "Message Kynd"}
            enterKeyHint="send"
            autoComplete="off"
            className="max-h-32 min-h-11 w-full resize-none rounded-3xl border border-[#F2DACE] bg-[#FFF7F1] px-4 py-3 text-sm leading-relaxed text-[#3A2A25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F] disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-[#f6efe9]"
            onChange={(event) => onDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
          />
        </label>
        <button
          type="submit"
          aria-label="Send"
          disabled={asking || !draft.trim()}
          className="mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7A59] to-[#F2596F] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2596F] disabled:opacity-40"
        >
          <SendHorizontal className="size-4" />
        </button>
      </div>
    </form>
  );
}

function Turn({
  message,
  previous,
  dismissed,
  saving,
  onDismiss,
  onKeep,
  onChoose,
  compact = false,
}: {
  message: KyndChatMessage;
  previous?: KyndChatMessage;
  dismissed?: boolean;
  saving?: boolean;
  onDismiss?: () => void;
  onKeep?: (offer: KyndChatOffer) => void;
  onChoose?: (personId: string) => void;
  compact?: boolean;
}) {
  if (message.role === "user") {
    if (compact) {
      const when = bubbleTime(message.created_at);
      return (
        <div className="ml-auto max-w-[78%]">
          <p className="rounded-2xl rounded-br-md bg-gradient-to-br from-[#FF7A59] to-[#F2596F] px-3.5 py-2.5 text-[15px] leading-relaxed wrap-anywhere whitespace-pre-wrap text-white shadow-[0_8px_20px_-14px_rgba(242,89,111,0.9)]">
            {message.body}
          </p>
          {when ? (
            <p className="mt-1 text-right text-[11px] text-[#B5A197]">{when}</p>
          ) : null}
        </div>
      );
    }
    return (
      <div>
        <p className="text-[11px] tracking-[0.18em] text-[#8a7064] uppercase dark:text-[#c4aa9c]">
          You
        </p>
        <p className="mt-2 max-w-xl font-serif text-2xl leading-snug text-balance wrap-anywhere whitespace-pre-wrap">
          {message.body}
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <CompactReply
        message={message}
        previous={previous}
        dismissed={dismissed}
        saving={saving}
        onDismiss={onDismiss}
        onKeep={onKeep}
        onChoose={onChoose}
      />
    );
  }

  const offer = message.offer_save && !dismissed ? message.offer_save : null;
  const asked = previous?.role === "user" ? previous.body : "";

  return (
    <div>
      <p className="text-[11px] tracking-[0.18em] text-[#8e1020] uppercase dark:text-[#e7b2b8]">
        Kynd
      </p>
      <p className="mt-3 max-w-xl font-serif text-3xl leading-snug text-balance">
        {message.body}
      </p>

      {message.items.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {message.items.map((item) => (
            <li key={item.id}>
              <AnswerCard item={item} />
            </li>
          ))}
        </ul>
      ) : null}

      {message.clarification_people &&
      message.clarification_people.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {message.clarification_people.map((person) => (
            <li key={person.id}>
              <KyndButton
                type="button"
                disabled={!asked}
                onClick={() => onChoose?.(person.id)}
              >
                {person.name}
              </KyndButton>
            </li>
          ))}
        </ul>
      ) : null}

      {offer && message.person_id ? (
        <div className="mt-6">
          <p className="text-sm text-[#5c4a43] dark:text-[#cbb8ad]">
            Save to Kynd?
          </p>
          <div className="mt-2 flex items-center gap-2">
            <KyndButton
              type="button"
              disabled={saving}
              onClick={() => onKeep?.(offer)}
            >
              {saving ? "Saving…" : "Save"}
            </KyndButton>
            <KyndTextButton type="button" onClick={onDismiss}>
              Not now
            </KyndTextButton>
          </div>
        </div>
      ) : null}

      {message.kind === "none" && message.person_id && !offer ? (
        <Link
          href={ROUTES.kyndPerson(message.person_id)}
          className="mt-6 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]"
        >
          Add it to Kynd
        </Link>
      ) : null}
    </div>
  );
}

function CompactReply({
  message,
  previous,
  dismissed,
  saving,
  onDismiss,
  onKeep,
  onChoose,
}: {
  message: KyndChatMessage;
  previous?: KyndChatMessage;
  dismissed?: boolean;
  saving?: boolean;
  onDismiss?: () => void;
  onKeep?: (offer: KyndChatOffer) => void;
  onChoose?: (personId: string) => void;
}) {
  const offer = message.offer_save && !dismissed ? message.offer_save : null;
  const asked = previous?.role === "user" ? previous.body : "";
  const when = bubbleTime(message.created_at);

  return (
    <div className="flex max-w-[88%] items-end gap-2">
      <span className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F2596F] font-serif text-[10px] text-white">
        K
      </span>
      <div className="min-w-0">
        <p className="mb-1 text-[11px] text-[#92786C]">Kynd</p>
        <div className="rounded-2xl rounded-bl-md border border-[#F2DACE] bg-white px-3.5 py-2.5 text-[15px] leading-relaxed text-[#3A2A25] dark:border-white/10 dark:bg-white/10 dark:text-[#f6efe9]">
          <p className="wrap-anywhere whitespace-pre-wrap">{message.body}</p>
          {message.items.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {message.items.map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-[#5c4a43] dark:text-[#cbb8ad]"
                >
                  {item.title || item.body}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {when ? (
          <p className="mt-1 text-[11px] text-[#B5A197]">{when}</p>
        ) : null}
        {message.clarification_people &&
        message.clarification_people.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {message.clarification_people.map((person) => (
              <li key={person.id}>
                <KyndButton
                  type="button"
                  disabled={!asked}
                  onClick={() => onChoose?.(person.id)}
                >
                  {person.name}
                </KyndButton>
              </li>
            ))}
          </ul>
        ) : null}
        {offer && message.person_id ? (
          <div className="mt-2 flex items-center gap-2">
            <KyndButton
              type="button"
              disabled={saving}
              onClick={() => onKeep?.(offer)}
            >
              {saving ? "Saving…" : "Keep it"}
            </KyndButton>
            <KyndTextButton type="button" onClick={onDismiss}>
              Not now
            </KyndTextButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AnswerCard({ item }: { item: KyndItem }) {
  const label = categoryLabel(item.category);
  const headline = item.title || item.body;
  const detail = item.title && item.body ? item.body : "";

  return (
    <article className="rounded-[1.6rem] bg-white/75 px-6 py-7 dark:bg-white/5">
      {label ? (
        <p className="text-[11px] tracking-[0.18em] text-[#8a7064] uppercase dark:text-[#c4aa9c]">
          {label}
        </p>
      ) : null}
      <h2 className="mt-2 font-serif text-3xl leading-tight text-balance wrap-anywhere">
        {headline}
      </h2>
      {detail ? (
        <p className="mt-3 text-base leading-relaxed wrap-anywhere whitespace-pre-wrap text-[#4e3d36] dark:text-[#e6d7cf]">
          {detail}
        </p>
      ) : null}
      <p className="mt-5 text-sm text-[#6b564c] dark:text-[#cbb8ad]">
        {savedLabel(item.created_at)}
      </p>
      <Link
        href={`${ROUTES.kyndPerson(item.person_id)}#item-${item.id}`}
        className="mt-1 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e1020]"
      >
        View in Kynd
      </Link>
    </article>
  );
}

function Missing() {
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
