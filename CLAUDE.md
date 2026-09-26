# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fit Tracker is a workout tracking application with a Next.js static SPA frontend and NestJS REST API backend. The repository demonstrates both software engineering practices and AI-assisted development workflows with explicit agent rules.

**Tech Stack:**

- **Frontend:** Next.js 16 (static export), React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend:** NestJS, Better Auth, Prisma 7, PostgreSQL
- **Mobile:** Capacitor iOS (loads the same static `out/` export)
- **Testing:** Playwright E2E suite
- **Monorepo:** pnpm workspaces

## Workspace Structure

```
apps/
  api/          # NestJS REST API (port 3001)
  web/          # Next.js static SPA (port 3000)
packages/
  shared/       # DTOs, API paths, types (Prisma-free)
tests/e2e/      # Playwright E2E tests
.cursor/rules/  # Agent orchestration rules
```

## Common Commands

### Development

```bash
pnpm run dev              # Start both web + API
pnpm run dev:web          # Next.js only
pnpm run dev:api          # NestJS only
```

### Building

```bash
pnpm run build            # Build shared + API + web static export
pnpm run build:static     # Web static export with Capacitor checks
```

### Testing

```bash
pnpm run test             # Run E2E suite (frees port 3000 first)
pnpm exec playwright test tests/e2e/path/to/test.spec.ts --headed  # Single test
pnpm run test:unit        # API unit tests
pnpm run pretest          # Free port 3000 manually
```

### Linting & Type Checking

```bash
pnpm run lint             # Lint all workspaces
pnpm run format           # Format + auto-fix
pnpm exec tsc --noEmit -p apps/web    # Type check web
pnpm exec tsc --noEmit -p apps/api    # Type check API
```

### Database

```bash
pnpm run db:reset         # Reset DB + run migrations + seed
pnpm run db:full-reset    # Reset + seed
pnpm run db:deploy        # Apply migrations (CI/prod)
pnpm run db:generate      # Generate Prisma client
pnpm run db:seed          # Seed data only
```

### iOS (Capacitor)

```bash
pnpm run ios:build        # Generate assets + static export + cap sync
pnpm run ios:build:deploy # Build + install on paired iPhone
pnpm run ios:deploy       # Install last build on device
pnpm run ios:open         # Open Xcode
pnpm run ios:sync         # Capacitor sync only
pnpm run generate-ios-assets  # Regenerate icons/splash from favicon.svg
```

## Architecture Principles

### Static SPA + Separate API

- `apps/web` always builds as a static export (`output: "export"`)
- **No SSR, no Server Actions, no Route Handlers**
- All data comes from NestJS REST API at `API_BASE_URL`
- Capacitor iOS loads the same `out/` bundle; WebView calls the API

### Shared Package

- `packages/shared` contains DTOs, API path constants, and types
- **Must remain Prisma-free** (no Prisma imports allowed)
- Used by both web and API for contract alignment

### Clean Architecture Boundaries

- Keep domain logic independent from framework concerns
- Isolate side effects (network, storage, Capacitor) behind adapters
- Use dependency injection at boundaries

### API Envelope Contract

All API responses follow this shape:

```typescript
{ data: T, error: string | null }
```

**Success:** `error` is `null`, `data` contains the payload
**Failure:** `data` is `null` (or `{}`, `[]`, `""` when semantically clearer per endpoint), `error` contains `{ code, message }`

Example:

```typescript
// Success
{ data: { id: "123", name: "Bench Press" }, error: null }

// Failure
{ data: null, error: { code: "PROGRAM_NOT_FOUND", message: "Program not found." } }
```

### Request Validation

- Validate all incoming API requests at boundaries using **Zod**
- Parse once at the controller, pass typed values to services
- Return clear validation errors through the standard envelope

### Security

- Verify user ownership before mutations
- Fail closed on auth/authz uncertainty
- Never expose stack traces or DB details in API responses
- Don't log tokens, passwords, or personal data

## Testing Standards

### Playwright E2E Tests

- **Locators:** Use `page.getByRole` or `page.getByLabel` (never class selectors)
- **Accessibility:** Every interactive component needs `aria-label` or `title`
- **Organization:** Wrap journey steps in `test.step()` for clarity
- **Data Isolation:** Append `testInfo.testId` to created items (e.g., `Program - ${testInfo.testId}`)
- **Verification:** After modifying a test, **run it in the background** to verify it passes before completing the task
- **Hand-off:** End test-related responses with the command to run the test headed:
  ```bash
  pnpm exec playwright test <file_path> --headed
  ```

### Validation Workflow

Run these yourself in the terminal before treating a task as complete; don't only suggest the user run them.

| Change                                                                     | Validate with                                                                       |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `.ts`, `.tsx`, `.js`, `.jsx` (logic, types, hooks, components, API routes) | **Both** `tsc` and `eslint` on touched paths (or project-wide if the diff is small) |
| React hooks, imports, or patterns covered by ESLint plugins                | `eslint`                                                                            |
| Types-only or Prisma/schema changes that affect TS types                   | `tsc` (and `eslint` if `.ts` files changed)                                         |
| Markdown, images, `.env.example`, or config with no TS/JS impact           | Skip unless types or lint are clearly affected                                      |

```bash
pnpm exec tsc --noEmit -p apps/web    # non-watch check; `pnpm run tsc` runs --watch, don't use it here
pnpm exec tsc --noEmit -p apps/api
pnpm exec eslint -- path/to/changed-file.ts path/to/other.tsx   # scope to changed files for speed
```

For a broad refactor, `pnpm run lint` project-wide is acceptable.

