<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Project overview
TenantShield is a single Next.js 16 (App Router, Turbopack) application with a Convex serverless backend. There are no workspace packages or monorepo sub-projects.

### Required environment variables
Create `.env.local` (gitignored) with:
- `NEXT_PUBLIC_CONVEX_URL` – Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` – Clerk publishable key (must be a valid `pk_test_…` or `pk_live_…` key)
- `CLERK_SECRET_KEY` – Clerk server-side key
- `GEMINI_API_KEY` – Google Gemini (used in Convex actions + `/api/chat`)
- `EXA_API_KEY` – Exa web-search (used in Convex actions + chat tools)

Without valid Clerk keys the dev server compiles but every route returns HTTP 500 because the Clerk middleware (`proxy.ts`, which acts as the Next.js middleware) rejects requests with an unparseable publishable key.

### Common commands
| Task | Command |
|------|---------|
| Install deps | `pnpm install --frozen-lockfile` |
| Dev server | `pnpm dev` (Next.js Turbopack on `:3000`) |
| Lint | `pnpm lint` (ESLint 9) |
| Type check | `npx tsc --noEmit` |
| Build | `pnpm build` |

### Gotchas
- The Next.js middleware file is **`proxy.ts`** (not `middleware.ts`). It uses `clerkMiddleware` from `@clerk/nextjs/server`.
- Tests in `tests/` are standalone Node scripts run with `node --env-file=.env.local tests/<file>.mjs`. They call Convex actions directly and require a live Convex deployment + valid keys.
- The `pnpm-workspace.yaml` only lists `ignoredBuiltDependencies`; it does not define workspace packages.
- Some build scripts are auto-ignored by pnpm (e.g. `esbuild`, `@clerk/shared`). This does not affect the dev server or build.
- Pre-existing lint errors (35 errors, 17 warnings) exist in the codebase on `main`; these are not regressions.
