# Engineering Foundation — Apriora

**Phase:** 0 — Foundation
**Date:** 2026-06-25
**Status:** Active

---

## 1. Project Overview

Apriora is a Brazilian gamified learning platform inspired by Kahoot, designed to be more pedagogical, more teacher-friendly, and better aligned with Brazilian educational workflows.

It ships as three surfaces:

- **Web** — teacher interface (quiz creation, session management, live dashboard, reports) and public landing page.
- **Mobile** — student experience during live sessions (joining, answering, real-time feedback, rankings).
- **API** — backend service for authentication, quiz management, live sessions (WebSocket), scoring, rankings, and reporting.

---

## 2. Engineering Philosophy

These principles govern every technical decision in this repository.

### 2.1 Inspect Before Modifying

Before touching any file, understand its purpose and its dependents. Identify strengths and weaknesses of the current state. Propose incremental improvements rather than destructive rewrites.

### 2.2 Specification-Driven Development

No code is written without a documented specification. The order is:

**PRD → Architecture → Domain Model → Roadmap → Implementation**

Skipping phases produces code that is correct but wrong.

### 2.3 Document Decisions, Not Just Outcomes

Every significant architectural decision must be recorded in an ADR before it is implemented. The ADR explains the context, the alternatives considered, the trade-offs, and the rationale. This record is as important as the code itself.

### 2.4 Justify Technology Choices

No technology is adopted because it is popular. Each adoption must answer:

- What problem does it solve that nothing already in the stack solves?
- What is the cost (learning curve, maintenance, coupling)?
- What are the realistic alternatives and why are they inferior for this specific context?

### 2.5 Preserve Existing Work

Existing UI and code that serves its purpose should be preserved. Refactoring for its own sake introduces risk without benefit. Only refactor when a concrete, documented improvement is achievable.

### 2.6 Keep Documentation Synchronized

When the architecture changes, update the relevant documentation in the same commit or PR. Stale documentation is worse than no documentation — it actively misleads.

### 2.7 Code Quality Is Non-Negotiable

Before any work is considered complete:

- `pnpm check` (Biome — format + lint)
- `pnpm typecheck` (TypeScript)
- `pnpm test` (when tests exist)
- `pnpm build` (when building the affected surface)

CI enforces all of the above automatically.

---

## 3. Repository Structure

```text
apriora/
├── .devcontainer/      # Unified development environment (Dev Container)
├── .github/
│   ├── workflows/      # GitHub Actions CI
│   └── ISSUE_TEMPLATE/ # Bug report and feature request templates
├── .claude/
│   ├── skills/         # Claude Code custom skills
│   └── commands/       # Claude Code custom commands
├── apps/
│   ├── web/            # Next.js 16 — teacher UI and landing
│   ├── mobile/         # React Native + Expo — student experience
│   └── api/            # NestJS + Fastify — backend
├── packages/
│   ├── shared/         # Domain types, schemas, constants, helpers
│   ├── api-client/     # HTTP + Socket.IO client (web + mobile)
│   ├── config/         # Shared tsconfig and Biome config
│   └── ui/             # Shared UI primitives (placeholder — see §6)
├── docs/
│   ├── foundation/     # This document
│   ├── prd/            # Product Requirements (Phase 2)
│   ├── architecture/   # Software Architecture (Phase 3)
│   ├── domain/         # Domain Model (Phase 4)
│   ├── roadmap/        # Roadmap (Phase 5)
│   └── adr/            # Architecture Decision Records
├── infra/
│   ├── docker/         # Docker Compose and Dockerfile definitions
│   ├── migrations/     # SQL migration history (if outside Prisma)
│   └── scripts/        # Deployment and ops scripts
├── biome.json          # Single root Biome config (format + lint)
├── turbo.json          # Turborepo task pipeline
├── pnpm-workspace.yaml # Workspace manifest
├── package.json        # Root scripts and tooling deps
├── CLAUDE.md           # Agent instructions
└── README.md           # Project overview
```

---

## 4. Technology Stack

### 4.1 Monorepo Toolchain

| Tool | Version | Role |
| --- | --- | --- |
| pnpm | 10 | Package manager and workspace linker |
| Turborepo | 2 | Task orchestration and build caching |
| Biome | 2 | Format + lint (replaces ESLint + Prettier) |
| TypeScript | 5 | Type system across all packages |

