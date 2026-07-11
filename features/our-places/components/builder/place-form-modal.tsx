"use client";

import {
  ImagePlus,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { SignInLink } from "@/components/auth/sign-in-link";
import { fileService } from "@/services/files/file.service";

import { CATEGORY_META, type PlaceCategory, type PlaceMood } from "../../config";
import { type GeoResult, searchLocations } from "../../lib/geocode";
import { useBuilderStore } from "../../store/builder.store";
import type { PlaceDoc } from "../../types";

const CATEGORY_OPTIONS = Object.entries(CATEGORY_META).map(([value, meta]) => ({
  value: value as PlaceCategory,
  label: meta.label,
}));
const MOOD_OPTIONS: { value: PlaceMood; label: string }[] = [
  { value: "warm", label: "Warm" },
  { value: "joyful", label: "Joyful" },
  { value: "quiet", label: "Quiet" },
  { value: "electric", label: "Electric" },
];

interface FormState {
  name: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
  date: string;
  category: PlaceCategory;
  mood: PlaceMood;
  title: string;
  memory: string;
}

function initialState(place: PlaceDoc | null): FormState {
  return {
    name: place?.name ?? "",
    city: place?.city ?? "",
    country: place?.country ?? "",
    lat: place?.lat ?? null,
    lng: place?.lng ?? null,
    date: place?.date ?? "",
    category: place?.category ?? "first",
    mood: place?.mood ?? "warm",
    title: place?.title ?? "",
    memory: place?.memory ?? "",
  };
}

/**
 * Add / edit a place in a popup. The user searches for a real location
 * (OpenStreetMap), picks it from the dropdown to lock in coordinates, then fills
 * in the photo, message, and the rest. Used for both new places and editing
 * existing ones — pass `place` to edit, `null` to add.
 */
export function PlaceFormModal({
  place,
  canUpload,
  onClose,
}: {
  place: PlaceDoc | null;
  canUpload: boolean;
  onClose: () => void;
}) {
  const createPlace = useBuilderStore((s) => s.createPlace);
  const updatePlace = useBuilderStore((s) => s.updatePlace);
  const setPhoto = useBuilderStore((s) => s.setPhoto);
  const removePhoto = useBuilderStore((s) => s.removePhoto);
  const localPreviews = useBuilderStore((s) => s.localPreviews);
  const assets = useBuilderStore((s) => s.assets);

  const [form, setForm] = useState<FormState>(() => initialState(place));
  // Photo staged locally until save: { fileId, previewUrl } or null (none/removed).
  const [photo, setLocalPhoto] = useState<{ fileId: string; url: string } | null>(
    place?.photo
      ? {
          fileId: place.photo.fileId,
          url:
            localPreviews[place.photo.fileId] ??
            assets[place.photo.fileId] ??
            "",
        }
      : null,
  );

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onPickLocation = (r: GeoResult) => {
    patch({
      lat: r.lat,
      lng: r.lng,
      // Only auto-fill fields the user hasn't already typed.
      name: form.name || r.name,
      city: form.city || r.city,
      country: form.country || r.country,
    });
  };

  const onSave = () => {
    if (form.lat === null || form.lng === null) {
      toast.error("Search and select a location first.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Give this place a name.");
      return;
    }

    const data = {
      name: form.name.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      lat: form.lat,
      lng: form.lng,
      date: form.date.trim(),
      category: form.category,
      mood: form.mood,
      title: form.title.trim(),
      memory: form.memory.trim(),
    };

    if (place) {
      updatePlace(place.id, data);
      if (photo) setPhoto(place.id, photo.fileId, photo.url);
      else removePhoto(place.id);
    } else {
      const id = createPlace({ ...data, photo: photo ? { fileId: photo.fileId } : undefined });
      if (photo) setPhoto(id, photo.fileId, photo.url);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#f2dace] bg-[#fffaf4] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f2dace] px-5 py-4">
          <h2 className="font-display text-lg text-[#3a2a25]">
            {place ? "Edit place" : "Add a place"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[#92786c] hover:bg-[#fbeee6] hover:text-[#c75b39]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <LocationSearch
            lat={form.lat}
            lng={form.lng}
            onPick={onPickLocation}
          />

          <PhotoPicker
            canUpload={canUpload}
            photo={photo}
            onSet={setLocalPhoto}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="The Leela Café"
              />
            </Field>
            <Field label="Date">
              <input
                className={inputCls}
                value={form.date}
                onChange={(e) => patch({ date: e.target.value })}
                placeholder="October 2022"
              />
            </Field>
            <Field label="City">
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) => patch({ city: e.target.value })}
              />
            </Field>
            <Field label="Country">
              <input
                className={inputCls}
                value={form.country}
                onChange={(e) => patch({ country: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) =>
                  patch({ category: e.target.value as PlaceCategory })
                }
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mood">
              <select
                className={inputCls}
                value={form.mood}
                onChange={(e) => patch({ mood: e.target.value as PlaceMood })}
              >
                {MOOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Headline">
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Where it all began"
            />
          </Field>
          <Field label="Message">
            <textarea
              className={`${inputCls} min-h-[110px] resize-y`}
              value={form.memory}
              onChange={(e) => patch({ memory: e.target.value })}
              placeholder="Write it like a letter to them…"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#f2dace] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#7a6258] hover:bg-[#fbeee6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-[#ff7a59] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#f2596f]"
          >
            {place ? "Save changes" : "Add place"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Location autocomplete ──────────────────────────────────────────
function LocationSearch({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (r: GeoResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Debounced search; aborts the previous request on each new keystroke. All
  // state updates happen inside the timeout, never synchronously in the effect.
  useEffect(() => {
    const q = query.trim();
    const controller = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const found = await searchLocations(q, controller.signal);
        setResults(found);
        setOpen(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          toast.error(
            err instanceof Error ? err.message : "Location search failed.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  return (
    <Field label="Location">
      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#b29a89]" />
          <input
            className={`${inputCls} pl-9`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            placeholder="Search for a place or address…"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-[#b29a89]" />
          )}
        </div>

        {open && results.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[#e3d2c5] bg-white shadow-lg">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(r);
                    setQuery(r.label);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#fbeee6]"
                >
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-[#c75b39]" />
                  <span className="text-sm text-[#3a2a25]">{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#92786c]">
        <MapPin className="size-3.5 shrink-0" />
        {lat !== null && lng !== null
          ? `Pinned at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
          : "No location selected yet."}
      </p>
    </Field>
  );
}

// ── Photo picker ───────────────────────────────────────────────────
function PhotoPicker({
  canUpload,
  photo,
  onSet,
}: {
  canUpload: boolean;
  photo: { fileId: string; url: string } | null;
  onSet: (photo: { fileId: string; url: string } | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await fileService.upload(file);
      onSet({ fileId, url: URL.createObjectURL(file) });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload that photo.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!canUpload) {
    return (
      <div className="rounded-lg border border-dashed border-[#e3d2c5] px-3 py-4 text-center text-xs text-[#92786c]">
        <SignInLink className="font-semibold text-[#c75b39] underline">
          Sign in
        </SignInLink>{" "}
        to add a photo to this place.
      </div>
    );
  }

  return (
    <Field label="Photo">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {photo?.url ? (
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient/presigned URL */}
          <img src={photo.url} alt="" className="h-36 w-full object-cover" />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onSet(null)}
            className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/55 text-white hover:bg-black/75"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#e3d2c5] bg-white text-[#92786c] transition-colors hover:border-[#ff7a59]/60 hover:text-[#c75b39] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : "Add a photo"}
          </span>
        </button>
      )}
    </Field>
  );
}

// ── Small building blocks (mirrors builder-panel) ──────────────────
const inputCls =
  "w-full rounded-lg border border-[#e3d2c5] bg-white px-3 py-2 text-sm text-[#3a2a25] outline-none transition-colors focus:border-[#ff7a59] focus:ring-2 focus:ring-[#ff7a59]/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-[#92786c]">
        {label}
      </span>
      {children}
    </label>
  );
}
