"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Calendar,
  Film,
  Frame,
  type LucideIcon,
  MapPin,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CalmPopup } from "@/components/ui/calm-popup";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/constants/query-keys";
import { useCircleMemories } from "@/hooks/use-memory-bank";
import { normalizeApiError } from "@/services/api/errors";
import { memoryBankService } from "@/services/memory-bank/memory-bank.service";
import type {
  BankConversionLink,
  ConvertFeature,
  ConvertPreview,
  ConvertQuestion,
  ConvertRequest,
} from "@/types/memory-bank";

const ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  calendar: Calendar,
  sparkles: Sparkles,
  scroll: ScrollText,
  "map-pin": MapPin,
  film: Film,
  frame: Frame,
};

type Step = "feature" | "questions" | "preview" | "confirm" | "existing";

export function ConvertWizard({
  circleId,
  circleName,
  memoryId,
  memoryTitle,
  onClose,
}: {
  circleId: string;
  circleName: string;
  memoryId?: string;
  memoryTitle?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const titleId = useId();
  const features = useQuery({
    queryKey: ["memory-bank", "convert-features", circleId, memoryId ?? null],
    queryFn: () => memoryBankService.convertFeatures(circleId, memoryId),
  });
  const memories = useCircleMemories(memoryId ? "" : circleId);

  const [step, setStep] = useState<Step>("feature");
  const [featureId, setFeatureId] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "snapshot">("snapshot");
  const [disposition, setDisposition] = useState<"keep" | "move">("keep");
  const [which, setWhich] = useState<"all" | "filter" | "pick">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string[]>(memoryId ? [memoryId] : []);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState(memoryTitle || circleName);
  const [followName, setFollowName] = useState(false);
  const [preview, setPreview] = useState<ConvertPreview | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [existing, setExisting] = useState<BankConversionLink[]>([]);
  const [progress, setProgress] = useState("");
  const [busy, setBusy] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );

  const feature = features.data?.find((item) => item.id === featureId) ?? null;
  const locked = Boolean(memoryId);
  const stepIndex =
    step === "feature"
      ? 1
      : step === "questions"
        ? 2
        : step === "preview"
          ? 3
          : 4;

  const body = useMemo(
    () =>
      buildRequest({
        featureId,
        mode,
        disposition,
        which: locked ? "pick" : which,
        dateFrom,
        dateTo,
        search,
        picked: locked && memoryId ? [memoryId] : picked,
        answers,
        name,
        followName: locked ? false : followName,
        memoryId,
      }),
    [
      answers,
      dateFrom,
      dateTo,
      disposition,
      featureId,
      followName,
      locked,
      memoryId,
      mode,
      name,
      picked,
      search,
      which,
    ],
  );

  function choose(next: ConvertFeature) {
    setFeatureId(next.id);
    const seeded: Record<string, string> = {};
    for (const question of next.questions)
      seeded[question.id] = question.default;
    setAnswers(seeded);
    if (!next.supports.snapshot && next.supports.live) setMode("live");
    if (!next.supports.live && next.supports.snapshot) setMode("snapshot");
  }

  async function loadPreview(offset = 0) {
    if (!featureId) return;
    setBusy(true);
    setPreviewError("");
    setProgress(offset ? "Loading more…" : "Mapping memories…");
    try {
      const result = await memoryBankService.previewConversion(circleId, {
        ...body,
        sample_offset: offset,
      });
      setPreview((current) =>
        offset && current
          ? { ...result, samples: [...current.samples, ...result.samples] }
          : result,
      );
      setStep("preview");
    } catch (error) {
      setPreviewError(normalizeApiError(error).message);
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  async function create(onExisting?: "open" | "update" | "create") {
    if (!featureId) return;
    if (onExisting === "open" && existing[0]) {
      router.push(`/dashboard?id=${existing[0].creation_id}`);
      onClose();
      return;
    }
    setBusy(true);
    setProgress(onExisting === "update" ? "Updating…" : "Creating…");
    try {
      const result = await memoryBankService.convert(circleId, {
        ...body,
        idempotency_key: idempotencyKey,
        on_existing: onExisting,
        conversion_id: onExisting === "update" ? existing[0]?.id : undefined,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.memoryBank.all,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.creations.all,
      });
      toast.success(
        result.replayed
          ? "That keepsake was already created."
          : `Created ${result.title}.`,
        {
          duration: 35000,
          action: result.replayed
            ? undefined
            : {
                label: "Undo",
                onClick: () => {
                  memoryBankService
                    .undoConversion(result.id)
                    .then(() => {
                      queryClient.invalidateQueries({
                        queryKey: queryKeys.memoryBank.all,
                      });
                      queryClient.invalidateQueries({
                        queryKey: queryKeys.creations.all,
                      });
                      toast.success("Conversion removed.");
                    })
                    .catch((error: unknown) =>
                      toast.error(normalizeApiError(error).message),
                    );
                },
              },
        },
      );
      router.push(`/dashboard?id=${result.creation_id}`);
      onClose();
    } catch (error) {
      const api = normalizeApiError(error);
      const prior = api.details?.existing;
      if (api.code === "conversion_exists" && Array.isArray(prior)) {
        setExisting(prior as BankConversionLink[]);
        setStep("existing");
        setIdempotencyKey(crypto.randomUUID());
      } else {
        setPreviewError(api.message);
        setStep("confirm");
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <CalmPopup
      open
      onClose={onClose}
      labelledBy={titleId}
      className="md:max-w-xl"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-[var(--mb-solar-line)] px-5 py-4">
          <p className="text-xs tracking-wide text-[#C75B39] uppercase">
            Step {step === "existing" ? 4 : stepIndex} of 4
          </p>
          <h2
            id={titleId}
            tabIndex={-1}
            autoFocus
            className="mt-1 font-display text-2xl text-[var(--mb-solar-ink)] outline-none"
          >
            Convert to feature
          </h2>
          <p className="mt-1 text-sm text-[var(--mb-solar-muted)]">
            {locked
              ? `From “${memoryTitle || "this memory"}” in ${circleName}.`
              : `From the ${circleName} bank.`}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === "feature" ? (
            <FeatureStep
              features={features.data}
              loading={features.isLoading}
              error={features.isError}
              selected={featureId}
              onSelect={choose}
              onRetry={() => features.refetch()}
            />
          ) : null}

          {step === "questions" && feature ? (
            <QuestionStep
              feature={feature}
              locked={locked}
              mode={mode}
              onMode={setMode}
              disposition={disposition}
              onDisposition={setDisposition}
              which={which}
              onWhich={setWhich}
              dateFrom={dateFrom}
              dateTo={dateTo}
              search={search}
              onDateFrom={setDateFrom}
              onDateTo={setDateTo}
              onSearch={setSearch}
              memories={memories.data ?? []}
              picked={picked}
              onPicked={setPicked}
              answers={answers}
              onAnswer={(id, value) =>
                setAnswers((current) => ({ ...current, [id]: value }))
              }
              name={name}
              onName={setName}
              followName={followName}
              onFollow={setFollowName}
            />
          ) : null}

          {step === "preview" || step === "confirm" ? (
            <PreviewStep
              preview={preview}
              error={previewError}
              onMore={
                preview && preview.samples.length < preview.sample_total
                  ? () => loadPreview(preview.samples.length)
                  : undefined
              }
            />
          ) : null}

          {step === "existing" ? (
            <ExistingStep
              existing={existing}
              onOpen={() => create("open")}
              onUpdate={() => create("update")}
              onAnother={() => create("create")}
              busy={busy}
            />
          ) : null}

          <p className="sr-only" aria-live="polite">
            {progress}
          </p>
          {progress ? (
            <p
              className="mt-3 text-sm text-[var(--mb-solar-muted)]"
              aria-hidden
            >
              {progress}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--mb-solar-line)] px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (step === "feature") onClose();
              else if (step === "questions") setStep("feature");
              else if (step === "preview" || step === "existing")
                setStep("questions");
              else setStep("preview");
            }}
          >
            {step === "feature" ? "Cancel" : "Back"}
          </Button>
          {step === "feature" ? (
            <Button
              type="button"
              disabled={!feature}
              onClick={() => setStep("questions")}
            >
              Continue
            </Button>
          ) : null}
          {step === "questions" ? (
            <Button
              type="button"
              disabled={busy}
              onClick={() => loadPreview(0)}
            >
              Preview
            </Button>
          ) : null}
          {step === "preview" ? (
            <Button
              type="button"
              disabled={busy || !preview || preview.mapped_count === 0}
              onClick={() => {
                setPreviewError("");
                setStep("confirm");
              }}
            >
              Continue
            </Button>
          ) : null}
          {step === "confirm" ? (
            <Button
              type="button"
              disabled={busy || !preview || preview.mapped_count === 0}
              onClick={() => create()}
            >
              {busy ? "Creating…" : "Create"}
            </Button>
          ) : null}
        </div>
      </div>
    </CalmPopup>
  );
}

function buildRequest(input: {
  featureId: string | null;
  mode: "live" | "snapshot";
  disposition: "keep" | "move";
  which: "all" | "filter" | "pick";
  dateFrom: string;
  dateTo: string;
  search: string;
  picked: string[];
  answers: Record<string, string>;
  name: string;
  followName: boolean;
  memoryId?: string;
}): ConvertRequest {
  return {
    feature: input.featureId ?? "",
    mode: input.mode,
    disposition: input.mode === "live" ? "keep" : input.disposition,
    name: input.name,
    follow_bank_name: input.followName,
    memory_id: input.memoryId,
    answers: {
      which: input.which,
      memory_ids: input.which === "pick" ? input.picked : undefined,
      date_from: input.dateFrom,
      date_to: input.dateTo,
      search: input.search,
      ...input.answers,
    },
  };
}

function FeatureIcon({ name }: { name: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className="size-5 text-[#C75B39]" aria-hidden />;
}

function FeatureStep({
  features,
  loading,
  error,
  selected,
  onSelect,
  onRetry,
}: {
  features?: ConvertFeature[];
  loading: boolean;
  error: boolean;
  selected: string | null;
  onSelect: (feature: ConvertFeature) => void;
  onRetry: () => void;
}) {
  if (loading)
    return (
      <p className="text-sm text-[var(--mb-solar-muted)]">Loading keepsakes…</p>
    );
  if (error) {
    return (
      <div>
        <p className="text-sm text-[var(--mb-solar-muted)]">
          The keepsake list didn’t load.
        </p>
        <Button
          type="button"
          className="mt-3"
          variant="outline"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {features?.map((feature) => (
        <li key={feature.id}>
          <button
            type="button"
            aria-pressed={selected === feature.id}
            onClick={() => onSelect(feature)}
            className="flex w-full items-start gap-3 rounded-2xl border border-[var(--mb-solar-line)] bg-[#FFF7F1] px-3 py-3 text-left aria-pressed:border-[#C75B39] dark:bg-[#221B19]"
          >
            <FeatureIcon name={feature.icon} />
            <span className="min-w-0">
              <span className="block font-display text-lg text-[var(--mb-solar-ink)]">
                {feature.label}
              </span>
              <span className="mt-0.5 block text-sm text-[var(--mb-solar-muted)]">
                {feature.description}
              </span>
              <span className="mt-1 block text-sm text-[var(--mb-solar-ink)]">
                {feature.assess.hint}
              </span>
              {feature.assess.warnings.map((warning) => (
                <span
                  key={warning}
                  className="mt-1 block text-xs text-[#C75B39]"
                >
                  {warning}
                </span>
              ))}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function QuestionStep(props: {
  feature: ConvertFeature;
  locked: boolean;
  mode: "live" | "snapshot";
  onMode: (mode: "live" | "snapshot") => void;
  disposition: "keep" | "move";
  onDisposition: (value: "keep" | "move") => void;
  which: "all" | "filter" | "pick";
  onWhich: (value: "all" | "filter" | "pick") => void;
  dateFrom: string;
  dateTo: string;
  search: string;
  onDateFrom: (value: string) => void;
  onDateTo: (value: string) => void;
  onSearch: (value: string) => void;
  memories: { id: string; title: string }[];
  picked: string[];
  onPicked: (ids: string[]) => void;
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  name: string;
  onName: (value: string) => void;
  followName: boolean;
  onFollow: (value: boolean) => void;
}) {
  const showMove = props.mode === "snapshot" && props.feature.supports.move;
  return (
    <div className="flex flex-col gap-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[var(--mb-solar-ink)]">
          Sync
        </legend>
        <Choice
          name="sync"
          value={props.mode}
          onChange={(value) => props.onMode(value as "live" | "snapshot")}
          options={[
            ...(props.feature.supports.live
              ? [
                  {
                    value: "live",
                    label: "Live",
                    help: "The keepsake keeps updating as this bank changes.",
                  },
                ]
              : []),
            ...(props.feature.supports.snapshot
              ? [
                  {
                    value: "snapshot",
                    label: "Snapshot",
                    help: "A one-time copy that stays fixed.",
                  },
                ]
              : []),
          ]}
        />
      </fieldset>

      {showMove ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--mb-solar-ink)]">
            Original memories
          </legend>
          <Choice
            name="disposition"
            value={props.disposition}
            onChange={(value) => props.onDisposition(value as "keep" | "move")}
            options={[
              {
                value: "keep",
                label: "Keep them in the bank",
                help: "The bank stays as it is.",
              },
              {
                value: "move",
                label: "Move them into the feature",
                help: "They leave the bank. Undo puts them back.",
              },
            ]}
          />
        </fieldset>
      ) : null}

      {props.locked ? null : (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--mb-solar-ink)]">
            Which memories
          </legend>
          <Choice
            name="which"
            value={props.which}
            onChange={(value) =>
              props.onWhich(value as "all" | "filter" | "pick")
            }
            options={[
              { value: "all", label: "All", help: "Every memory in the bank." },
              {
                value: "filter",
                label: "A filtered set",
                help: "By date or a search.",
              },
              {
                value: "pick",
                label: "Choose some",
                help: "Tick the ones to include.",
              },
            ]}
          />
          {props.which === "filter" ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-[var(--mb-solar-muted)]">
                From
                <Input
                  type="date"
                  value={props.dateFrom}
                  onChange={(event) => props.onDateFrom(event.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="text-xs text-[var(--mb-solar-muted)]">
                To
                <Input
                  type="date"
                  value={props.dateTo}
                  onChange={(event) => props.onDateTo(event.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="text-xs text-[var(--mb-solar-muted)] sm:col-span-2">
                Search
                <Input
                  value={props.search}
                  onChange={(event) => props.onSearch(event.target.value)}
                  className="mt-1"
                />
              </label>
            </div>
          ) : null}
          {props.which === "pick" ? (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {props.memories.map((memory) => {
                const checked = props.picked.includes(memory.id);
                return (
                  <li key={memory.id}>
                    <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--mb-solar-ink)]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          props.onPicked(
                            checked
                              ? props.picked.filter((id) => id !== memory.id)
                              : [...props.picked, memory.id],
                          )
                        }
                      />
                      {memory.title || "Untitled"}
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </fieldset>
      )}

      {props.feature.questions.map((question) => (
        <QuestionField
          key={question.id}
          question={question}
          value={props.answers[question.id] ?? question.default}
          onChange={(value) => props.onAnswer(question.id, value)}
        />
      ))}

      <label className="block text-sm font-medium text-[var(--mb-solar-ink)]">
        Name
        <Input
          value={props.name}
          onChange={(event) => props.onName(event.target.value)}
          className="mt-1"
        />
      </label>
      {props.locked ? null : (
        <label className="flex min-h-11 items-start gap-2 text-sm text-[var(--mb-solar-ink)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={props.followName}
            onChange={(event) => props.onFollow(event.target.checked)}
          />
          <span>
            Follow the bank’s name
            <span className="mt-0.5 block text-xs font-normal text-[var(--mb-solar-muted)]">
              Off by default. A rename of the bank will not change this keepsake
              unless you ask.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ConvertQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  if (question.kind === "text") {
    return (
      <label className="block text-sm font-medium text-[var(--mb-solar-ink)]">
        {question.label}
        <span className="mt-0.5 block text-xs font-normal text-[var(--mb-solar-muted)]">
          {question.help}
        </span>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1"
        />
      </label>
    );
  }
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-[var(--mb-solar-ink)]">
        {question.label}
      </legend>
      <p className="text-xs text-[var(--mb-solar-muted)]">{question.help}</p>
      <Choice
        name={question.id}
        value={value}
        onChange={onChange}
        options={(question.options ?? []).map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />
    </fieldset>
  );
}

function Choice({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; help?: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex min-h-11 items-start gap-2 rounded-xl px-1 py-1 text-sm text-[var(--mb-solar-ink)]"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1"
          />
          <span>
            {option.label}
            {option.help ? (
              <span className="mt-0.5 block text-xs text-[var(--mb-solar-muted)]">
                {option.help}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}

function PreviewStep({
  preview,
  error,
  onMore,
}: {
  preview: ConvertPreview | null;
  error: string;
  onMore?: () => void;
}) {
  if (!preview) {
    return (
      <p className="text-sm text-[var(--mb-solar-muted)]">
        {error || "Nothing to preview yet."}
      </p>
    );
  }
  const skipped = groupReasons(preview.skipped);
  const fallbacks = groupReasons(preview.fallbacks);
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--mb-solar-ink)]">
        {preview.mapped_count === 0
          ? "Nothing will be created."
          : `${preview.mapped_count} ${preview.mapped_count === 1 ? "memory" : "memories"} will become “${preview.name}”.`}
      </p>
      <ul className="space-y-2">
        {preview.samples.map((sample, index) => (
          <li
            key={`${sample.title}-${index}`}
            className="rounded-xl bg-[#FFF7F1] px-3 py-2 dark:bg-[#221B19]"
          >
            <span className="block text-sm text-[var(--mb-solar-ink)]">
              {sample.title || "Untitled"}
            </span>
            {sample.detail ? (
              <span className="block truncate text-xs text-[var(--mb-solar-muted)]">
                {sample.detail}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {onMore ? (
        <Button type="button" variant="outline" onClick={onMore}>
          Show more
        </Button>
      ) : null}
      <ReasonList title="Skipped" groups={skipped} />
      <ReasonList title="Using a fallback" groups={fallbacks} />
      {error ? <p className="text-sm text-[#B11226]">{error}</p> : null}
    </div>
  );
}

function groupReasons(items: { title: string; reason: string }[]) {
  const grouped = new Map<string, string[]>();
  for (const item of items) {
    const titles = grouped.get(item.reason) ?? [];
    titles.push(item.title);
    grouped.set(item.reason, titles);
  }
  return [...grouped.entries()];
}

function ReasonList({
  title,
  groups,
}: {
  title: string;
  groups: [string, string[]][];
}) {
  if (!groups.length) return null;
  return (
    <div>
      <h3 className="text-sm font-medium text-[var(--mb-solar-ink)]">
        {title}
      </h3>
      <ul className="mt-1 space-y-2">
        {groups.map(([reason, titles]) => (
          <li key={reason} className="text-sm text-[var(--mb-solar-muted)]">
            <span className="text-[var(--mb-solar-ink)]">{reason}</span>
            <span className="mt-0.5 block text-xs">
              {titles.slice(0, 8).join(", ")}
              {titles.length > 8 ? ` and ${titles.length - 8} more` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExistingStep({
  existing,
  onOpen,
  onUpdate,
  onAnother,
  busy,
}: {
  existing: BankConversionLink[];
  onOpen: () => void;
  onUpdate: () => void;
  onAnother: () => void;
  busy: boolean;
}) {
  const current = existing[0];
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--mb-solar-ink)]">
        {current
          ? `${current.label} already exists from this bank (“${current.title}”).`
          : "A keepsake from this bank already exists."}
      </p>
      <div className="flex flex-col gap-2">
        <Button type="button" disabled={busy} onClick={onOpen}>
          Open existing
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onUpdate}
        >
          Update it
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onAnother}
        >
          Create another
        </Button>
      </div>
    </div>
  );
}
