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
    product: (slug: string) => [...queryKeys.gifts.all, "product", slug] as const,
    orders: () => [...queryKeys.gifts.all, "orders"] as const,
    order: (id: string) => [...queryKeys.gifts.all, "order", id] as const,
    store: (slug: string) => [...queryKeys.gifts.all, "store", slug] as const,
    wishlist: () => [...queryKeys.gifts.all, "wishlist"] as const,
    addresses: () => [...queryKeys.gifts.all, "addresses"] as const,
    carriers: () => [...queryKeys.gifts.all, "carriers"] as const,
  },
  vendor: {
    all: ["vendor"] as const,
    me: () => [...queryKeys.vendor.all, "me"] as const,
    products: () => [...queryKeys.vendor.all, "products"] as const,
    product: (slug: string) => [...queryKeys.vendor.all, "product", slug] as const,
    orders: (status?: string) =>
      [...queryKeys.vendor.all, "orders", status ?? null] as const,
    finance: () => [...queryKeys.vendor.all, "finance"] as const,
    analytics: (months?: number) =>
      [...queryKeys.vendor.all, "analytics", months ?? null] as const,
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
} as const;
