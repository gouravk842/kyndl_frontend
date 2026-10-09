import type { QueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth.store";

/** Drop client auth state. Cookies are cleared by the logout request itself. */
export function resetClientSession(queryClient: QueryClient) {
  // Cancel before clearing so a profile response already on the wire cannot
  // repopulate the cache after sign-out. The store also ignores stale writes.
  void queryClient.cancelQueries();
  useAuthStore.getState().clearAuth();
  queryClient.clear();
}
