# ADR-001 — Monorepo Structure, Build System, and Development Workflow

**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** Engineering team

---

## Context

Kyvio ships three interdependent surfaces: a Next.js web app, a React Native mobile app, and a NestJS backend API. These surfaces share domain types, an HTTP/WebSocket client library, and tooling configuration.

We needed to decide:

1. How to organize the code (monorepo vs. polyrepo)?
2. Which package manager and build orchestrator to use?
3. What Git and GitHub workflow to adopt?
4. What code quality toolchain to use?

---

## Decision 1 — Monorepo with pnpm Workspaces

### Chosen: pnpm Workspaces

We use a single repository with **pnpm workspaces** to manage all apps and packages.

**Why monorepo:**

- Domain types defined in `@kyvio/shared` are immediately available to all surfaces without publishing or versioning overhead.
- Refactoring across surfaces (e.g., renaming a DTO field) is atomic — one commit, one PR, one CI run.
- A single CI pipeline validates the entire system.
- Developers work in one checkout and one IDE window.

**Why pnpm over npm/Yarn:**

- Content-addressable store eliminates duplicate packages across workspaces.
- Strict by default — packages can only import what they explicitly declare.
- Native workspace protocol (`workspace:*`) for internal dependencies.
- Faster than npm, simpler than Yarn 2/3 (no PnP).

**Workspace manifest (`pnpm-workspace.yaml`):**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Alternatives Considered

- **Separate repositories (polyrepo):** Eliminates shared-package benefits. Type changes require coordinated version bumps across repos. Rejected.
- **Yarn workspaces:** No material advantage over pnpm. pnpm has better disk efficiency and stricter isolation. Rejected.
- **Nx:** More capable for large teams (affected detection, generators, distributed caching). Higher setup and learning cost than justified at this stage. Revisit if the team grows significantly. Rejected for now.

---

## Decision 2 — Turborepo for Task Orchestration

### Chosen: Turborepo 2

We use **Turborepo** as the task runner across the workspace.

**Why Turborepo:**

- Pipeline definition in `turbo.json` expresses task dependencies (`build` depends on `^build` = all package dependencies must build first).
- Local and remote caching: unchanged packages skip re-execution.
- Concurrent execution of independent tasks.
- Lightweight — no generators, no migration scripts, just task caching.

**Tasks defined:**

| Task | Cache | Depends on |
| --- | --- | --- |
| `build` | Yes | `^build` |
| `dev` | No (persistent) | — |
| `lint` | Yes | `^lint` |
| `check` | Yes | `^check` |
| `typecheck` | Yes | `^typecheck` |
| `test` | Yes | `^build` |
| `format` | No | — |

**Important distinction:** Turborepo orchestrates tasks. It does not bundle code. Bundling is handled per-app (`next build` for web, `nest build` for api, `expo export` for mobile).

---

## Decision 3 — Turbopack for `apps/web` Development Bundler

### Chosen: Turbopack (via Next.js 16 defaults)

**Turbopack** is the Rust-based development bundler embedded in Next.js. It is enabled by default for `next dev` in Next.js 16 — no configuration is required.

**We do not add custom Turbopack configuration.** If a concrete limitation is encountered (e.g., an unsupported loader), it will be addressed at that point.

**Turbopack ≠ Turborepo.** They share the Turbo brand but are entirely separate tools.

---

## Decision 4 — Biome for Code Quality

### Chosen: Biome 2

We use **Biome** as the single tool for formatting and linting, replacing the ESLint + Prettier pair from the initial scaffold.

### What was removed

- `eslint`, `eslint-config-next` from `apps/web`
- `prettier`, `prettier-plugin-tailwindcss` from `apps/web`
- `prettier` from root `devDependencies`
- `apps/web/eslint.config.mjs`, `apps/web/.prettierrc`, `apps/web/.prettierignore`
- `packages/config/eslint/base.mjs`
- `packages/config/prettier/index.json`

### Why Biome over ESLint + Prettier

| Criterion | ESLint + Prettier | Biome |
| --- | --- | --- |
| Number of tools | 2 + plugins | 1 |
| Config files | `eslint.config.mjs` + `.prettierrc` + plugin configs | `biome.json` |
| Runtime | JavaScript | Rust — 10–100× faster |
| Monorepo | Per-package configs or shared package | Single root config, auto-discovered |
| VS Code extension | 2 extensions | 1 extension |
| Import organizer | `eslint-plugin-import` | Built-in |
| CI command | Two commands | `biome ci .` |

### Known Gap: Tailwind Class Sorting

`prettier-plugin-tailwindcss` automatically sorts Tailwind CSS utility classes. Biome has no equivalent.

**Decision:** Accept this gap. The project is at Phase 0 with no product screens. Class ordering is a maintainability concern for large component libraries, not for a nascent codebase. Re-evaluate post-Phase 6 if it becomes a real issue.

### Biome configuration

Root `biome.json` covers all workspaces via VCS-aware file discovery. Key settings preserve the original Prettier formatting contract:

- `semi: false`, `quoteStyle: "double"`, `trailingCommas: "es5"`, `lineWidth: 80`, `indentStyle: "space"`, `indentWidth: 2`
- Linter: Biome recommended + `noUnusedImports`, `noUnusedVariables`, `noExplicitAny` as warnings

---

## Decision 5 — Git Workflow

### Chosen: Trunk-based with staging gate

```text
main       ← production, protected
staging    ← integration / preview
feature-*  ← individual work, branched from staging
```

**Flow:** `feature-*` → PR → `staging` → PR → `main`

All merges require a passing CI run. Direct pushes to `main` and `staging` are blocked by branch protection.

**Why not GitFlow:** GitFlow adds `develop`, `release`, and `hotfix` branches. This overhead is not justified for a team at this stage. The staging gate provides the same integration safety with less ceremony.

---

## Decision 6 — GitHub Projects (Kanban)

### Chosen: GitHub Projects with 5-column Kanban

| Column | Meaning |
| --- | --- |
| Backlog | Accepted, not yet ready |
| Ready | Specified, unblocked, ready to start |
| In Progress | Actively worked on |
| In Review | PR open |
| Done | Merged |

GitHub Projects is chosen over Linear, Jira, or Notion because:

- It integrates natively with GitHub Issues and PRs.
- The `gh` CLI can automate issue creation, branch creation, and status transitions.
- No additional account or subscription required.

### GitHub CLI Automation Target

The repository structure enables Claude Code to automate this workflow:

```bash
gh issue create --title "feat: <description>" --label "feature"
gh issue develop <number> --base staging --checkout
# ... work ...
gh pr create --base staging --fill
```

---

## Consequences

- **`pnpm install` at the repo root** installs all workspace dependencies.
- **`turbo dev`** starts all apps concurrently.
- **Biome** replaces ESLint and Prettier in all editors and CI.
- All new packages must declare `lint`, `check`, `typecheck`, and `build` scripts.
- The `packages/config/biome/base.json` file is available for per-package Biome overrides if needed (extends root `biome.json`).
- Kombai-generated UI in `apps/web/components` is preserved as-is.
