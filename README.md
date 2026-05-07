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

### 4) Prepare database

```bash
pnpm run db:reset
```

### 5) Start the app

```bash
pnpm run dev
```

## Static export build path (iOS/Capacitor)

Use the dedicated static target when preparing a bundle for Capacitor:

```bash
pnpm run build:static
```

This enables `output: "export"` in Next.js and generates an exportable web bundle in `.next-static/` while keeping the default `pnpm run build` behavior unchanged for server-backed web deployment.

### Capacitor iOS workflow

The native iOS shell lives in `ios/` and is configured by `capacitor.config.ts` to load the static `.next-static/` bundle.

Prerequisites for native iOS work:

- Xcode with the iOS SDK
- Xcode command line tools

Build and sync the static web bundle into the native project:

```bash
pnpm run ios:build
```

Open the generated Xcode workspace:

```bash
pnpm run ios:open
```

If `.next-static/` already exists and only native plugin/config wiring changed, run:

```bash
pnpm run ios:sync
```

Use Xcode to select signing, run on a simulator/device, and create App Store archives. The copied web assets and generated Capacitor config under `ios/App/App/` are ignored because they are reproducible from `pnpm run ios:build`.

### Static/mobile environment variables

For regular web deployment, leave these unset to use same-origin `/api` and auth routes.
For static export/mobile runtime, set both to your hosted backend origin:

- `NEXT_PUBLIC_API_BASE_URL` (used by `lib/api-client.ts`)
- `NEXT_PUBLIC_AUTH_BASE_URL` (used by `lib/auth-client.ts`)

## Running tests

### E2E suite

```bash
pnpm exec playwright test tests/e2e
```

### Single E2E file (headed)

```bash
pnpm exec playwright test tests/e2e/settings/sign-out.spec.ts --headed
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
- `pnpm run ios:build` - build the static bundle and sync it into the iOS project
- `pnpm run ios:open` - open the Capacitor iOS workspace in Xcode
- `pnpm run lint` - lint checks
- `pnpm run format` - format + lint fixes
- `pnpm run db:reset` - reset DB + seed
- `pnpm run db:deploy` - apply migrations (CI/prod style)
- `pnpm exec playwright test tests/e2e` - run E2E suite

---

If you are reviewing this project for portfolio purposes, the most representative folders are:

- `app/` (product UI and route composition)
- `lib/` (actions, domain logic, integrations)
- `prisma/` (schema + seed data)
- `tests/e2e/` (behavioral verification)
- `.cursor/rules/` (agent orchestration standards)
