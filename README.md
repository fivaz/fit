# Fit Tracker

Fit Tracker is first and foremost a workout application designed to help users manage their training end to end: organize exercises and programs, start sessions, log sets, and complete workouts with persisted progress.

## Why this project exists

This repository is intentionally built to show both:

1. hands-on software engineering (architecture, data modeling, testing, release automation), and
2. AI/agent orchestration in a real codebase (rules, contracts, repeatable quality gates).

## Core product capabilities

Implemented and tested user journeys include:

- Auth flows: register, login, validation, sign-out
- Exercise library: CRUD + filtering
- Workout programs: CRUD + ordering + exercise association
- Workout session flow:
  - start from a program
  - log reps/weight/time
  - manage sets (add/delete/warmup)
  - finish workout and redirect to progress
- Navigation + not-found states for invalid entities
- Body stats settings flow

Reference E2E coverage lives in `tests/e2e`.

## Tech stack

- Framework: Next.js 16 (App Router), React 19, TypeScript
- Data: PostgreSQL + Prisma
- Auth: better-auth (email/password + social provider config)
- UI: Tailwind CSS + Radix primitives + Framer Motion + Lucide icons
- Observability: Sentry (`@sentry/nextjs`)
- Testing: Playwright end-to-end suite
- Tooling: pnpm, ESLint, Prettier, Husky, Semantic Release

## Architecture highlights

- Clear separation between UI composition and action/data layers (for example: pages in `app/` call domain actions in `lib/**/actions`)
- Explicit relational data model for training domain:
  - `Program` <-> `Exercise` via `ProgramToExercise`
  - `Workout` + `WorkoutExercise` + `Set`
  - user-scoped ownership and cascade rules
- Runtime auth + origin constraints for local and E2E execution

See:

- `prisma/schema.prisma`
- `lib/auth.ts`
- `app/(dashboard)/**`

## Agent orchestration and engineering process

A key portfolio goal is showing structured AI-assisted delivery, not just code generation.

This repo includes a ruleset under `.cursor/rules` that codifies expectations for:

- architecture boundaries
- API envelope contracts and runtime validation
- security posture
- TypeScript and naming conventions
- testing and verification protocol

Notable examples:

- `.cursor/rules/api-contracts.mdc`
- `.cursor/rules/testing.mdc`
- `.cursor/rules/architecture.mdc`
- `.cursor/rules/security.mdc`

In practice, this means agent output is constrained by repeatable rules and reviewable standards.

## Getting started

### 1) Prerequisites

- Node.js 24
- pnpm 10+
- PostgreSQL

### 2) Install dependencies

```bash
pnpm install
```

### 3) Configure environment

```bash
cp .env.example .env
```

Set at minimum:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

If you want social login enabled locally, also set:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

To enable **AI coach program generation** (Create Program → AI coach), set:

- `OPENAI_API_KEY` — from [OpenAI](https://platform.openai.com/api-keys)
- `AI_PROGRAM_MODEL` (optional) — defaults to `gpt-4o-mini`

### 4) Prepare database

```bash
pnpm run db:reset
```

### 5) Start the app

```bash
pnpm run dev
```

## Static export build path (iOS/Capacitor)

The Capacitor iOS app loads a **static** Next export from `.next-static/` (`capacitor.config.ts` → `webDir`). That bundle has **no** embedded `app/api` server: `scripts/build-static.mjs` temporarily moves `app/api` aside so `output: "export"` can succeed, then restores it after the export.

For a one-off static folder without syncing iOS:

```bash
pnpm run build:static
```

The default `pnpm run build` path is unchanged for normal server-backed web deployment.

### Capacitor iOS workflow

Prerequisites: Xcode (+ CLI tools), PostgreSQL for `DATABASE_URL`, and env vars documented in **Static/mobile (Capacitor) environment** below.

| Step                          | Command                        | Role                                                                                                                     |
| ----------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Sync web build into `ios/`    | `pnpm run ios:build`           | Regenerate iOS assets from `public/favicon.svg`, run `build:static`, then `cap sync ios`. **Does not** start `next dev`. |
| Build + install on device     | `pnpm run ios:build:deploy`    | Same as `ios:build`, then `xcodebuild` + install on a paired iPhone (USB or Wi‑Fi). See **CLI deploy to iPhone** below.  |
| Install only (after a build)  | `pnpm run ios:deploy`          | Run `scripts/ios-deploy.mjs` without rebuilding the static bundle.                                                       |
| Icons / splash only           | `pnpm run generate-ios-assets` | Skip full static export when only native images changed.                                                                 |
| Capacitor config/plugins only | `pnpm run ios:sync`            | When `.next-static/` already exists.                                                                                     |
| Open Xcode                    | `pnpm run ios:open`            | Run Simulator or device, signing, archives.                                                                              |

Repository checks before release: `pnpm run ios:readiness` (see `docs/ios-qa-release-checklist.md`).

### CLI deploy to iPhone

Automated install uses the same Core Device stack as Xcode (`devicectl`), with `ios-deploy` as a fallback. You need a **Debug** signing team configured in Xcode at least once.

1. **Config file** — Copy `ios-deploy.config.example.json` → `ios-deploy.config.json` (gitignored). Set `deviceId` to your iPhone UDID, or leave empty to auto-select (prefers Wi‑Fi when `preferWireless` is true).
2. **Wireless (no USB)** — In Xcode: **Window → Devices and Simulators** → select your iPhone → enable **Connect via network** (pair over USB once if needed). Mac and iPhone on the same network; USB can be unplugged.
3. **Deploy** — `pnpm run ios:build:deploy` (full pipeline) or `pnpm run ios:deploy` after `ios:build`.

List paired devices:

```bash
xcrun devicectl list devices
# or (USB / legacy Wi‑Fi listing)
ios-deploy -c
```

**`ios-deploy.config.json` options** (see `ios-deploy.config.schema.json`):

| Field               | Default       | Purpose                                                                                         |
| ------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `enabled`           | `true`        | Set `false` to skip CLI deploy entirely.                                                        |
| `deviceId`          | `""`          | UDID or Core Device identifier; empty = auto-select.                                            |
| `preferWireless`    | `true`        | Prefer a network-connected device over USB when both are visible.                               |
| `installTool`       | `"auto"`      | `"devicectl"` (Xcode wireless stack), `"ios-deploy"`, or `"auto"` (devicectl, then ios-deploy). |
| `configuration`     | `"Debug"`     | Xcode build configuration.                                                                      |
| `derivedDataPath`   | `"ios/build"` | Where `App.app` is produced.                                                                    |
| `iosDeploy.noStart` | `false`       | When `true`, install only and do not launch the app on the device.                              |
| `iosDeploy.usbOnly` | `false`       | When using the ios-deploy fallback, pass `--no-wifi` (USB only).                                |

**Environment overrides** (see `.env.example`):

| Variable                | Purpose                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `IOS_DEPLOY_DEVICE_ID`  | Override `deviceId` from config.                                                       |
| `IOS_DEPLOY_REQUIRED=1` | Fail the script when no reachable iPhone is found (default: skip install with exit 0). |

If no device is found, deploy is skipped unless `IOS_DEPLOY_REQUIRED=1` — the static sync from `ios:build` still completes.

### Local API + iOS Simulator

The Simulator reaches your Mac at **loopback** (`http://127.0.0.1:3000` is the same machine as Xcode).

1. **`.env.local` (server)** — `BETTER_AUTH_URL` must match the origin the shell calls (see example). `DATABASE_URL`, `BETTER_AUTH_SECRET` as usual.
2. **Client URLs (baked into the static JS at `ios:build` time)** — Set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_AUTH_BASE_URL` in `.env.local`, or prefix one build with env vars, e.g. `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3000 NEXT_PUBLIC_AUTH_BASE_URL=http://127.0.0.1:3000 pnpm run ios:build`.
3. **`pnpm run dev`** — Keep this running in a terminal while you use sign-in and `/api/*` from the app (port **3000** by default). `ios:build` does not start the server.
4. **`pnpm run ios:build`** — After changing `NEXT_PUBLIC_*` or web code affecting the bundle.
5. **`pnpm run ios:open`** — Run on Simulator or device.

**Auth and CRUD from the shell:** the WebView origin is `capacitor://localhost`. `proxy.ts` applies `lib/cors.ts` rules on `/api/*` so cross-origin requests are allowed for trusted origins. Sign-in uses Better Auth’s **bearer** token; `lib/api-client.ts` sends `Authorization: Bearer …` on data calls after `hydrateMobileAuthToken()` so `/api/*` routes see a session (cookies alone are not enough across origins).

Free port **3000** before Playwright or a clean `pnpm dev`: `pnpm run pretest` or `node scripts/free-dev-server-port.mjs` (optional `DEV_SERVER_PORT` / `E2E_DEV_PORT`).

Safari Web Inspector may log missing `__next._tree.txt` or **`*.js.map`** files while you run a **static** shell or with source maps disabled; that noise is usually **devtools** trying to load maps, not your app logic failing.

**Clearer runtime logs**

- With `NEXT_PUBLIC_API_BASE_URL` set (typical Capacitor), failed `fetch` calls from `lib/api-client.ts` log **`[FitClient:apiFetch]`** with `url`, `status`, and `error` (no extra env).
- Missing program after navigation logs **`[FitClient:ProgramPage]`** with `programId`.
- Optional verbose traces: set **`NEXT_PUBLIC_CLIENT_DEBUG=1`** in `.env.local` and rebuild the static bundle, **or** in the Web Inspector console run `localStorage.setItem("fit:client-debug","1")` and reload (uses `lib/mobile/client-debug.ts`).

Example `.env.local` for Simulator (same host for all three; change port if needed):

```bash
BETTER_AUTH_URL=http://127.0.0.1:3000
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_AUTH_BASE_URL=http://127.0.0.1:3000
```

For a **physical device** on Wi‑Fi, use your Mac’s **LAN IP** for those three URLs (not `127.0.0.1`). Same network and firewall rules apply.

### Live reload via tunnel (optional)

To load the app from a running dev server instead of the bundled `.next-static/` files (useful when the iPhone is off-LAN or you want fast web reloads):

1. Start the dev server: `pnpm run dev`.
2. Start a tunnel, e.g. `cloudflared tunnel --url http://localhost:3000`, and copy the HTTPS URL.
3. Set **`MOBILE_DEV_URL`** in `.env` to your tunnel HTTPS origin (or set each var individually). It applies to `CAPACITOR_SERVER_URL`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_AUTH_BASE_URL`, and `BETTER_AUTH_TRUSTED_ORIGINS` when those are unset.
4. Run `pnpm run ios:sync` (or `ios:build`) and reopen the app on the device.

Native/Swift changes still require `ios:build` or `ios:build:deploy`. Quick tunnels get a new URL on each restart.

### Static/mobile (Capacitor) environment

| Variable                      | When                               | Purpose                                                                                                            |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| _(unset)_                     | Web app in browser                 | Same-origin `/api/*` and `/api/auth/*`.                                                                            |
| `NEXT_PUBLIC_API_BASE_URL`    | Capacitor / static bundle          | Base URL for `lib/api-client.ts` (`fetch`). Inlined at **`pnpm ios:build`**.                                       |
| `NEXT_PUBLIC_AUTH_BASE_URL`   | Capacitor / static bundle          | Better Auth client base (`lib/auth-client.ts`). Inlined at **`pnpm ios:build`**.                                   |
| `BETTER_AUTH_URL`             | Server (`pnpm dev` / `pnpm start`) | Public URL / cookie context; keep origin aligned with the two `NEXT_PUBLIC_*` values.                              |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Optional                           | Extra origins for Better Auth CSRF checks (comma-separated). Capacitor shell origins are built into `lib/auth.ts`. |
| `CORS_ALLOWED_ORIGINS`        | Optional                           | Extra allowed `Origin` values for `/api/*` CORS (`lib/cors.ts`).                                                   |
| `NEXT_PUBLIC_CLIENT_DEBUG`    | Optional                           | `1` / `true` → extra `[FitClient:*]` logs (`offline`, `apiFetch` when successful, etc.).                           |
| `MOBILE_DEV_URL`              | Optional (tunnel / LAN dev)        | Single origin; fills the Capacitor/auth/API vars below when each is unset (`lib/env/mobile-dev-url.ts`).           |
| `CAPACITOR_SERVER_URL`        | Optional (live reload)             | When set, Capacitor loads this URL instead of `.next-static/`; run `ios:sync` after changing.                      |
| `IOS_DEPLOY_DEVICE_ID`        | Optional (CLI deploy)              | Override iPhone UDID for `ios:build:deploy` / `ios:deploy`.                                                        |
| `IOS_DEPLOY_REQUIRED`         | Optional (CLI deploy)              | `1` → fail deploy when no paired device is reachable; default skips install.                                       |

See `.env.example` for commented templates (hosted API, local Simulator, physical device, tunnel, CLI deploy).

## Running tests

### E2E suite

Use `pnpm run test` so port **3000** is freed first (stops a stray `pnpm dev`), then Playwright starts its own `next dev` on that port.

```bash
pnpm run test
```

To run Playwright directly, stop anything on port 3000 first (or run `pnpm run pretest`), then:

```bash
pnpm exec playwright test tests/e2e
```

### Single E2E file (headed)

```bash
pnpm run pretest && pnpm exec playwright test tests/e2e/settings/sign-out.spec.ts --headed
```

Playwright configuration: `playwright.config.ts`.

## CI/CD

- E2E workflow: `.github/workflows/e2e.yml`
  - runs on PRs and pushes to `main`/`master`
  - provisions PostgreSQL service
  - installs Playwright browser
  - runs migrations
  - executes E2E tests
  - uploads `playwright-report/` and `test-results/` artifacts
- Release workflow: `.github/workflows/release.yml` (semantic-release)

## iOS v1 scope (static-first)

To support the planned static/offline-first iOS delivery, v1 intentionally focuses on email/password auth and core tracking flows while deferring server-coupled or advanced features.

### Included in iOS v1

- Authentication: email/password sign up and sign in
- Exercise library: create, edit, delete, and browse exercises
- Programs: create, edit, reorder, and assign exercises
- Workout sessions: start, log sets, update sets, finish workout
- Body metrics: create and update body metric entries

### Deferred from iOS v1

- Social login providers
- Advanced analytics and non-core dashboard enhancements
- Any feature that requires tight server rendering/runtime coupling

### Offline capability matrix

- `Auth (email/password)` - Included
  - Offline behavior: existing local session is reusable for app startup
  - Online requirement: first sign in and credential validation require network
- `Exercise CRUD` - Included
  - Offline behavior: full create/read/update/delete against local store
  - Online requirement: sync runs when network is available
- `Program CRUD + ordering` - Included
  - Offline behavior: full local create/edit/reorder/delete
  - Online requirement: sync runs when network is available
- `Workout session logging` - Included
  - Offline behavior: start/log/finish fully offline with local persistence
  - Online requirement: sync runs when network is available
- `Body metrics` - Included
  - Offline behavior: create/update entries offline
  - Online requirement: sync runs when network is available
- `Social auth` - Deferred
  - Offline behavior: not available in iOS v1
  - Online requirement: n/a
- `Advanced analytics` - Deferred
  - Offline behavior: not available in iOS v1
  - Online requirement: n/a

## Current status and roadmap

- Core training flows are implemented and covered by E2E tests.
- Some areas are intentionally still evolving (for example, parts of Home/Progress UI are marked as not fully implemented in code).

Planned evolution:

- richer progress analytics backed by persisted metrics
- broader CI test partitioning (smoke vs full suites)
- further hardening of agent-driven contribution workflows

## Repository scripts

Common commands:

- `pnpm run dev` - start dev server
- `pnpm run build` - production build
- `pnpm run build:static` - static export build for mobile/native bundles
- `pnpm run ios:build` - generate assets, static export, and Capacitor sync into the iOS project
- `pnpm run ios:build:deploy` - `ios:build` plus `xcodebuild` and install on a paired iPhone (USB or Wi‑Fi; see `ios-deploy.config.json`)
- `pnpm run ios:deploy` - install the last Xcode build on device without re-running `ios:build`
- `pnpm run ios:open` - open the Capacitor iOS workspace in Xcode
- `pnpm run ios:sync` - Capacitor sync only (when `.next-static/` is already built)
- `pnpm run ios:readiness` - repository checks before App Store / Xcode hardening
- `pnpm run generate-ios-assets` - regenerate iOS icon/splash assets from `public/favicon.svg`
- `pnpm run pretest` / `node scripts/free-dev-server-port.mjs` - free the default dev port (see `DEV_SERVER_PORT` in `.env.example`)
- `pnpm run lint` - lint checks
- `pnpm run format` - format + lint fixes
- `pnpm run db:reset` - reset DB + seed
- `pnpm run db:deploy` - apply migrations (CI/prod style)
- `pnpm run test` - run E2E suite (frees port 3000, then Playwright starts dev)

---

If you are reviewing this project for portfolio purposes, the most representative folders are:

- `app/` (product UI and route composition)
- `lib/` (actions, domain logic, integrations)
- `prisma/` (schema + seed data)
- `tests/e2e/` (behavioral verification)
- `.cursor/rules/` (agent orchestration standards)
