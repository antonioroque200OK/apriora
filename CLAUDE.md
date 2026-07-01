# CLAUDE.md

# Kyvio

## Project Overview

Kyvio is a Brazilian gamified learning platform inspired by Kahoot, designed to provide a more pedagogical, teacher-friendly and student-friendly experience for Brazilian educational institutions.

The platform combines live classroom interaction, gamification, collaborative learning and detailed pedagogical reporting.

The project consists of three primary applications:

- Web application for teachers and administrators.
- Mobile application for students (and potentially teachers in future versions).
- Backend API responsible for authentication, quizzes, realtime sessions, rankings and reports.

Kyvio follows a **Specification-Driven Development** approach.

Product understanding always precedes implementation.

Documentation is considered part of the product.

---

# Engineering Philosophy

The repository is intended to evolve for many years.

Maintainability is always preferred over short-term convenience.

Before implementing any meaningful change:

1. Verify the current Git Worktree.
2. Verify the current branch.
3. Verify the GitHub Issue associated with the current work.
4. Inspect the existing implementation.
5. Understand the current architecture.
6. Explain observations.
7. Present viable alternatives whenever appropriate.
8. Explain trade-offs.
9. Justify the chosen solution.
10. Update documentation when necessary.
11. Implement.

Never:

- guess architectural intent;
- rewrite large portions of the project without justification;
- refactor unrelated code;
- introduce technologies simply because they are popular.

Prefer:

- incremental improvements;
- explicit code;
- predictable behavior;
- maintainability.

---

# Technology Stack

## Monorepo

- pnpm Workspaces
- Turborepo

---

## Web

- Next.js 16
- App Router
- TypeScript
- Turbopack
- Tailwind CSS
- shadcn/ui

---

## Mobile

- React Native
- Expo
- TypeScript

---

## Backend

- NestJS
- Fastify Adapter
- Socket.IO
- Prisma ORM
- PostgreSQL
- Zod
- JWT Authentication

---

## Tooling

- Biome
- GitHub Actions
- Dev Container

---

## Deployment

Development

- Dev Container

Initial Deployment

- Vercel
- Render
- Neon PostgreSQL

Future Deployment

- VPS

---

# Repository Structure

```

apps/
    web/
    mobile/
    api/

packages/
    shared/
    api-client/
    config/
    ui/

docs/
    foundation/
    prd/
    architecture/
    domain/
    roadmap/
    adr/

.github/

.devcontainer/

.claude/

```

This structure should remain stable.

Large reorganizations must be documented through an ADR.

---

# Documentation Strategy

Each documentation directory has a single responsibility.

## docs/foundation

Repository engineering decisions.

Contains:

- engineering-foundation.md

---

## docs/prd

Product Requirements Documentation.

Defines:

- product vision
- users
- requirements
- features
- acceptance criteria

---

## docs/architecture

Technical architecture.

Expected files:

- README.md
- frontend.md
- backend.md
- realtime.md
- database.md
- deployment.md

---

## docs/domain

Business domain.

Contains:

- entities
- aggregates
- business rules
- state transitions

---

## docs/roadmap

Product evolution.

Contains:

- MVP
- V1
- V2
- backlog

---

## docs/adr

Architecture Decision Records.

Expected:

- ADR-001 — Monorepo and Development Workflow
- ADR-002 — Technology Stack

Future architectural decisions must be recorded here.

---

# Documentation Rules

Never mix responsibilities.

Engineering belongs in:

- Foundation
- ADRs

Product belongs in:

- PRD

Business logic belongs in:

- Domain

Technical implementation belongs in:

- Architecture

Project planning belongs in:

- Roadmap

Documentation is part of the implementation.

Whenever implementation changes architecture, documentation must also change.

---

# Development Lifecycle

Every feature should follow the same lifecycle.

Engineering Foundation

↓

Product Discovery

↓

PRD

↓

Architecture

↓

Domain

↓

Roadmap

↓

Implementation

↓

Review

↓

Release

Implementation must never precede understanding.
