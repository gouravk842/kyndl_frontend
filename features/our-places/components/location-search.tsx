"use client";

import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type GeoResult,
  searchLocations,
} from "@/features/our-places/lib/geocode";

export type { GeoResult };

export function LocationSearch({
  lat,
  lng,
  label,
  onPick,
  onClear,
  inputId = "location-search",
  inlineResults = false,
}: {
  lat: number | null;
  lng: number | null;
  label?: string;
  onPick: (result: GeoResult) => void;
  onClear?: () => void;
  inputId?: string;
  inlineResults?: boolean;
}) {
  const [query, setQuery] = useState(label ?? "");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query.trim();
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (q.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      void searchLocations(q, controller.signal)
        .then((found) => {
          setResults(found);
          setOpen(true);
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Location search failed.",
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 400);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const pinned = lat !== null && lng !== null;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>Location</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search a place…"
          autoComplete="off"
          className="h-11 pl-9 pr-9"
        />
        {loading ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : pinned && onClear ? (
          <button
            type="button"
            aria-label="Clear location"
            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQuery("");
              setResults([]);
              onClear();
            }}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
        {open && results.length > 0 ? (
          <ul
            className={
              inlineResults
                ? "mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-card"
                : "absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
            }
          >
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(result);
                    setQuery(result.label);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-accent"
                >
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#C75B39]" />
                  <span className="text-sm">{result.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3 shrink-0" />
        {pinned
          ? label || `${lat!.toFixed(4)}, ${lng!.toFixed(4)}`
          : "Optional"}
      </p>
    </div>
  );
}
