# Roadmap

**Status legend:** ✅ done · 🚧 planned / in progress

This roadmap takes the platform from today's working MERN application to the full polyglot SaaS system described in the [architecture overview](architecture/overview.md). Each phase is shippable on its own and leaves the system in a working state.

## Phase 0 — Documentation & Contracts ✅ (this phase)

*Goal: shared source of truth before writing service code.*

| Deliverable | Status |
|-------------|--------|
| [Architecture docs](architecture/overview.md) (context, containers, flows) | ✅ |
| [Service catalog](architecture/services.md) with SLOs | ✅ |
| [Data architecture](architecture/data-architecture.md) + tenancy model | ✅ |
| [Security architecture](architecture/security.md) | ✅ |
| [API conventions](api/README.md) + [OpenAPI contract](api/openapi.yaml) | ✅ |
| [Event catalog](api/events.md) | ✅ |
| [ADRs 0001–0005](adr/README.md) | ✅ |
| [Development](guides/development.md) & [deployment](guides/deployment.md) guides | ✅ |

**Exit criteria:** team reviews contracts (OpenAPI + events) and signs off ADRs.

## Phase 1 — Platform Skeleton 🚧

*Goal: run the full topology locally with stubs; contracts enforced in CI.*

- `deploy/docker-compose.yml` with MongoDB, PostgreSQL, Redis, MinIO + all four services.
- Service scaffolds: Rust gateway (health + proxy passthrough), Java billing-service (health + Flyway baseline), Python analytics-service (health + OpenAPI generation).
- Shared CI templates per language (lint, test, image build); spectral lint of `docs/api/openapi.yaml` in CI.
- `GET /health` + `GET /ready` on every service; request ID propagation end to end.

**Exit criteria:** `docker compose up` yields a green smoke test hitting every service through the gateway.

## Phase 2 — Rust Edge Gateway 🚧

*Goal: single public entry point with auth and rate limiting.*

- Route table per [service catalog](architecture/services.md); JWT verification (reject at edge).
- Redis sliding-window rate limiting (tiered per [API conventions](api/README.md#rate-limiting)).
- Header hygiene + `X-Tenant-Id` injection (anti-spoofing per [security](architecture/security.md#multi-tenancy-isolation)).
- WebSocket termination + fan-out from core-api Socket.io events.
- Latency benchmarks: p99 added latency < 2 ms.

**Exit criteria:** all traffic moves through the gateway; direct service access blocked outside the cluster.

## Phase 3 — Java Billing Service 🚧

*Goal: real money, done right.*

- Flyway schema: plans, subscriptions, invoices, payments, double-entry ledger.
- Stripe integration: payment intents, verified webhooks, idempotency keys, dunning basics.
- Subscription lifecycle + entitlements published via `billing.*` events ([event catalog](api/events.md)).
- core-api consumes entitlements; UI: plan & invoices pages 🚧.
- Testcontainers integration tests + ledger balance invariant tests (zero imbalance allowed).

**Exit criteria:** a tenant can subscribe, pay, get invoiced, and lose/gain entitlements correctly — with an auditable ledger.

## Phase 4 — Event Bus & Async Workflows 🚧

*Goal: reliable cross-service choreography.*

- Redis Streams transport + producer outbox + DLQ ([ADR-0003](adr/0003-event-bus-redis-streams.md)).
- Consumer SDKs per language with idempotent handlers (dedupe by event `id`).
- Move notification/report workflows onto events (e.g. `report.generated` → Socket.io push).
- Failure-injection tests (kill consumers mid-stream; verify no loss, no duplicates).

**Exit criteria:** every cross-service side effect flows through the bus; DLQ alerting live.

## Phase 5 — Python Analytics & ML Service 🚧

*Goal: differentiated analytics product.*

- Heavy aggregation endpoints + rollup caches ([data architecture](architecture/data-architecture.md#analytics-service--reads--alifacts)).
- Report generation (CSV/XLSX/PDF → object storage, signed URLs) wired to `report.*` events.
- Anomaly detection + revenue forecasting (scikit-learn), `analytics.anomaly.detected` alerts in the UI.
- Read-only replica access + data-quality checks.

**Exit criteria:** dashboards served from analytics-service; scheduled reports deliver without blocking core-api.

## Phase 6 — Hardening & Production Readiness 🚧

*Goal: multi-tenant production confidence.*

- Kubernetes manifests + Terraform 🚧; canary deploys with auto-rollback.
- OpenTelemetry traces/metrics/logs correlation; SLO dashboards + alerting ([deployment](guides/deployment.md#observability)).
- Security pass: RS256/JWKS token rotation, mTLS internally, audit log, dependency scanning gates, pen-test fixes.
- Load tests (target: 500 RPS sustained, burst 2k RPS at the gateway); chaos drills; backup restore rehearsal.
- SOC 2 evidence pipeline (access reviews, change management, incident runbooks).

**Exit criteria:** production launch checklist green; SLOs measured live for 2 weeks.

## Later / Parking Lot

- Kafka migration if event volume or replay needs outgrow Redis Streams ([ADR-0003](adr/0003-event-bus-redis-streams.md) decision trigger).
- gRPC internal RPC if profiling justifies it ([ADR-0005](adr/0005-communication-patterns.md)).
- Mobile client; public developer API with API keys + self-serve portal.
- Data warehouse (ClickHouse) for cross-tenant product analytics (internal-only).

## Risks & Watchlist

| Risk | Impact | Mitigation |
|------|--------|------------|
| Contract drift between languages | Integration breakage | Contract-first OpenAPI/events + CI contract checks (Phase 1) |
| Eventual consistency surprises (entitlements) | Support load | Documented windows; synchronous fallback reads (ADR-0005) |
| Four toolchains slow CI | Dev velocity | Parallel matrix jobs, cached toolchains, per-language templates |
| Scope creep in gateway | Latency, complexity | Explicit non-responsibilities in the [catalog](architecture/services.md) |
