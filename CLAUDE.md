# CLAUDE.md

# Apriora

## Project Overview

Apriora is a Brazilian gamified learning platform inspired by Kahoot, designed to provide a more pedagogical, teacher-friendly and student-friendly experience for Brazilian educational institutions.

The project includes:

* Web application
* Mobile application
* Backend API

The project follows Specification-Driven Development.

Implementation must always be driven by documented decisions.

---

# Engineering Principles

Before implementing any meaningful change:

1. Inspect the existing implementation.
2. Understand the current architecture.
3. Explain observations.
4. Present viable alternatives whenever appropriate.
5. Explain trade-offs.
6. Justify the chosen approach.
7. Document the decision.
8. Implement.

Prefer incremental improvements.

Avoid destructive rewrites.

Avoid assumptions.

Never refactor unrelated code.

---

# Repository Structure

```text
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

---

# Technology Stack

## Monorepo

* pnpm Workspaces
* Turborepo

## Web

* Next.js 16
* Turbopack
* App Router
* Tailwind CSS
* shadcn/ui

## Mobile

* React Native
* Expo

## Backend

* NestJS
* Fastify
* Socket.IO
* Prisma
* PostgreSQL
* Zod
* JWT

## Tooling

* Biome
* GitHub Actions
* Dev Container

## Deployment

* Vercel
* Render
* Neon PostgreSQL

---

# Documentation Strategy

Documentation responsibilities are strictly separated.

```
docs/

foundation/
engineering-foundation.md

prd/

README.md

architecture/

README.md
frontend.md
backend.md
database.md
realtime.md
deployment.md

domain/

README.md

roadmap/

README.md

adr/

adr-001-monorepo-and-workflow.md
adr-002-technology-stack.md
```

Never mix:

* engineering decisions;
* product decisions;
* architectural decisions;
* domain decisions.

---

# Development Workflow

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

Implementation never precedes understanding.

---

# Branch Strategy

Production

```
main
```

Homologation

```
staging
```

Development

```
feature-<feature>
```

---

# Pull Request Workflow

Default workflow:

```
feature-* → staging → main
```

Use this workflow unless the Direct Merge Policy applies.

---

# Direct Merge Policy

The project owner permanently delegates authority to Claude Code to commit directly to `main` whenever the pending changes clearly qualify as low-risk repository maintenance.

Claude does **not** need to request additional authorization for changes covered by this policy.

Direct commits to `main` are permitted when **all** of the following are true:

* the change does not modify product behavior;
* the change does not modify runtime behavior;
* the change does not modify public APIs;
* the change does not modify database schema;
* the change does not modify authentication or authorization behavior;
* the change does not modify production deployment behavior;
* the change is limited to repository maintenance, tooling, documentation or development environment.

Examples that MAY be committed directly to `main`:

* README updates;
* CLAUDE.md updates;
* documentation improvements;
* ADR formatting;
* comments;
* Biome formatting;
* repository metadata;
* package metadata;
* GitHub templates;
* GitHub labels;
* Issue templates;
* Pull Request templates;
* package manager housekeeping;
* Corepack housekeeping;
* pnpm housekeeping;
* Dev Container maintenance;
* devcontainer-lock.json updates;
* VS Code extension list updates;
* editor configuration;
* CI syntax fixes that do not alter production behavior.

Examples that MUST use the standard workflow:

* product features;
* bug fixes affecting runtime behavior;
* API behavior changes;
* authentication changes;
* authorization changes;
* deployment changes;
* infrastructure changes;
* monorepo restructuring;
* package restructuring;
* architectural changes;
* dependency upgrades with runtime impact;
* database schema changes;
* destructive refactors.

When uncertain, assume the change is **not** low-risk.

Follow:

```
feature-* → staging → main
```

Before every direct commit to `main`, Claude must explain:

* why the change qualifies;
* why no runtime behavior is affected;
* which files were modified;
* which checks were executed.

---

# Coding Standards

Prioritize:

* readability;
* maintainability;
* explicitness;
* simplicity.

Avoid:

* unnecessary abstractions;
* premature optimization;
* duplicated code.

Follow existing conventions.

---

# Architecture Rules

Inspect before modifying.

Preserve useful Kombai-generated UI whenever practical.

Never introduce a technology without documenting the rationale.

Whenever multiple viable solutions exist:

* explain alternatives;
* explain trade-offs;
* justify the chosen solution;
* document the decision.

---

# Code Sharing

Prefer shared code whenever it improves maintainability.

Use:

`packages/shared`

for:

* shared types;
* enums;
* constants;
* Zod schemas;
* business rules;
* utilities.

Use:

`packages/api-client`

for:

* HTTP client;
* Socket.IO client;
* DTOs;
* API abstractions.

Evaluate shared UI carefully.

Do not force sharing where it reduces clarity.

---

# Documentation Rules

Whenever architecture changes:

* update ADRs;
* update architecture documentation;
* keep implementation and documentation synchronized.

Documentation is part of the implementation.

---

# Claude Working Process

Before modifying code:

* inspect;
* understand;
* explain;
* justify;
* implement.

Keep changes focused.

Avoid unrelated refactors.

Explain important architectural decisions.

---

# Definition of Done

A task is complete only when:

* implementation is finished;
* Biome passes;
* type checking passes;
* build succeeds;
* documentation is updated;
* ADRs are updated when required;
* no unrelated refactors were introduced.
