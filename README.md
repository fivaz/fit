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
