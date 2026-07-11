/**
 * Turns the signed-in user's assorted belongings — the experiences they've
 * authored, the gifts they've ordered, and the gifts they've saved — into a
 * single flat list of dashboard "categories" for the left rail.
 *
 * Experience creations are grouped by `type` (one category per experience kind
 * the user actually has), borrowing name/icon/gradient from the experience
 * registry. Gifts-ordered and Saved are two fixed categories that only appear
 * when they hold something. Empty categories are omitted entirely.
 */
import { creationMeta } from "@/lib/creations";
import type { Creation } from "@/types/creation";
import type { Order, WishlistItem } from "@/types/gift";

export type CategoryKind = "experience" | "orders" | "wishlist";

export interface DashboardCategory {
  /** Unique selection key: an experience `type` slug, or a fixed sentinel. */
  key: string;
  kind: CategoryKind;
  label: string;
  /** Lucide icon name, resolved through `ExperienceIcon`. */
  iconName: string;
  count: number;
  /** Card/hover wash; experiences borrow their registry gradient. */
  gradient?: string;
  /** For experience categories, the underlying creation `type`. */
  type?: string;
}

export const ORDERS_KEY = "__orders";
export const WISHLIST_KEY = "__wishlist";
/** Sentinel selection for the "Start something new" view. */
export const CREATE_KEY = "__create";
/** Sentinel for the landing/overview view (welcome + analytics). The default. */
export const HOME_KEY = "__home";

/**
 * Resolve a raw selection into the view that should actually be shown. The
 * default — and any unknown or stale pick (e.g. a category whose last item was
 * deleted) — lands on the home overview; `CREATE_KEY` passes through.
 */
export function resolveSelectedKey(
  categories: DashboardCategory[],
  selected: string | null,
): string {
  if (selected === CREATE_KEY) return CREATE_KEY;
  if (selected && categories.some((c) => c.key === selected)) return selected;
  return HOME_KEY;
}

interface BuildArgs {
  creations?: Creation[];
  orders?: Order[];
  wishlist?: WishlistItem[];
}

/**
 * Build the ordered category list. Experience categories come first — sorted by
 * how many the user has, then alphabetically — followed by Gifts ordered and
 * Saved when non-empty.
 */
export function buildCategories({
  creations,
  orders,
  wishlist,
}: BuildArgs): DashboardCategory[] {
  const byType = new Map<string, number>();
  for (const c of creations ?? []) {
    byType.set(c.type, (byType.get(c.type) ?? 0) + 1);
  }

  const experienceCategories: DashboardCategory[] = [...byType.entries()]
    .map(([type, count]) => {
      const meta = creationMeta(type);
      return {
        key: type,
        kind: "experience" as const,
        label: meta.name,
        iconName: meta.icon,
        gradient: meta.previewGradient,
        count,
        type,
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const extras: DashboardCategory[] = [];
  if (orders && orders.length > 0) {
    extras.push({
      key: ORDERS_KEY,
      kind: "orders",
      label: "Gifts ordered",
      iconName: "Gift",
      count: orders.length,
    });
  }
  if (wishlist && wishlist.length > 0) {
    extras.push({
      key: WISHLIST_KEY,
      kind: "wishlist",
      label: "Saved gifts",
      iconName: "Heart",
      count: wishlist.length,
    });
  }

  return [...experienceCategories, ...extras];
}
