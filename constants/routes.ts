export const ROUTES = {
  home: "/",
  games: "/games",
  pricing: "/pricing",
  about: "/about",
  blog: "/blog",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  settings: "/dashboard/settings",
  admin: "/admin",
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.pricing,
  ROUTES.about,
  ROUTES.blog,
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
] as const;

export const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
] as const;

export const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/admin"] as const;
