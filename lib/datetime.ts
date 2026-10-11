/**
 * UTC storage → viewer-local display.
 *
 * Django stores aware UTC (`USE_TZ` + `TIME_ZONE = "UTC"`). The UI should
 * always show those instants in the viewer's timezone (device location).
 */

/** IANA zone from the runtime, e.g. `"Asia/Kolkata"`. */
export function clientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
}

/**
 * Parse an API/DB timestamp. If the string has no offset (`Z` / `±HH:MM`),
 * treat it as UTC so browsers do not read it as local wall time.
 *
 * Plain `YYYY-MM-DD` values are calendar days (local midnight), not UTC instants.
 */
export function parseApiDate(
  value: string | Date | null | undefined,
): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = value.trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const localDay = new Date(`${raw}T00:00:00`);
    return Number.isNaN(localDay.getTime()) ? null : localDay;
  }

  const hasZone = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(raw);
  const date = new Date(hasZone ? raw : `${raw}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const DATETIME_OPTS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

/** Format a UTC instant in the viewer's timezone. */
export function formatInUserTz(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = DATE_OPTS,
  locale?: string,
): string {
  const date = parseApiDate(value);
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: clientTimezone(),
      ...options,
    }).format(date);
  } catch {
    return "";
  }
}

/** e.g. "11 Oct 2026" */
export function formatDateLocal(
  value: string | Date | null | undefined,
  locale?: string,
): string {
  return formatInUserTz(value, DATE_OPTS, locale);
}

/** e.g. "11 Oct, 5:30 PM" */
export function formatDateTimeLocal(
  value: string | Date | null | undefined,
  locale?: string,
): string {
  return formatInUserTz(value, DATETIME_OPTS, locale);
}

/** e.g. "5:30 PM" */
export function formatTimeLocal(
  value: string | Date | null | undefined,
  locale?: string,
): string {
  return formatInUserTz(value, { hour: "numeric", minute: "2-digit" }, locale);
}
