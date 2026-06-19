# Kyndl Frontend — Architecture Guide

Production-grade Next.js 16 (App Router) frontend for SaaS: marketing, auth, dashboards, admin, and AI interfaces.

---

## 1. Complete setup commands

```bash
cd kyndl_frontend

# Already executed during bootstrap:
# npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --turbopack --yes

npm install framer-motion zustand @tanstack/react-query @tanstack/react-query-devtools \
  react-hook-form @hookform/resolvers zod axios clsx tailwind-merge class-variance-authority \
  lucide-react next-themes

npm install -D prettier eslint-config-prettier eslint-plugin-simple-import-sort husky lint-staged

npx shadcn@latest init -y --defaults
npx shadcn@latest add input label card sonner dropdown-menu avatar skeleton separator sheet -y

cp .env.example .env.local   # then edit values
npm run dev
```

**Daily commands**

| Command                     | Purpose                         |
| --------------------------- | ------------------------------- |
| `npm run dev`               | Local dev (Turbopack)           |
| `npm run build`             | Production build + typecheck    |
| `npm run start`             | Serve production build          |
| `npm run lint` / `lint:fix` | ESLint                          |
| `npm run format`            | Prettier write                  |
| `npm run typecheck`         | `tsc --noEmit`                  |
| `npm run validate`          | typecheck + lint + format check |

---

## 2. Full folder structure

```
kyndl_frontend/
├── app/                          # Next.js App Router (routes only)
│   ├── (marketing)/              # Public marketing shell
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing (/)
│   │   └── pricing/page.tsx
│   ├── (auth)/                   # Auth shell (login, register)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Authenticated app shell
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── layout.tsx                # Root layout + providers
│   ├── globals.css               # Design tokens + Tailwind
│   ├── error.tsx                 # Route error boundary
│   ├── loading.tsx               # Root loading UI
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/                       # shadcn primitives (Button, Card, …)
│   ├── layout/                   # Headers, sidebars, page containers
│   ├── shared/                   # Cross-feature UI (Logo, ThemeToggle)
│   └── animations/               # Framer Motion wrappers
├── features/                     # Feature modules (domain logic)
│   ├── auth/
│   │   ├── components/
│   │   └── schemas/
│   └── dashboard/
│       └── components/
├── services/                     # API & external integrations
│   ├── api/
│   │   ├── client.ts             # Axios instance + interceptors
│   │   └── errors.ts
│   └── auth/
│       └── auth.service.ts
├── store/                        # Zustand global client state
│   ├── auth.store.ts
│   └── ui.store.ts
├── hooks/                        # Shared React hooks
├── providers/                    # Client provider composition
├── lib/                          # Framework-agnostic utilities
│   ├── query-client.ts
│   ├── seo.ts
│   └── animations/
├── utils/                        # Pure helpers (cookies, format)
├── types/                        # Shared TypeScript types
├── constants/                    # Routes, roles, query keys, cookies
├── config/                       # env validation, site config
├── public/
├── middleware.ts                 # Auth + RBAC edge checks
├── .env.example / .env.local
├── .husky/pre-commit
└── ARCHITECTURE.md
```

---

## 3. Folder explanations (why each exists)

| Folder        | Responsibility                                | Why separate                                           |
| ------------- | --------------------------------------------- | ------------------------------------------------------ |
| `app/`        | Routing, layouts, metadata, server components | Next.js convention; keeps URLs declarative             |
| `components/` | Reusable, **non-domain** UI                   | Shared across features without coupling to auth/CRM    |
| `features/`   | Domain modules: forms, hooks, feature APIs    | Teams own vertical slices; scales to dozens of domains |
| `services/`   | HTTP/API calls                                | Single place for backend contract + interceptors       |
| `store/`      | Ephemeral **client** global state             | UI prefs, hydrated user snapshot — not server cache    |
| `hooks/`      | Cross-feature React logic                     | Avoid duplicating `useAuth`-style hooks                |
| `providers/`  | Client boundary composition                   | One import in root layout                              |
| `lib/`        | App infrastructure (SEO, query, motion)       | Not business features; stable utilities                |
| `utils/`      | Pure functions                                | Easy to test, zero React imports                       |
| `types/`      | Contracts shared app-wide                     | Prevents circular imports between features             |
| `constants/`  | Magic strings / enums                         | Refactor-safe route and role names                     |
| `config/`     | Validated env + marketing config              | Fail fast at boot if env is wrong                      |

**Rule of thumb:** If it knows about “deals”, “contacts”, or “billing”, it lives in `features/<name>/`. If it knows about HTTP or tokens, it lives in `services/`. If it’s a button variant, it lives in `components/ui/`.

---

## 4. Architecture decisions

