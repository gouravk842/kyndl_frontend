/**
 * The tabs of a creation's in-dashboard workspace. Both the header tab bar and
 * the workspace pane read from this one list so they never drift. "Design" is the
 * builder itself; the rest are the lifecycle actions that used to live as a
 * vertical list on the old detail hub.
 */
export type WorkspaceTab = "design" | "share" | "publish" | "manage";

export const WORKSPACE_TABS: { key: WorkspaceTab; label: string }[] = [
  { key: "design", label: "Design" },
  { key: "share", label: "Share & access" },
  { key: "publish", label: "Publish" },
  { key: "manage", label: "Manage" },
];

const TAB_KEYS = new Set(WORKSPACE_TABS.map((t) => t.key));

/**
 * Resolve the active tab from the URL. Defaults to "design" so opening a keepsake
 * drops you straight into editing; `?edit=1` (the legacy builder link, still used
 * by the proxy redirect and older hrefs) is treated as the Design tab too.
 */
export function resolveWorkspaceTab(
  tab: string | null,
  editing: boolean,
): WorkspaceTab {
  if (tab && TAB_KEYS.has(tab as WorkspaceTab)) return tab as WorkspaceTab;
  if (editing) return "design";
  return "design";
}

/** Link to a creation's workspace, focused on a given tab. */
export function workspaceTabHref(id: string, tab: WorkspaceTab): string {
  return tab === "design"
    ? `/dashboard?id=${id}`
    : `/dashboard?id=${id}&tab=${tab}`;
}
