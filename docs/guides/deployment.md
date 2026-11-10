# Deployment & Operations Guide

**Status legend:** ✅ exists today · 🚧 planned ([roadmap](../roadmap.md))

## Environments

| Env | Purpose | Data | Rollout |
|-----|---------|------|---------|
| `local` | developer machines | seeded demo data | docker-compose 🚧 / manual ✅ |
| `staging` | integration, contract, load tests | anonymized copy of prod subset | auto on `main` merge |
| `production` | customer traffic | real tenant data | manual approval + canary |

Infrastructure as code (Terraform 🚧) provisions per environment; services are identical artifacts across environments — config comes only from env/secrets ([security](../architecture/security.md#secrets-management)).

## Hosted Deployments (Netlify + Render) ✅

The MERN core deploys as two hosted apps — SPA on **Netlify**, API on **Render**. Config lives at the repo root:

### Client → Netlify

1. In Netlify: **Add new site → Import an existing project** → pick this repo.
2. Netlify reads [`netlify.toml`](../../netlify.toml) automatically:
   - Base directory `client/`, build `npm ci && npm run build`, publish `dist` (relative to `base`, i.e. `client/dist` — do **not** write `client/dist`, it resolves to `client/client/dist`)
   - SPA fallback `/* → /index.html 200` (client-side routing for /features, /pricing, /about, /contact…)
   - Security headers (CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) + immutable caching for hashed assets; `index.html` is `must-revalidate` so deploys are picked up immediately
   - Demo mode is dev-only: `npm run build` sets `import.meta.env.DEV=false`, which removes the demo sign-in UI, the fake-session fallback, and the entire sample dataset from the bundle. Production pages call the API and show empty states when it has no data.
   - Provider order note: `QueryClientProvider` wraps the whole app (above the splash screen and `useRealtime()`); React Query hooks outside it throw `No QueryClient set, use QueryClientProvider to set one`
3. Set build env `VITE_API_URL=https://<your-render-service>.onrender.com/api` (and `VITE_SOCKET_URL` to the same origin without `/api`).
4. Every push to `main` redeploys automatically (deploy previews per PR).

### Server → Render

1. In Render: **New → Blueprint** → select this repo (reads [`render.yaml`](../../render.yaml)), or create a **Web Service** with root directory `server/`.
2. Render runs `npm install` + `npm start`, and uses `GET /api/health` as the health check.
3. Set secrets in the dashboard: `MONGODB_URI` (Atlas), `REDIS_URL`, and optionally override `JWT_SECRET` (auto-generated otherwise).
4. Set `CORS_ORIGIN` / `FRONTEND_URL` to your Netlify domain so the API and Socket.io accept the SPA origin.

**Security checklist for go-live:** rotate the generated `JWT_SECRET`; keep `CORS_ORIGIN` pinned to the exact Netlify origin; confirm the security headers with `curl -I`; verify `/api/ready` reports `mongo: up` / `redis: up`; enable Render's free TLS and Netlify's HSTS preload once DNS is stable.

## Container Strategy

One image per service, built multi-stage and distroless/minimal at runtime:

| Service | Base image pattern | Notes |
|---------|-------------------|-------|
| `client` ✅ | nginx (static) or served by core-api | `vite build` → `/dist` |
| `core-api` ✅ | `node:20-alpine` | non-root user; serves SPA in production |
| `gateway` 🚧 | `gcr.io/distroless/cc` (multi-stage `cargo build --release`) | ~15 MB image, no shell |
| `billing-service` 🚧 | `eclipse-temurin:21-jre` | layered jars for cache-friendly builds |
| `analytics-service` 🚧 | `python:3.12-slim` | workers + API in one image, different commands |

Images are tagged `ghcr.io/<org>/<service>:<git-sha>` and promoted between environments (never rebuilt).

## Orchestration & Topology

- **Target:** Kubernetes (one namespace per environment). Deployments: 2+ replicas per service; HPA on CPU + custom metrics (RPS, queue depth). PodDisruptionBudgets on all services.
- **Ingress:** TLS termination → `gateway` (only public service) → internal Services (`core-api`, `billing-service`, `analytics-service`).
- **Stateful:** MongoDB (replica set), PostgreSQL (primary + replica), Redis (sentinel/cluster) — managed services in production preferred; MinIO or S3 for artifacts.
- **Local/staging shortcut:** `deploy/docker-compose.yml` runs the same images single-node 🚧.

## CI/CD

Pipeline per PR → merge → deploy (GitHub Actions 🚧, templates per language):

1. **Validate:** lint + unit tests + (spectral) contract lint + security scans (`npm audit`, `cargo audit`, `pip-audit`, OWASP dependency-check).
2. **Build:** image per changed service, push with git SHA.
3. **Integration:** compose/microk8s environment; run API tests against real MongoDB/Postgres/Redis; event-bus contract tests.
4. **Deploy staging:** automatic; smoke tests (`/health`, `/ready`, critical journeys).
5. **Deploy production:** manual approval; **canary** (10% traffic, 15 min, auto-rollback on SLO burn) then full rollout.

Rollback = redeploy previous SHA (config-driven, < 5 min). Database migrations run as pre-deploy Jobs (Flyway 🚧) with backward-compatible expand/contract pattern.

## Observability

| Signal | Implementation | Status |
|--------|----------------|--------|
| Logs | Structured JSON to stdout → collector (Loki/CloudWatch); `X-Request-Id` correlation | ✅ Winston in core-api, centralization 🚧 |
| Metrics | Prometheus-format `/metrics` per service (Micrometer / prometheus-client / metrics-exporter); RED + USE dashboards in Grafana | 🚧 |
| Traces | OpenTelemetry SDK in all services → OTLP collector → Tempo/Jaeger; gateway starts the trace | 🚧 |
| Alerting | PagerDuty/Slack: error-rate burn (multi-window), p99 latency, queue backlog, ledger invariant failure, cert expiry | 🚧 |

Key SLOs (see [service catalog](../architecture/services.md#cross-cutting-concerns)): 99.9% availability on the external API; p99 < 2 ms gateway overhead; p99 < 500 ms core API reads; zero tolerance for ledger imbalance.

## Scaling & Resilience

- Stateless services scale horizontally; Redis-backed rate limiting means replicas share limits.
- Timeouts, retries, circuit breakers per [ADR-0005](../adr/0005-communication-patterns.md); bulkheads around Stripe and other third parties.
- Event consumers scale by consumer-group concurrency; failed events land in the DLQ with alerts (no silent loss).
- Graceful shutdown: every service drains in-flight work (30 s budget) before exit; readiness gates removed first.

## Backup & Disaster Recovery

Per [data architecture — backup](../architecture/data-architecture.md#backup--recovery). Additional ops rules:

- Restore drills quarterly in staging (RPO/RTO verified, not assumed).
- Region-level DR target: RTO 4 h / RPO 15 min; runbook maintained alongside this guide.
- Secrets and TLS certs are reproducible from the secrets manager + cert-manager 🚧.

## Incident Response

1. **Detect** → alert fires with dashboard link and `X-Request-Id` examples.
2. **Triage** → severity: SEV1 (data loss/security/ledger), SEV2 (major feature down), SEV3 (degraded), SEV4 (cosmetic). SEV1/2 page humans.
3. **Mitigate** → rollback, feature-flag off 🚧, scale, or shed load at the gateway. *Prefer mitigation over debugging in prod.*
4. **Communicate** → status page + tenant comms for SEV1/2 within 30 min.
5. **Postmortem** → blameless, within 5 days, action items tracked; ADRs updated if architecture is implicated.

Security incidents additionally follow [security — audit & monitoring](../architecture/security.md#audit--monitoring): rotate affected secrets, preserve logs, involve compliance for tenant-data exposure.
