# Kyndl Frontend

Modern SaaS frontend built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Zustand, and TanStack Query.

## Quick start

```bash
cd kyndl_frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:4000](http://localhost:4000).

> **Windows:** Port 3000 is often reserved by Hyper-V/WSL (`2921–3020`). This project uses **4000** for `npm run dev`. Override with `next dev -p <port>` if needed.

## Documentation

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full system design: folder structure, state management, SEO, auth, API layer, deployment, and CI/CD.

## Scripts

| Script             | Description                     |
| ------------------ | ------------------------------- |
| `npm run dev`      | Development server              |
| `npm run build`    | Production build                |
| `npm run lint`     | ESLint                          |
| `npm run format`   | Prettier                        |
| `npm run validate` | Typecheck + lint + format check |

## Stack

Next.js · TypeScript · Tailwind · shadcn/ui · Framer Motion · Zustand · TanStack Query · React Hook Form · Zod · Axios