1. **Feature-based modules** — Mirrors how product teams ship (auth squad, billing squad). Reduces merge conflicts vs. a giant `components/` tree.
2. **Route groups `(marketing) | (auth) | (dashboard)`** — Different layouts without polluting URLs. Marketing gets SEO + animations; dashboard gets sidebar.
3. **Server Components by default** — Landing and pricing pages ship zero unnecessary client JS. Client boundaries only at forms, theme, motion, and data mutations.
4. **TanStack Query + Zustand** — Query owns server truth; Zustand owns client-only and persisted UI/profile snapshot. Avoids duplicating cache in Redux.
5. **Axios service layer** — Centralized refresh, error normalization, and base URL. Components never call `fetch` directly.
6. **Zod at boundaries** — Env (`config/env.ts`), forms (`features/auth/schemas`), and API types stay aligned.
7. **Middleware auth gate** — First line of defense before protected HTML streams; complements client hooks.

---

## 5. Production best practices (built-in)

- Strict TypeScript + `noUncheckedIndexedAccess`
- Env validation with Zod (fail at startup)
- ESLint (Next core web vitals) + Prettier + import sorting
- Husky + lint-staged on commit
- `poweredByHeader: false`, optimized images (AVIF/WebP)
- Error boundary (`app/error.tsx`), loading skeletons
- Query retry policy skips 4xx
- SEO: metadata helper, sitemap, robots, canonical URLs

---

## 6. State management

### Zustand (`store/`)

**Use for:**

- Authenticated user **snapshot** (persisted for fast UI; revalidated via Query)
- UI chrome: sidebar open, command palette, modal toggles
- Wizard/step state that must survive navigation within SPA
- Optimistic UI flags (not source of truth for server entities)

**Do not use for:**

- Lists of records from API (use Query cache)
- Form draft state (use React Hook Form)
- Data that must be fresh on every mount (use Query with `staleTime`)

### TanStack Query (`lib/query-client.ts`, `hooks/use-auth.ts`)

**Use for:**

- All REST/GraphQL server state
- Pagination, infinite scroll, background refetch
- Mutations with cache invalidation (`queryKeys` in `constants/query-keys.ts`)

**Patterns:**

- Hierarchical query keys → precise invalidation
- `staleTime` tuned per resource (profile: 5m, live metrics: 30s)
- Devtools gated by `NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS`

---

## 7. Animation system (`lib/animations/`, `components/animations/`)

- **variants.ts** — Reusable `fadeInUp`, `staggerContainer`, etc.
- **transitions.ts** — Spring vs smooth vs page transition timing
- **FadeIn** — Scroll-triggered sections (`whileInView`, `once`)
- **PageTransition** — Route-level AnimatePresence (marketing layout)
- **StaggerChildren** — Feature grids on landing pages

**Why Framer Motion here:** Declarative variants scale to complex landing pages; keep motion components thin wrappers so pages stay readable.

---

## 8. Styling & design system

- **Tailwind v4** + CSS variables in `app/globals.css` (shadcn tokens)
- **Dark mode** via `next-themes` + `.dark` class on `<html>`
- **shadcn/ui** — Accessible primitives; extend in `components/ui/`
- **Typography** — Geist via `next/font` (subset, `display: swap` for LCP)
- **ButtonLink** — shadcn v4 Base UI buttons don’t use Radix `asChild`; link-styled buttons use `buttonVariants` on `<Link>`

---

## 9. SEO

| File                             | Role                                                        |
| -------------------------------- | ----------------------------------------------------------- |
| `lib/seo.ts`                     | `createMetadata()` — title template, OG, Twitter, canonical |
| `app/sitemap.ts`                 | Dynamic sitemap                                             |
| `app/robots.ts`                  | Crawl rules; disallow `/dashboard`, `/admin`                |
| Per-page `export const metadata` | Route-specific SEO                                          |

### SSR vs SSG vs ISR

| Strategy | When                                            | Kyndl usage                                                       |
| -------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| **SSG**  | Content identical for all users, rarely changes | Marketing pages (`/`, `/pricing`) — static ○ in build             |
| **SSR**  | Personalized or request-time data               | Future: blog with auth-aware preview                              |
| **ISR**  | Mostly static but needs periodic updates        | Pricing tables, changelog — add `revalidate: 3600` when CMS wired |
| **CSR**  | Heavy interactivity, SEO irrelevant             | Dashboard widgets inside client islands                           |

**Default:** Server Components + static generation for marketing; client islands for app shell.

---

## 10. API layer

```
Component → useAuth / useQuery → auth.service → apiClient → Backend
```

- **`services/api/client.ts`** — Axios instance, auth header, 401 refresh queue
- **`services/api/errors.ts`** — Normalized `ApiError` for UI/toasts
- **`services/auth/auth.service.ts`** — Domain endpoints only

**Refresh strategy:** Single in-flight `refreshPromise` prevents thundering herd on token expiry.

---

## 11. Authentication

- JWT access token in cookie (`kyndl_access_token`) for middleware visibility
- Refresh token cookie + `/auth/refresh` rotation
- `middleware.ts` — redirect unauthenticated users from `/dashboard`, `/admin`
- RBAC — decode JWT role for `/admin` (production: verify signature server-side)
- `useAuth` hook — login/register/logout mutations + profile query
- `store/auth.store.ts` — persisted user snapshot

**Security note:** For maximum security, prefer **httpOnly** cookies set by your Django API; middleware then only checks presence, not client-readable tokens.

---

## 12. Code quality

