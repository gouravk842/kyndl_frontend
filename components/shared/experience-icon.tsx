import { createElement } from "react";

import { iconFor } from "@/lib/experience-icons";

/**
 * Renders an experience's lucide icon from its string name. Using
 * `createElement` (instead of aliasing to a capitalized local and rendering it)
 * keeps the registry lookup out of the "component created during render" path —
 * the icons are stable module-level components, resolved here by name.
 */
export function ExperienceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return createElement(iconFor(name), { className });
}
