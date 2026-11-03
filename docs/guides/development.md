# Development Guide

**Status legend:** ✅ works today · 🚧 applies when the corresponding service lands ([roadmap](../roadmap.md))

## Repository Layout

```
saas-dashboard/
├── client/                     ✅ React SPA (Vite)
├── server/                     ✅ core-api (Express)
├── services/
│   ├── gateway/                🚧 Rust (Axum)
│   ├── billing-service/        🚧 Java (Spring Boot)
│   └── analytics-service/      🚧 Python (FastAPI)
├── deploy/                     🚧 docker-compose.yml, k8s/, ci/
├── docs/                       ✅ this documentation
├── package.json                ✅ workspace root scripts
└── structure.txt               scratch notes from scaffolding
```

## Prerequisites

| Tool | Version | Needed for |
|------|---------|------------|
| Node.js | ≥ 18 (20 LTS recommended) | client ✅, core-api ✅ |
| npm | ≥ 9 | JS workspaces |
| Docker + Compose | latest | MongoDB/Redis locally 🚧, all services 🚧 |
| JDK | 21 | billing-service 🚧 |
| Python | 3.12 + `uv` (or `pip`) | analytics-service 🚧 |
| Rust | stable (1.75+) + `cargo` | gateway 🚧 |

## First-Time Setup (MERN core ✅)

```bash
git clone <this repo> && cd saas-dashboard

# 1. Infrastructure (MongoDB + Redis)
#    Either local installs or: docker compose -f deploy/docker-compose.infra.yml up -d  (planned)

# 2. Backend
cd server
cp .env.example .env       # adjust MONGODB_URI / REDIS_URL / JWT_SECRET
npm install
npm run seed               # demo users + sample data
npm run dev                # http://localhost:5000/api

# 3. Frontend
cd ../client
cp .env.example .env       # VITE_API_URL / VITE_SOCKET_URL point at :5000
npm install
npm run dev                # http://localhost:5173
```

Demo credentials are printed by `npm run seed`. The API envelope and routes are described in [API conventions](../api/README.md).

## Running the Full Stack 🚧

```bash
# Everything (infra + 4 services) via Docker Compose
docker compose -f deploy/docker-compose.yml up --build

# Or per-service, natively:
cd services/gateway        && cargo run                 # :3000
cd services/billing-service && ./mvnw spring-boot:run   # :8080
cd services/analytics-service && uvicorn app.main:app --reload --port 8000
```

Ports: gateway `3000` (public entry), core-api `5000`, billing `8080`, analytics `8000`, MongoDB `27017`, PostgreSQL `5432`, Redis `6379`, MinIO `9000`.

## Environment Variables

Copy `.env.example` → `.env` in each service. Never commit `.env`. Full secrets inventory: [security — secrets](../architecture/security.md#secrets-management). Key variables:

| Variable | Service | Notes |
|----------|---------|-------|
| `MONGODB_URI` | core-api, analytics | `mongodb://localhost:27017/enterprise-saas-dashboard` |
| `REDIS_URL` | all | `redis://localhost:6379` |
| `JWT_SECRET` | core-api, gateway, all | shared HS256 secret (dev only; RS256 planned) |
| `POSTGRES_DSN` | billing | `postgres://saas:saas@localhost:5432/billing` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | billing | test-mode keys |
| `S3_ENDPOINT` / `S3_BUCKET` / `S3_*_KEY` | analytics | MinIO locally |

## Testing & Quality Gates

| Layer | Command (core-api ✅ / planned 🚧) |
|-------|-----------------------------------|
| JS unit/integration | `npm test` (Jest + Supertest) in `server/`; `npm run test` (Vitest) in `client/` |
| JS lint | `npm run lint` (ESLint) |
| Rust 🚧 | `cargo test`, `cargo clippy -- -D warnings`, `cargo fmt --check` |
| Java 🚧 | `./mvnw verify` (JUnit 5, Testcontainers, JaCoCo ≥ 80%) |
| Python 🚧 | `pytest --cov`, `ruff check`, `mypy --strict` |
| Contract checks 🚧 | spectral lint on `docs/api/openapi.yaml`; event schema validation |

CI runs all of the above per PR ([deployment guide](./deployment.md#cicd)). **Definition of done:** tests + lint green, docs updated in the same PR, ADR added/updated if a contract or trust boundary changed.

## Local Workflows & Tips

- **Seeding:** `npm run seed` (core-api) creates demo tenants/users/customers; billing/analytics seeders land with those services 🚧.
- **Events locally 🚧:** run `docker compose up redis` and use `redis-cli XREAD COUNT 5 STREAMS stream:events 0` to inspect the bus.
- **Debugging across services:** every log line includes `X-Request-Id`; `grep` it across service logs to follow one request end to end.
- **DB GUIs:** MongoDB Compass for `enterprise-saas-dashboard`, pgAdmin/psql for `billing`.
- **Socket.io:** connect with the JWT from login (`auth.token` handshake) to see live notifications.

## Code Standards (summary)

- **JS/TS:** ESM, named exports, async/await, `ApiResponse`/`ApiError` helpers for all endpoints; camelCase JSON.
- **Java:** constructor injection, records for DTOs, `@Transactional` boundaries at the service layer, never leak JPA entities outside the service package.
- **Python:** type-hint everything, Pydantic models at boundaries, no I/O in model code, workers for anything > 1 s.
- **Rust:** `anyhow` at the binary edge, `thiserror` in libraries, no `unwrap()` in request paths.
- **All:** follow [API conventions](../api/README.md) and [event catalog](../api/events.md) exactly; contract first.

## Git Workflow

1. Branch from `main`: `feat/<scope>-<short-description>`.
2. PR required; squash-merge into `main`.
3. Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`) — the changelog is generated from these.
4. Docs live with code: update `docs/` in the same PR.
