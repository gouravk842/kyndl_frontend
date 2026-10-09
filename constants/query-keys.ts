export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },
  creations: {
    all: ["creations"] as const,
    list: (type?: string) =>
      [...queryKeys.creations.all, "list", type ?? null] as const,
    detail: (id?: string) =>
      [...queryKeys.creations.all, "detail", id ?? null] as const,
  },
  gifts: {
    all: ["gifts"] as const,
    catalog: (params?: Record<string, unknown>) =>
      [...queryKeys.gifts.all, "catalog", params ?? null] as const,
    product: (slug: string) =>
      [...queryKeys.gifts.all, "product", slug] as const,
    orders: () => [...queryKeys.gifts.all, "orders"] as const,
    order: (id: string) => [...queryKeys.gifts.all, "order", id] as const,
    store: (slug: string) => [...queryKeys.gifts.all, "store", slug] as const,
    wishlist: () => [...queryKeys.gifts.all, "wishlist"] as const,
    addresses: () => [...queryKeys.gifts.all, "addresses"] as const,
    carriers: () => [...queryKeys.gifts.all, "carriers"] as const,
    categories: () => [...queryKeys.gifts.all, "categories"] as const,
  },
  vendor: {
    all: ["vendor"] as const,
    me: () => [...queryKeys.vendor.all, "me"] as const,
    products: () => [...queryKeys.vendor.all, "products"] as const,
    product: (slug: string) =>
      [...queryKeys.vendor.all, "product", slug] as const,
    orders: (status?: string) =>
      [...queryKeys.vendor.all, "orders", status ?? null] as const,
    finance: () => [...queryKeys.vendor.all, "finance"] as const,
    analytics: (months?: number) =>
      [...queryKeys.vendor.all, "analytics", months ?? null] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    categories: () => [...queryKeys.expenses.all, "categories"] as const,
    list: (params?: { status?: string; from?: string; to?: string } | null) =>
      [...queryKeys.expenses.all, "list", params ?? null] as const,
    pnl: (params?: { from?: string; to?: string } | null) =>
      [...queryKeys.expenses.all, "pnl", params ?? null] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    list: (type: string, ref: string) =>
      [...queryKeys.reviews.all, type, ref] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    thread: (surface: string, ref: string, scope?: string) =>
      [...queryKeys.conversations.all, surface, ref, scope ?? null] as const,
    inbox: () => [...queryKeys.conversations.all, "inbox"] as const,
  },
  collaboration: {
    all: ["collaboration"] as const,
    roster: (type: string, ref: string) =>
      [...queryKeys.collaboration.all, type, ref] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
    counts: () => [...queryKeys.notifications.all, "counts"] as const,
    preferences: () => [...queryKeys.notifications.all, "preferences"] as const,
  },
  payments: {
    all: ["payments"] as const,
    invoices: () => [...queryKeys.payments.all, "invoices"] as const,
  },
  kynd: {
    all: ["kynd"] as const,
    people: () => [...queryKeys.kynd.all, "people"] as const,
    person: (id: string) => [...queryKeys.kynd.all, "person", id] as const,
    itemsRoot: (personId: string) =>
      [...queryKeys.kynd.all, "items", personId] as const,
    items: (personId: string, filter?: { q?: string; category?: string }) =>
      [
        ...queryKeys.kynd.all,
        "items",
        personId,
        filter?.q ?? "",
        filter?.category ?? "",
      ] as const,
    chat: () => [...queryKeys.kynd.all, "chat"] as const,
    chatPerson: (id: string) => [...queryKeys.kynd.all, "chat", id] as const,
  },
  memoryBank: {
    all: ["memory-bank"] as const,
    circles: () => [...queryKeys.memoryBank.all, "circles"] as const,
    circle: (id?: string) =>
      [...queryKeys.memoryBank.all, "circle", id ?? null] as const,
    memories: (circleId?: string) =>
      [...queryKeys.memoryBank.all, "memories", circleId ?? null] as const,
    search: (query: string) =>
      [...queryKeys.memoryBank.all, "search", query] as const,
    trash: () => [...queryKeys.memoryBank.all, "trash"] as const,
    streak: () => [...queryKeys.memoryBank.all, "streak"] as const,
    leaderboard: (board: string) =>
      [...queryKeys.memoryBank.all, "leaderboard", board] as const,
  },
  referrals: {
    all: ["referrals"] as const,
    me: () => [...queryKeys.referrals.all, "me"] as const,
    links: () => [...queryKeys.referrals.all, "links"] as const,
    conversions: () => [...queryKeys.referrals.all, "conversions"] as const,
  },
} as const;