**Turborepo vs. Turbopack:** Turborepo orchestrates tasks across the monorepo. Turbopack is the Rust-based bundler embedded in Next.js for `next dev`. They are independent tools that share the Turbo brand. See [ADR-001](../adr/adr-001-monorepo-and-workflow.md).

### 4.2 Web (`apps/web`)

| Technology | Role |
| --- | --- |
| Next.js 16 | Framework (App Router) |
| Turbopack | Dev bundler (default in Next.js 16, no config needed) |
| React 19 | UI runtime |
| TypeScript | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui (base-nova) | Component library |
| `@base-ui/react` | Accessible UI primitives (used by shadcn base-nova) |
| `next-themes` | Dark mode |
| Geist / Geist Mono | Typography |
| Lucide React | Icons |
| Recharts | Data visualisation |

### 4.3 Mobile (`apps/mobile`)

| Technology | Role |
| --- | --- |
| React Native 0.79 | Cross-platform native UI |
| Expo SDK 53 | Managed workflow, build toolchain |
| Expo Router 5 | File-based navigation |
| TypeScript | Type safety |

### 4.4 API (`apps/api`)

| Technology | Role |
| --- | --- |
| NestJS 11 | Backend framework (DI, modules, guards, interceptors) |
| Fastify adapter | HTTP server (high performance, replaces Express) |
| Socket.IO | WebSocket server for live sessions |
| Prisma 6 | ORM and migration runner |
| PostgreSQL (Neon) | Primary database |
| Zod | Runtime validation (DTOs, env vars) |
| JWT / Passport | Authentication |

### 4.5 Infrastructure

| Technology | Role |
| --- | --- |
| GitHub Actions | CI (format, lint, typecheck, test, build) |
| Vercel | Web deployment |
| Render | API deployment |
| Neon | Serverless PostgreSQL |
| Expo EAS | Mobile build and distribution |
| Dev Container | Reproducible local development |

Full rationale in [ADR-002](../adr/adr-002-technology-stack.md).

---

## 5. Code Quality — Biome

### Why Biome

Biome replaces the ESLint + Prettier pair used in the initial scaffold.

**Key reasons:**

1. **Single tool** — one config (`biome.json`), one VS Code extension, one CI command.
2. **Monorepo-native** — Biome walks up from each file to find the root `biome.json` automatically, eliminating per-package config duplication.
3. **Speed** — Rust runtime runs 10–100× faster than ESLint + Prettier combined; format + lint across the full monorepo completes in milliseconds.
4. **Built-in import organizer** — no `eslint-plugin-import` needed.
5. **Consistent defaults** — Biome's recommended ruleset covers the same categories as ESLint's recommended + TypeScript-ESLint.

**Known gap:** Biome does not sort Tailwind CSS classes (equivalent to `prettier-plugin-tailwindcss`). This is acceptable at Phase 0 — the design system is not yet established and there is no product code. If class ordering becomes a real maintainability concern post-Phase 6, re-evaluate at that time.

### Configuration

Root `biome.json`:

- Formatter matches the original Prettier settings: `semi: false`, `quoteStyle: double`, `trailingCommas: es5`, `lineWidth: 80`, `indentStyle: space`.
- Linter: Biome recommended + `noUnusedImports: warn`, `noUnusedVariables: warn`, `noExplicitAny: warn`.
- VCS integration: respects `.gitignore`.
- Import organizer: enabled.

### Scripts

| Command | Action |
| --- | --- |
| `pnpm check` | Format + lint + organize imports (writes) |
| `pnpm format` | Format only (writes) |
| `pnpm lint` | Lint only (per Turbo, per package) |
| `pnpm ci:check` | CI mode — reports diffs without writing |

---

## 6. Shared Packages

### `@apriora/shared`

The canonical source for domain types, enums, constants, Zod schemas, business-rule helpers, and utilities. Both `apps/web` and `apps/mobile` import from here. The API (`apps/api`) will also share types with this package to keep contracts explicit.

**Rule:** If a type or constant is used by more than one app or package, it belongs in `@apriora/shared`.