1. After implementing or fixing TS/TSX/JS changes, run the checks that apply.
2. Fix reported errors; re-run until clean for your changes.
3. Report pre-existing errors separately; never ignore new errors you introduced.

### Package Script Naming

- Workflow test commands: `act:X` (e.g. `act:e2e`, `act:release`)
- Database operations: `db:X` (e.g. `db:reset`, `db:deploy`)
- Test commands: `test:X` (e.g. `test:e2e`)

When adding a command expected to run repeatedly (e.g. an `act` workflow check), add a dedicated `package.json` script rather than a one-off inline command.

### CodeRabbit CLI

CodeRabbit is installed in the terminal for manual review of changes.

- Run `cr -h` to see available commands and options.
- Prefer the `--agent` flag; for uncommitted changes: `coderabbit --agent -t uncommitted`.
- Do not run CodeRabbit more than 3 times for the same set of changes.

## Data Model Highlights

Key Prisma entities:

- **User** → programs, exercises, workouts, bodyMetrics
- **Program** ↔ **Exercise** via **ProgramToExercise** (explicit join table with `order`)
- **Workout** → **WorkoutExercise** → **Set**
- **ProgramGroup** → **Program** (optional grouping)
- User-scoped ownership with cascade deletes

Primary domain modules (apps/api/src):

- `program/` - Program CRUD, AI generation
- `exercise/` - Exercise library
- `workout/` - Session tracking, sets
- `body-metrics/` - Body composition tracking
- `progress/` - Progress analytics

## Environment Setup

Minimum required in `.env`:

```bash
DATABASE_URL=
BETTER_AUTH_SECRET=
API_BASE_URL=http://localhost:3001
```

For AI program generation:

```bash
OPENAI_API_KEY=
AI_PROGRAM_MODEL=gpt-4o-mini  # optional
```

For social auth:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

For iOS Simulator (loopback):

```bash
API_BASE_URL=http://127.0.0.1:3001
```

For iOS physical device on LAN, use Mac's LAN IP in `API_BASE_URL`.

## Cursor Rules Reference

The `.cursor/rules/` directory holds the same standards in Cursor's rule format, for parity between editors:

- **`architecture-fit.mdc`** - Static SPA boundaries, no SSR/Server Actions
- **`api-contracts.mdc`** - Response envelope, Zod validation at boundaries
- **`security-fit.mdc`** - Auth checks, fail closed, no sensitive logs
- **`testing.mdc`** - Playwright locator standards, verification protocol
- **`validation.mdc`** - When to run `tsc` and `eslint` before finishing tasks
- **`naming-scripts.mdc`** - `package.json` script naming conventions
- **`coderabbit-cli.mdc`** - CodeRabbit CLI usage

Their content is folded into this file directly above (Claude Code doesn't read `.mdc` files on its own), so this file is the source of truth here — keep both in sync if either changes.

`.cursor/rules/imported/` holds portable, non-project-specific rules (TypeScript strictness, naming, documentation, security principles, testing patterns) copied from `~/dotfiles/cursor/`. Their Claude Code equivalent lives in `~/.claude/CLAUDE.md`, not here.

## iOS Deployment

### Quick Deploy to iPhone (USB or Wi-Fi)

```bash
pnpm run ios:build:deploy
```

This runs the full pipeline: generate assets, static export, Capacitor sync, Xcode build, and install.

**Requirements:**

- Xcode with Debug signing configured
- Paired device (USB or Wi-Fi pairing)
- Config file: `ios-deploy.config.json` (copy from `ios-deploy.config.example.json`)

### Live Reload via Tunnel (Optional)

For off-LAN development with HTTPS origins:

1. Configure `config/cloudflared.dev.yml`
2. Set `MOBILE_DEV_URL=https://dev.sfivaz.com` and `API_BASE_URL=https://api-dev.sfivaz.com`
3. Run `pnpm run dev:lan` + `pnpm run tunnel:dev` + `pnpm run ios:build:deploy`

## Common Gotchas

- **Port 3000 conflicts:** Run `pnpm run pretest` before E2E tests or `pnpm dev` if you get address-in-use errors
- **Static export:** Next `output: "export"` means no dynamic routes, no server runtime. All pages are pre-rendered.
- **API calls from Capacitor:** WebView origin is `capacitor://localhost`. CORS is configured in NestJS to allow this.
- **Auth tokens:** Better Auth uses bearer tokens. `apps/web/lib/api-client.ts` sends `Authorization: Bearer ...` after `hydrateMobileAuthToken()`.
- **Source map warnings in iOS:** Safari Web Inspector may log missing `.js.map` files when running static builds. This is devtools noise, not app errors.
- **Validation rules:** Always run `tsc` and `eslint` after editing `.ts/.tsx` files before marking a task complete.

## iOS v1 Scope

**Included:** Email/password auth, exercise library, programs, workout sessions, body metrics
**Deferred:** Social auth, push notifications, advanced analytics, server-coupled features

Offline capability covers programs, exercises, body metrics, and logging sets on an
already-started workout. Starting a brand-new workout still requires connectivity (the
server assigns the workout id); see `apps/web/lib/offline/data-adapters.ts`.

## CI/CD

- **E2E workflow:** `.github/workflows/e2e.yml` (runs on PRs + main/master)
- **Release workflow:** `.github/workflows/release.yml` (semantic-release)

## Further Reading

For portfolio review, focus on:

- `apps/web/app/` - Product UI and route composition
- `apps/web/lib/` - Client actions, domain logic
- `apps/api/src/` - API controllers, services
- `apps/api/prisma/schema.prisma` - Data model
- `tests/e2e/` - Behavioral verification
- `.cursor/rules/` - Agent orchestration standards
