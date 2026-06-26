# ADR-002 — Technology Stack and tRPC Evaluation

**Status:** Accepted
**Date:** 2026-06-25
**Deciders:** Engineering team

---

## Context

Apriora requires a full-stack technology selection covering:

- Web frontend framework
- Mobile framework
- Backend framework and HTTP adapter
- Real-time communication
- ORM and database
- Runtime validation
- Authentication
- Infrastructure and deployment

Additionally, this ADR evaluates **tRPC** as a potential API layer, since it is commonly proposed for TypeScript monorepos.

---

## Part 1 — Technology Stack Decisions

### 1.1 Web Frontend: Next.js 16 with App Router

**Chosen:** Next.js 16, App Router, React 19.

**Rationale:**

- App Router enables server components, streaming SSR, and co-located route handlers — all useful for a platform that needs both a marketing site and a real-time teacher dashboard.
- React 19 (stable) is the baseline for `@base-ui/react` and shadcn/ui `base-nova` style already in use.
- Vercel (the deployment target) is the canonical host for Next.js — zero-config deployment.
- Turbopack (default dev bundler in Next.js 16) provides fast iteration in development.

**Alternatives considered:**

- **Remix:** Strong conventions, good DX. Not chosen because the Vercel/Next.js deployment and component ecosystem alignment outweighs Remix's advantages for this project.
- **Vite SPA:** Simpler setup but loses SSR, streaming, and server components. The teacher dashboard benefits from SSR for initial data loading.
- **Astro:** Excellent for content sites, poor fit for highly interactive real-time UIs.

### 1.2 Styling: Tailwind CSS 4 + shadcn/ui (base-nova)

**Chosen:** Tailwind CSS 4, shadcn/ui `base-nova`, `@base-ui/react` primitives.

**Rationale:**

- Tailwind 4 (CSS-first config, OKLCH palette) aligns with modern browser capabilities. The `globals.css` already uses OKLCH color tokens.
- shadcn/ui provides copy-owned components — no library lock-in, full control over source.
- `base-nova` style uses `@base-ui/react` as primitive layer, which is a headless, accessible component library maintained by the MUI team.
- The initial scaffold already uses these — preserving them avoids unnecessary churn.

### 1.3 Mobile: React Native + Expo SDK 53

**Chosen:** React Native 0.79, Expo SDK 53, Expo Router 5.

**Rationale:**

- React Native shares the React programming model with the web app, reducing context-switching.
- Expo Managed Workflow handles native build complexity (iOS/Android) without requiring native SDKs locally.
- Expo Router (file-based navigation) aligns with the App Router mental model used on web.
- Expo EAS Build handles CI/CD for mobile.

**Alternatives considered:**

- **Flutter:** Excellent performance and cross-platform consistency. Requires Dart — adds a second language to the stack and breaks code sharing with the web TypeScript codebase. Rejected.
- **Ionic / Capacitor:** Web-view-based. Acceptable DX but inferior performance and native feel for a real-time interactive application. Rejected.

### 1.4 Backend: NestJS 11 + Fastify Adapter

**Chosen:** NestJS 11, Fastify adapter.

**Rationale:**

- NestJS provides a structured, opinionated framework (DI, modules, guards, interceptors, pipes) that scales well with team growth and codebase complexity.
- The Fastify adapter replaces the default Express adapter and provides measurably higher throughput with lower latency — relevant for high-concurrency live sessions.
- NestJS's decorator-driven architecture integrates naturally with TypeScript.
- WebSocket (Socket.IO) gateways are a first-class NestJS concept.

**Alternatives considered:**

- **Hono:** Minimal, fast, excellent TypeScript support. Lacks NestJS's structured module system and built-in DI — would require building those patterns manually as the codebase grows. Appropriate for microservices; less appropriate for a monolithic backend at this scale. Revisit if microservices split occurs.
- **Fastify (standalone):** Same performance benefit without NestJS structure. Rejected for the same reason as Hono.
- **Express:** Default for NestJS but slower than Fastify and less type-safe. Not chosen as the HTTP adapter.

### 1.5 Real-time: Socket.IO

