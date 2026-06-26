# Apriora

A Brazilian gamified learning platform — more pedagogical, more teacher-friendly, and better aligned with Brazilian educational workflows.

> **Current status: Phase 0 — Engineering Foundation.**
> No product functionality has been implemented. The repository contains only the monorepo scaffold, toolchain, and documentation foundation.

---

## Product Vision

Apriora enables teachers to create and run live quiz sessions with real-time student participation, gamified scoring, and detailed post-session reports — designed for the rhythm and culture of Brazilian classrooms.

**Surfaces:**

- **Web** — teacher interface: quiz creation, live session management, dashboard, analytics.
- **Mobile** — student experience: join sessions, answer questions, see rankings in real time.
- **API** — backend: authentication, quiz management, live session engine, scoring, reports.

---

## Repository Structure

```text
apriora/
├── .devcontainer/      # Unified development environment
├── .github/
│   ├── workflows/      # GitHub Actions CI
│   └── ISSUE_TEMPLATE/ # Issue templates
├── .claude/            # Claude Code skills and commands
├── apps/
│   ├── web/            # Next.js 16 — teacher UI + landing
│   ├── mobile/         # React Native + Expo — student experience
│   └── api/            # NestJS + Fastify — backend
├── packages/
│   ├── shared/         # Domain types, schemas, constants, helpers
│   ├── api-client/     # Typed HTTP + Socket.IO client
│   ├── config/         # Shared tsconfig and Biome config
│   └── ui/             # Shared UI primitives (placeholder)
├── docs/
│   ├── foundation/     # Engineering foundation document
│   ├── prd/            # Product Requirements (Phase 2)
│   ├── architecture/   # Software Architecture (Phase 3)
│   ├── domain/         # Domain Model (Phase 4)
│   ├── roadmap/        # Roadmap (Phase 5)
│   └── adr/            # Architecture Decision Records
├── infra/              # Docker, migrations, ops scripts
├── biome.json          # Format + lint (Biome)
├── turbo.json          # Task pipeline (Turborepo)
├── pnpm-workspace.yaml # Workspace manifest
└── package.json        # Root scripts
```

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Monorepo | pnpm Workspaces + Turborepo |
| Code quality | Biome (format + lint) |
| Web | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Mobile | React Native 0.79, Expo SDK 53, Expo Router |
| API | NestJS 11, Fastify adapter, Socket.IO, Prisma, PostgreSQL |
| Validation | Zod |
| Auth | JWT + Passport |
| Database | Neon (serverless PostgreSQL) |
| Deployment | Vercel (web), Render (api), Expo EAS (mobile) |

See [ADR-002](docs/adr/adr-002-technology-stack.md) for the full rationale.

---

## Monorepo

This repository uses **pnpm workspaces** for package management and **Turborepo** for task orchestration.

**Turborepo** (`turbo.json`) runs tasks across all packages with dependency-aware scheduling and local caching. It is not a bundler.

**Turbopack** is the development bundler built into Next.js 16 (`next dev`). It is not Turborepo.

Internal packages are linked via the `workspace:*` protocol:

```jsonc
// apps/web/package.json
{
  "dependencies": {
    "@apriora/shared": "workspace:*",
    "@apriora/api-client": "workspace:*"
  }
}
```

See [ADR-001](docs/adr/adr-001-monorepo-and-workflow.md) for the full rationale.

---

## Local Development

### Prerequisites

- Node 24
- pnpm 10 (`corepack enable && corepack use pnpm@10`)

### Setup

```bash
pnpm install         # Install all workspace dependencies
pnpm dev             # Start all apps concurrently
```

### Scoped commands

```bash
pnpm --filter @apriora/web dev
pnpm --filter @apriora/api dev
pnpm --filter @apriora/mobile dev
```

### Quality gates

```bash
pnpm check           # Biome: format + lint + imports (writes)
pnpm typecheck       # TypeScript: all packages
pnpm build           # Full build
```

---

## Dev Container

Open this repository in a Dev Container for a pre-configured environment:

- Node 24
- pnpm 10 (via Corepack)
- GitHub CLI (`gh`)
- Docker CLI
- VS Code: Biome, Tailwind IntelliSense, TypeScript, Prisma, Expo

**VS Code:** `Cmd+Shift+P` → `Dev Containers: Reopen in Container`

Forwarded ports: `3000` (web), `3001` (api), `5432` (postgres), `8081` (mobile/Expo).

---

## Branch Strategy

```text
main       ← production (protected)
staging    ← integration / preview
feature-*  ← individual features, branch from staging
```

`feature-*` → PR → `staging` → PR → `main`

All merges require a passing CI run.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and PR:

- Format check (Biome)
- Lint (Biome)
- Typecheck (TypeScript)
- Test (when implemented)
- Build (gated on format + lint + typecheck)

---

## Deployment

| Surface | Platform | Trigger |
| --- | --- | --- |
| Web (`apps/web`) | Vercel | Push to `main` / PR preview |
| API (`apps/api`) | Render | Push to `main` |
| Database | Neon | Managed (branching per PR) |
| Mobile (`apps/mobile`) | Expo EAS | Manual / CI trigger |

---

## Documentation

| Document | Location |
| --- | --- |
| Engineering Foundation | [docs/foundation/engineering-foundation.md](docs/foundation/engineering-foundation.md) |
| ADR-001: Monorepo and Workflow | [docs/adr/adr-001-monorepo-and-workflow.md](docs/adr/adr-001-monorepo-and-workflow.md) |
| ADR-002: Technology Stack + tRPC | [docs/adr/adr-002-technology-stack.md](docs/adr/adr-002-technology-stack.md) |
| Architecture (placeholder) | [docs/architecture/](docs/architecture/) |
| PRD (placeholder) | [docs/prd/](docs/prd/) |
| Domain Model (placeholder) | [docs/domain/](docs/domain/) |
| Roadmap (placeholder) | [docs/roadmap/](docs/roadmap/) |

---

## Development Phases

| Phase | Name | Status |
| --- | --- | --- |
| **0** | Engineering Foundation | ✅ Complete |
| **1** | Product Discovery (`grill-me`) | Pending |
| **2** | PRD (`to-prd`) | Pending |
| **3** | Software Architecture | Pending |
| **4** | Domain Model | Pending |
| **5** | Roadmap | Pending |
| **6** | Implementation | Pending |
