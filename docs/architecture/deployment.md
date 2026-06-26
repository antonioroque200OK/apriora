# Deployment Architecture

> **Status:** Placeholder — to be written in Phase 3 (Software Architecture).

This document will describe:

- Vercel deployment for `apps/web` (automatic via GitHub integration)
- Render deployment for `apps/api` (Docker or managed Node.js)
- Neon PostgreSQL (serverless Postgres with branching for preview environments)
- Expo EAS Build for `apps/mobile`
- Environment variable management (`.env.example`, Vercel/Render secrets)
- CI/CD pipeline integration with GitHub Actions
- Preview environment strategy (per-PR deployments)