**Chosen:** Socket.IO 4 (NestJS gateway on server, Socket.IO client on web and mobile).

**Rationale:**

- Live quiz sessions require bidirectional communication: server pushes question reveals, countdowns, scores; clients push answers.
- Socket.IO provides rooms (session isolation), fallback transports (WebSocket → polling), and automatic reconnection.
- NestJS has a first-class `@WebSocketGateway` decorator for Socket.IO.
- `socket.io-client` is available for both React (web) and React Native (mobile) via `@apriora/api-client`.

**Alternatives considered:**

- **Server-Sent Events (SSE):** Unidirectional (server → client only). Cannot receive answers from students without a separate HTTP endpoint. Rejected.
- **Native WebSocket:** More control, less infrastructure. Socket.IO's room management and reconnection handling would need to be reimplemented. Rejected.
- **Ably / Pusher:** Managed real-time infrastructure. Reduces ops burden but introduces a third-party dependency for the core product feature. Reject at this stage; revisit if Socket.IO operational complexity becomes a problem.

### 1.6 ORM: Prisma 6

**Chosen:** Prisma 6 with PostgreSQL.

**Rationale:**

- Prisma Schema Language (PSL) is the clearest way to define and migrate a relational schema in a TypeScript project.
- Generated TypeScript client is fully typed and integrates naturally with NestJS.
- `prisma migrate` provides version-controlled, reproducible migrations.
- Prisma Studio provides a built-in data browser for development.

**Alternatives considered:**

- **Drizzle ORM:** SQL-first, extremely lightweight, excellent TypeScript inference. Smaller ecosystem and fewer NestJS integration examples. Strong candidate for future consideration if Prisma's abstraction overhead becomes a problem.
- **TypeORM:** More established in NestJS ecosystem historically but decorator-based, which creates complexity. Prisma's explicit schema approach is cleaner.
- **Raw SQL (pg/postgres.js):** Maximum control. Requires manual migration management and type generation. Not justified for this stage.

### 1.7 Validation: Zod

**Chosen:** Zod 3.

**Rationale:**

- Zod schemas compile to TypeScript types — define the shape once, validate at runtime and use as static type simultaneously.
- Works in both NestJS (via `ZodPipe`) and the shared package (schema definitions in `@apriora/shared`).
- Widely adopted, excellent developer experience.

**Note:** NestJS's native `class-validator` + `class-transformer` uses decorators and reflection metadata. Zod is preferred because it avoids the `reflect-metadata` requirement for validation and integrates better with the monorepo's type-sharing strategy.

### 1.8 Authentication: JWT + Passport

**Chosen:** `@nestjs/jwt` + `@nestjs/passport`.

**Rationale:**

- JWT is stateless and appropriate for a multi-surface application (web + mobile share the same token format).
- `@nestjs/passport` is the standard NestJS authentication integration.
- Access token + refresh token strategy will be implemented in Phase 6.

### 1.9 Database: PostgreSQL on Neon

**Chosen:** Neon (serverless PostgreSQL).

**Rationale:**

- Neon provides database branching — each preview environment (per-PR) gets its own database branch with the production schema, at no extra cost.
- Serverless scaling fits the project's early stage (no need to manage server size).
- Compatible with Prisma out of the box.
- Pairs well with Render (API) and Vercel (web) deployment targets.

### 1.10 Deployment

| Surface | Platform | Rationale |
| --- | --- | --- |
| `apps/web` | Vercel | Zero-config Next.js deployment, preview URLs per PR |
| `apps/api` | Render | Managed Node.js, easy Docker support, WebSocket-compatible |
| Database | Neon | Serverless Postgres with branching |
| Mobile | Expo EAS | Managed iOS/Android builds and OTA updates |

---

## Part 2 — tRPC Architecture Decision Proposal

> **Conclusion first:** tRPC is **not recommended** for this project. The rationale follows.

### What is tRPC?

tRPC is a TypeScript RPC framework that creates end-to-end type-safe APIs without code generation. The server defines procedures (queries and mutations); the client calls them as typed functions. Types flow from server to client automatically through the TypeScript compiler.

### Advantages