### `@apriora/api-client`

Typed HTTP client and Socket.IO client shared between web and mobile. Abstracts the API surface so apps never call `fetch` directly. Depends on `@apriora/shared` for DTOs.

Will be implemented in Phase 6 alongside the API.

### `@apriora/config`

Shared tooling configuration:

- `tsconfig/base.json` — base TypeScript settings
- `tsconfig/nextjs.json` — extends base for Next.js App Router
- `tsconfig/react-native.json` — extends base for React Native
- `biome/base.json` — extends root `biome.json` (for per-package overrides if needed)

### `@apriora/ui` — Deferred

**Decision:** Do not implement a shared UI package at this stage.

`apps/web` uses Tailwind CSS + shadcn/ui, which are DOM-specific. `apps/mobile` uses React Native, which has no DOM. Bridging these requires non-trivial abstractions (React Native Web, component file splitting, or a design-token-only layer). None of these are justified before the product design is established.

**Re-evaluate in Phase 3** (Software Architecture) once concrete screens exist and patterns emerge. If shared logic is identified at that point, extract it then.

---

## 7. Development Workflow

### 7.1 Local Setup

```bash
# Prerequisites: Node 24, pnpm 10 (or use Dev Container)
pnpm install          # Install all workspace dependencies
pnpm dev              # Start all apps (Turbo concurrent)

# Scoped starts
pnpm --filter @apriora/web dev
pnpm --filter @apriora/api dev
pnpm --filter @apriora/mobile dev
```

### 7.2 Dev Container

The `.devcontainer/devcontainer.json` provides a pre-configured environment with:

- Node 24 (base image)
- pnpm 10 via Corepack
- GitHub CLI (`gh`)
- Docker CLI (Docker-outside-of-Docker)
- VS Code: Biome, Tailwind IntelliSense, TypeScript, Prisma, Expo

Open in Dev Container (VS Code: `Dev Containers: Reopen in Container`).

### 7.3 Quality Gates

Before committing:

```bash
pnpm check      # Biome: format + lint + imports
pnpm typecheck  # TypeScript: all packages
```

Before opening a PR:

```bash
pnpm build      # Full build (catches bundler errors)
```

---

## 8. Git and GitHub Workflow

### Branch Strategy

```text
main        ← production, protected, requires PR + CI
staging     ← integration, auto-deploys to preview environments
feature-*   ← individual features, branched from staging
```

Flow: `feature-*` → **PR** → `staging` → **PR** → `main`

All merges require a passing CI run. Direct pushes to `main` and `staging` are blocked.

### GitHub Project Board (Kanban)

| Column | Meaning |
| --- | --- |
| Backlog | Accepted work not yet ready to start |
| Ready | Fully specified, unblocked, ready to pick up |
| In Progress | Actively being worked on |
| In Review | PR open, waiting for review |
| Done | Merged to staging or main |

### GitHub CLI Automation

The repository is structured so Claude Code can automate GitHub workflows using `gh`:

```bash
# Create a feature branch and linked issue
gh issue create --title "feat: quiz editor" --label "feature"
gh issue develop <number> --base staging --checkout

# Open a PR
gh pr create --base staging --fill

# Move issue on project board
gh project item-edit --project-id <id> --field-name Status --field-value "In Progress"
```

---

## 9. CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on push to `main`/`staging` and on all PRs:

| Job | Command | Gate |
| --- | --- | --- |
| format | `biome format .` | Independent |
| lint | `biome lint .` | Independent |
| typecheck | `pnpm typecheck` | Independent |
| test | `pnpm test` | Independent (tolerates missing scripts) |
| build | `pnpm build` | Requires format + lint + typecheck |

---

## 10. Development Phases

| Phase | Name | Output |
| --- | --- | --- |
| **0** | Foundation | This document, toolchain, repository structure |
| **1** | Product Discovery (`grill-me`) | Validated product hypotheses |
| **2** | PRD (`to-prd`) | Product Requirements Document |
| **3** | Software Architecture | Architecture documents + ADRs |
| **4** | Domain Model | Domain glossary, entities, events |
| **5** | Roadmap | Prioritized milestones and backlog |
| **6** | Implementation | Product code |

No product functionality is implemented before Phase 6.
