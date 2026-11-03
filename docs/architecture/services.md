# Service Catalog

**Status legend:** ✅ exists today · 🚧 planned

Every service in the platform, its technology, responsibilities, contracts, and service-level objectives. Route prefixes are as seen by external clients **through the gateway** (`https://api.<domain>/api/v1/...`).

## Summary

| Service | Tech | Port (internal) | Owns | Status |
|---------|------|-----------------|------|--------|
| `client` | React 18, Vite, Redux Toolkit, MUI/Tailwind | 5173 (dev) | UI state | ✅ |
| `core-api` | Node.js 18+, Express, Mongoose | 5000 | Users, tenants, CRM, notifications, reports | ✅ |
| `gateway` | Rust, Axum | 3000 | Edge routing, JWT verification, rate limiting, WS | 🚧 |
| `billing-service` | Java 21, Spring Boot | 8080 | Plans, subscriptions, invoices, payments, ledger | 🚧 |
| `analytics-service` | Python 3.12, FastAPI | 8000 | Aggregations, ML models, report generation | 🚧 |
| MongoDB | — | 27017 | Core domain data | ✅ |
| PostgreSQL | — | 5432 | Billing ledger | 🚧 |
| Redis | — | 6379 | Cache, sessions, rate limits | ✅ |
| Redis Streams | — | 6379 | Event bus | 🚧 |
| Object storage (S3/MinIO) | — | 9000 | Report artifacts | 🚧 |

---

## client ✅ — Web SPA

- **Path:** `client/`
- **Stack:** React 18 + Vite, Redux Toolkit, TanStack Query, React Router v6, MUI + TailwindCSS, Recharts/Chart.js, Socket.io-client.
- **Responsibilities:** landing pages, onboarding, authentication UI, dashboard, customers (CRM), analytics, reports, settings, profile; theming (light/dark); realtime notifications via WebSocket.
- **Contracts:** consumes `core-api` REST (`VITE_API_URL`) and Socket.io (`VITE_SOCKET_URL`). In production it is served as static files by `core-api`.
- **State:** Redux for auth/UI state; React Query for server state.

## core-api ✅ — MERN Backend (Core Domain API)

- **Path:** `server/`
- **Stack:** Node.js (ESM), Express 4, Mongoose 8, Socket.io, Redis client, Winston, Helmet, express-rate-limit, express-validator.
- **Responsibilities:**
  - Authentication & session lifecycle (JWT access tokens, bcrypt password hashing)
  - Users & RBAC (`admin` / `manager` / `viewer` + fine-grained `permissions[]`)
  - CRM customers (CRUD, search, segmentation)
  - Analytics endpoints (overview stats, time-series, device/top-page breakdowns)
  - Reports (definition, generation requests, downloads)
  - Notifications (in-app feed, read/unread, Socket.io push)
- **API prefix:** `/api` (external: `/api/v1` via gateway) — see [API conventions](../api/README.md).
- **Data:** MongoDB (`users`, `customers`, `analytics`, `reports`, `notifications`), Redis (cache + rate limit counters). See [Data architecture](./data-architecture.md).
- **Realtime:** Socket.io server (rooms per tenant) ✅.

## gateway 🚧 — Rust Edge Gateway

- **Path:** `services/gateway/`
- **Stack:** Rust (stable), Axum, tower middleware, `jsonwebtoken`, `redis-rs`, `tokio-tungstenite`.
- **Responsibilities:**
  - Single public entry point (TLS termination at ingress, then routing)
  - Route table: `/api/v1/auth|users|customers|notifications` → core-api; `/api/v1/billing` → billing-service; `/api/v1/analytics|reports` → analytics-service
  - Stateless JWT verification (HS256 shared secret / RS256 JWKS) — rejects before requests hit services
  - Redis-backed sliding-window rate limiting per API key / user / IP
  - Request ID generation & propagation (`X-Request-Id`), basic header hygiene
  - WebSocket termination and fan-out to `core-api` realtime events
- **Non-responsibilities:** business logic, response shaping, data access. Fail closed on auth errors; fail open on observability export.
- **SLOs:** p99 added latency < 2 ms for proxied requests; 99.95% availability.

## billing-service 🚧 — Java Billing & Subscriptions

- **Path:** `services/billing-service/`
- **Stack:** Java 21 (LTS), Spring Boot 3, Spring Data JPA, PostgreSQL, Flyway migrations, Resilience4j, Micrometer.
- **Responsibilities:**
  - Plans & pricing (per-tenant catalog, trials, coupons)
  - Subscriptions lifecycle (create, upgrade/downgrade, cancel, renew)
  - Invoicing & tax (immutable invoice records, PDF artifacts → object storage)
  - Payments: Stripe payment intents, webhook handling (signature verified), dunning
  - Double-entry ledger (credits/debits, audit trail)
  - Entitlements (feature flags per plan) — consumed by core-api
- **API prefix:** `/api/v1/billing/*`.
- **Data:** PostgreSQL (see [Data architecture](./data-architecture.md#billing-service-postgresql)). Publishes `billing.*` events; consumes `user.*`, `tenant.*`.
- **Why Java:** see [ADR-0002](../adr/0002-service-technology-allocation.md).
- **SLOs:** payment/ledger operations exactly-once effective (idempotent + transactional); p99 < 300 ms excluding Stripe round-trips.

## analytics-service 🚧 — Python Analytics & ML

- **Path:** `services/analytics-service/`
- **Stack:** Python 3.12, FastAPI, Pydantic v2, pandas, scikit-learn, SQLAlchemy (read replicas), Celery/Arq workers, Jinja2 + WeasyPrint for PDF reports.
- **Responsibilities:**
  - Heavy aggregations & funnel/cohort analysis (read-only against MongoDB / replica)
  - Anomaly detection on revenue & traffic time series (scikit-learn), trend forecasting
  - Scheduled & on-demand report generation (CSV/XLSX/PDF) → object storage, signed URLs
  - Data quality checks and metric definitions (single source of truth for computed KPIs)
- **API prefix:** `/api/v1/analytics/*`, `/api/v1/reports/*`.
- **Data:** reads MongoDB (read concern majority, replica preferred), writes artifacts to object storage; caches hot aggregates in Redis. Consumes `billing.*`, `customer.*` events to refresh rollups.
- **SLOs:** p99 < 800 ms for dashboard aggregates (pre-warmed cache); reports generated < 60 s for 90-day ranges.

---

## Cross-Cutting Concerns

| Concern | Implementation |
|---------|----------------|
| Service discovery | Static config / K8s Services (no dynamic registry at this scale) |
| Config | Env vars + `.env` locally; K8s Secrets/ConfigMaps in prod ([Deployment](../guides/deployment.md)) |
| Health | `GET /health` (liveness) and `GET /ready` (readiness: DB/Redis reachable) on every service |
| Logging | Structured JSON logs, `X-Request-Id` correlation across services |
| Tracing | OpenTelemetry SDK in each service → OTLP collector 🚧 |
| Timeouts | Every outbound call has a timeout; default 2 s intra-cluster, 10 s to Stripe |
| Retries | Idempotent GETs only, exponential backoff, jitter; circuit breakers (Resilience4j / custom) |
| Versioning | URL versioning `/api/v1`; events are versioned per payload ([Event catalog](../api/events.md)) |
