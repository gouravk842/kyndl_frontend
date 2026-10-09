"use client";

import { Loader2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function NameForm({
  title,
  description,
  label = "Name",
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  pending = false,
  placeholder = "A name",
  maxLength = 80,
  autoFocus = true,
  className,
  footer,
  id = "name",
  error,
}: {
  title?: string;
  description?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  className?: string;
  footer?: ReactNode;
  id?: string;
  error?: string;
}) {
  const trimmed = value.trim();
  return (
    <form
      data-hud
      onSubmit={onSubmit}
      className={cn(
        "w-full rounded-3xl border border-[var(--mb-solar-line,var(--border))] bg-[var(--mb-solar-void,var(--card))] p-4 shadow-[0_16px_40px_rgba(58,42,37,0.12)]",
        className,
      )}
    >
      {title ? (
        <p
          id={`${id}-title`}
          className="font-display text-xl text-[var(--mb-solar-ink,var(--foreground))]"
        >
          {title}
        </p>
      ) : null}
      {description ? (
        <p className="mt-1 text-sm text-[var(--mb-solar-muted,var(--muted-foreground))]">
          {description}
        </p>
      ) : null}
      <div className={cn("space-y-1.5", (title || description) && "mt-4")}>
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          className="h-11 bg-background font-display text-base"
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          type="submit"
          className="h-11 min-h-11 flex-1"
          disabled={!trimmed || pending || Boolean(error)}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11 min-h-11"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        ) : null}
      </div>
      {footer}
    </form>
  );
}
