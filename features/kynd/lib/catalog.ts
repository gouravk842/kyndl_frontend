import type { RelationshipType } from "@/types/kynd";

export const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] =
  [
    { value: "partner", label: "Partner" },
    { value: "mother", label: "Mother" },
    { value: "father", label: "Father" },
    { value: "brother", label: "Brother" },
    { value: "sister", label: "Sister" },
    { value: "friend", label: "Friend" },
    { value: "child", label: "Child" },
    { value: "colleague", label: "Colleague" },
    { value: "other", label: "Other" },
  ];

export const KYND_CATEGORIES = [
  { value: "loves", label: "Loves" },
  { value: "wants", label: "Wants" },
  { value: "dislikes", label: "Doesn't like" },
  { value: "food", label: "Food" },
  { value: "details", label: "Details" },
  { value: "places", label: "Places" },
  { value: "said", label: "Things they said" },
  { value: "other", label: "Other" },
] as const;

export type KyndCategoryValue = (typeof KYND_CATEGORIES)[number]["value"];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPersonId(value: string) {
  return UUID_RE.test(value);
}

export function relationshipLabel(value: string) {
  return (
    RELATIONSHIP_TYPES.find((row) => row.value === value)?.label ?? "Other"
  );
}

export function categoryLabel(value: string) {
  return KYND_CATEGORIES.find((row) => row.value === value)?.label ?? "";
}

export function littleThingsLabel(count: number) {
  if (count === 0) return "Nothing kept yet";
  if (count === 1) return "1 little thing";
  return `${count} little things`;
}

export function monogram(name: string) {
  const first = Array.from(name.trim())[0];
  return first ? first.toLocaleUpperCase() : "·";
}
