/**
 * Location search powered by OpenStreetMap's Nominatim — free and key-less, in
 * keeping with the rest of Our Places (see the base-map note in `config.ts`).
 *
 * Nominatim's usage policy asks for at most one request per second and a valid
 * referer; the builder modal debounces typing, so a search only fires when the
 * user pauses. Results are trimmed to the few fields the place form needs.
 */

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

export interface GeoResult {
  /** Stable id for React keys (Nominatim's place_id). */
  id: string;
  /** Full human-readable label, e.g. "Eiffel Tower, Paris, France". */
  label: string;
  /** Short primary name — the venue/place name when present, else the city. */
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface NominatimItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: Record<string, string>;
}

function pickCity(address: Record<string, string> | undefined): string {
  if (!address) return "";
  return (
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    address.state ??
    ""
  );
}

/**
 * Search for places matching `query`. Pass an `AbortSignal` so a newer keystroke
 * can cancel an in-flight request. Returns `[]` on empty queries or errors.
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<GeoResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = `${ENDPOINT}?${new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "6",
  }).toString()}`;

  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Location search failed (${res.status}).`);

  const items = (await res.json()) as NominatimItem[];
  return items.map((item) => {
    const city = pickCity(item.address);
    const country = item.address?.country ?? "";
    const primary = item.name?.trim() || city || item.display_name.split(",")[0]?.trim() || "";
    return {
      id: String(item.place_id),
      label: item.display_name,
      name: primary,
      city,
      country,
      lat: Number(item.lat),
      lng: Number(item.lon),
    } satisfies GeoResult;
  });
}