- **End-to-end type safety without code generation.** Changes to a server procedure are immediately reflected as TypeScript errors on the client.
- **Zero serialization boilerplate.** No DTO classes, no OpenAPI schemas, no JSON schema definitions. Just TypeScript types.
- **Excellent DX in monorepos.** When the server and client live in the same repository, tRPC's proposition is strongest.
- **React Query integration.** tRPC's React adapter wraps React Query, providing caching, loading states, and invalidation.

### Disadvantages

- **TypeScript-only clients.** The API is not consumable by non-TypeScript clients (Python scripts, third-party integrations, mobile apps without the tRPC client, browser fetch). If Apriora ever needs to expose a REST API for LMS integrations, Webhooks, or partner access, tRPC provides no path forward without wrapping or duplicating the API.
- **Tight coupling.** The server and client are coupled at the type level. This is a feature in pure internal systems but becomes a constraint when the API needs to serve external consumers.
- **NestJS incompatibility.** This is the critical blocker. tRPC is designed for Express/Next.js-style server handlers (a function that takes a request and returns a response). NestJS has its own DI container, module system, guard/interceptor pipeline, and lifecycle. Integrating tRPC with NestJS requires:
  - Abandoning NestJS's native request pipeline (guards, interceptors, pipes) in favour of tRPC middleware.
  - Using the unofficial `nestjs-trpc` package, which has inconsistent maintenance and is not officially supported.
  - Or running tRPC outside NestJS in a separate process, which negates the DI and module benefits.
- **Real-time limitations.** tRPC has WebSocket subscription support, but it is designed for subscriptions, not bidirectional event-driven communication. Live quiz sessions require server-initiated events (question reveal, countdown, score reveal) and client-initiated events (answer submission) with room-based targeting. Socket.IO's gateway model in NestJS is a far better fit.
- **External integration capability.** Apriora may need to integrate with Brazilian LMS platforms (Google Classroom, Moodle), external identity providers, or reporting webhooks. REST/HTTP endpoints are the universal integration interface. tRPC does not naturally expose these.

### Compatibility Summary

| Requirement | tRPC Fit |
| --- | --- |
| Next.js (App Router) | Good — official adapter exists |
| React Native | Viable — tRPC client works in RN |
| NestJS | Poor — unofficial adapter, bypasses NestJS pipeline |
| Real-time (Socket.IO) | Not applicable — tRPC subscriptions are different |
| External REST consumers | Poor — no native REST exposure |

### Alternative: Typed REST with `@apriora/shared`

The monorepo already solves the primary problem tRPC addresses — type sharing between server and client.

**Approach:**

1. NestJS controllers define HTTP endpoints in the conventional REST style.
2. Response types are defined in `@apriora/shared` (Zod schemas + TypeScript types).
3. `@apriora/api-client` wraps `fetch` with the correct types, imported from `@apriora/shared`.
4. Both `apps/web` and `apps/mobile` use `@apriora/api-client` — the types flow through the monorepo without RPC coupling.

This approach preserves:
- NestJS's full capability (guards, interceptors, pipes, WebSocket gateways).
- External REST compatibility.
- Type safety across all consumers.

And it eliminates:
- tRPC's NestJS integration complexity.
- The need for a third-party adapter.
- The TypeScript-client constraint.

### Conclusion

**tRPC should not be adopted** for Apriora in its current architecture because NestJS incompatibility is a hard constraint, real-time requirements are better served by Socket.IO, and external integration requirements demand a standard HTTP/REST interface.

The type-sharing problem that tRPC solves is already addressed by the `@apriora/shared` + `@apriora/api-client` packages.

**Revisit only if:**
- NestJS is replaced by a framework more compatible with tRPC (e.g., Hono, Express).
- The API becomes entirely internal (no external consumers, no LMS integrations).
- The team finds the typed-fetch approach insufficiently ergonomic after Phase 6.

---

## Consequences

- The technology stack documented here is the authoritative reference for Phase 6 implementation.
- Any deviation from this stack during implementation requires a new ADR or an amendment to this one.
- `apps/api` will be implemented with NestJS + Fastify when Phase 6 begins.
- tRPC is explicitly ruled out. Engineers proposing it should reference this ADR.