- **ESLint** — `eslint-config-next` + `simple-import-sort` + Prettier disambiguation
- **Prettier** — `.prettierrc`
- **Husky** — `pre-commit` → `lint-staged`
- **Commits** — Recommend [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`

---

## 13. Performance

- `dynamic()` for hero visual (code splitting)
- `optimizePackageImports` for lucide, framer-motion, react-query
- Server Components on marketing routes
- Image formats AVIF/WebP in `next.config.ts`
- Query `staleTime` / `gcTime` defaults in `lib/query-client.ts`
- Memoize expensive client lists; avoid global re-renders from Zustand (selector pattern)

---

## 14. Developer experience

- `@/*` path alias (`tsconfig.json`)
- `.vscode/settings.json` + `extensions.json`
- `npm run validate` before PR
- `.env.example` committed; `.env.local` gitignored

---

## 15. Environment variables

| Variable                            | Scope  | Purpose                  |
| ----------------------------------- | ------ | ------------------------ |
| `NEXT_PUBLIC_APP_URL`               | Client | Canonical URLs, metadata |
| `NEXT_PUBLIC_API_URL`               | Client | Axios base URL           |
| `NEXT_PUBLIC_APP_NAME`              | Client | Branding                 |
| `NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS` | Client | Devtools toggle          |
| `NODE_ENV`                          | Server | Environment mode         |

Validated in `config/env.ts` — invalid env throws at import time during build.

---

## 16. Naming conventions

| Entity     | Convention                 | Example                      |
| ---------- | -------------------------- | ---------------------------- |
| Components | PascalCase                 | `LoginForm.tsx`              |
| Hooks      | `use` prefix               | `useAuth.ts`                 |
| Stores     | `*.store.ts`               | `auth.store.ts`              |
| Services   | `*.service.ts`             | `auth.service.ts`            |
| Schemas    | `*.schema.ts`              | `login.schema.ts`            |
| Query keys | factory in `query-keys.ts` | `queryKeys.users.detail(id)` |
| Routes     | `ROUTES` constant          | `ROUTES.dashboard`           |

---

## 17. Scalability recommendations

1. Add features as `features/<domain>/` with `components`, `hooks`, `schemas`, optional `api/`.
2. Introduce `app/(dashboard)/[workspaceId]/` for multi-tenant URLs.
3. Split `services/` by domain mirroring backend (`crm.service.ts`, `billing.service.ts`).
4. Add `app/api/` Route Handlers only for BFF patterns (hide secrets, aggregate APIs).
5. Consider Turborepo when adding `packages/ui` or mobile.
6. Internationalization: `next-intl` in `app/[locale]/` when expanding markets.

---

## 18. Security best practices

- Never commit `.env.local` or secrets
- Validate all env at build time
- CSP headers via `next.config.ts` headers() in production
- Sanitize user HTML; use MDX with allowlists for marketing
- CSRF: `withCredentials` + SameSite cookies when API is cross-origin
- Rate-limit auth routes at API layer
- Rotate refresh tokens; short-lived access tokens
- Prefer httpOnly cookies from backend over JS-readable tokens for XSS resilience

---

## 19. Deployment

**Vercel (recommended for Next.js)**

```bash
npm run build
# Set env vars in Vercel project settings to match .env.example
```

- Enable preview deployments per PR
- Connect `NEXT_PUBLIC_API_URL` to staging/production API
- Use Vercel Analytics / Speed Insights

**Docker alternative:** multi-stage build → `node:20-alpine` runner with `output: standalone` in `next.config.ts` when needed.

---

## 20. CI/CD recommendations

```yaml
# .github/workflows/frontend.yml (suggested)
name: Frontend CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: kyndl_frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          {
            node-version: "20",
            cache: "npm",
            cache-dependency-path: kyndl_frontend/package-lock.json,
          }
      - run: npm ci
      - run: npm run validate
      - run: npm run build
        env:
          NEXT_PUBLIC_APP_URL: https://example.com
          NEXT_PUBLIC_API_URL: https://api.example.com/api/v1
          NEXT_PUBLIC_APP_NAME: Kyndl
```

- Block merge on failed `validate` + `build`
- Deploy `main` to production; PR previews to Vercel
- Optional: Chromatic for UI, Playwright for e2e on critical flows

---

## Wiring to Django backend

Point `NEXT_PUBLIC_API_URL` to your Django REST API (e.g. `http://localhost:8000/api/v1`). Implement matching endpoints:

- `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`, `GET /auth/me`

Response shape should match `types/api.ts` and `types/auth.ts`.

---

## Mental model

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Middleware  │→ │ Server RSC   │→ │ Client islands  │ │
│  └─────────────┘  └──────────────┘  │ Query + Zustand │ │
│                                      │ Motion + Forms  │ │
│                                      └────────┬────────┘ │
└───────────────────────────────────────────────┼─────────┘
                                                ▼
                                    ┌───────────────────────┐
                                    │ Axios services → API  │
                                    └───────────────────────┘
```

This architecture prioritizes **clear boundaries**, **SEO-first marketing**, and **client performance for app surfaces** — the standard pattern for high-growth SaaS teams.
