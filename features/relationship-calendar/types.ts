/**
 * Persisted Relationship Calendar document — what the builder edits and the
 * backend stores in `Creation.content` (validated by
 * `experiences/types/relationship_calendar.py`).
 *
 * Event photos are media references (`{ fileId }`); the backend resolves them
 * to presigned URLs in the creation's `assets` map on read.
 */

export type EventCategory =
  | "anniversary"
  | "date"
  | "trip"
  | "milestone"
  | "everyday"
  | "custom";

export type WeekStartsOn = 0 | 1;

export interface MediaRef {
  fileId: string;
}

export interface CalendarEvent {
  id: string;
  /** Source of truth for grid placement — always `YYYY-MM-DD`. */
  date: string;
  title: string;
  note: string;
  category: EventCategory;
  photo?: MediaRef;
  /** When true, the event also appears on the same month+day in other years. */
  recursYearly?: boolean;
  /**
   * Who added this memory. Blank / missing = owner. Contributors are stamped
   * with their user id so invite-based co-authors only edit their own.
   */
  authorId?: string;
}

export interface RelationshipCalendarDoc {
  title: string;
  subtitle: string;
  partnerNames: string;
  weekStartsOn: WeekStartsOn;
  /**
   * Optional day the relationship began (`YYYY-MM-DD`). Drives the
   * "together for" counter and anniversary highlight on the calendar.
   */
  togetherSince: string;
  events: CalendarEvent[];
}
