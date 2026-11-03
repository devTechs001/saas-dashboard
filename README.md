# Enterprise SaaS Platform — Analytics & CRM

A multi-tenant, enterprise-grade SaaS platform: an analytics & CRM dashboard at its core, delivered as a **full polyglot system** — a MERN foundation (React + Node/Express + MongoDB) with a **Rust** edge gateway, a **Java** billing service, and a **Python** analytics/ML service, connected by a Redis Streams event bus.

> 📚 **Start here: [docs/README.md](docs/README.md)** — architecture, API contracts, ADRs, guides, and roadmap.

## Status

| Component | Tech | Status |
|-----------|------|--------|
| `client/` — Web SPA | React 18, Vite, Redux Toolkit, MUI + Tailwind, Recharts | ✅ |
| `server/` — core-api | Node.js, Express, Mongoose, Socket.io, Redis | ✅ |
| `services/gateway/` — edge gateway | Rust, Axum | 🚧 Phase 2 |
| `services/billing-service/` — billing & subscriptions | Java 21, Spring Boot, PostgreSQL, Stripe | 🚧 Phase 3 |
| `services/analytics-service/` — analytics & ML | Python 3.12, FastAPI, pandas, scikit-learn | 🚧 Phase 5 |
| Event bus, deploy tooling | Redis Streams, Docker, Kubernetes | 🚧 Phases 1–6 |

Delivery is phased — see the [roadmap](docs/roadmap.md). Documentation describes the target system and marks each component's status.

## Features

- 📊 Real-time analytics dashboard (KPIs, time-series, device & traffic breakdowns)
- 👥 CRM — customers, segmentation, search & filtering
- 🔐 Multi-tenant auth with JWT + RBAC (`admin` / `manager` / `viewer`)
- 💳 Billing & subscriptions with an auditable double-entry ledger *(Phase 3)*
- 🤖 ML anomaly detection & revenue forecasting *(Phase 5)*
- 📈 Scheduled & on-demand report generation (CSV/XLSX/PDF) *(Phase 5)*
- 🔔 Real-time notifications (Socket.io)
- 🎨 Theming, onboarding, landing pages, responsive design
- 🚪 Rust edge gateway: JWT verification, tiered rate limiting, WebSocket fan-out *(Phase 2)*

## Architecture (short version)

```
Browser ──▶ gateway (Rust) ──▶ core-api (Node/Express) ──▶ MongoDB
                 │           ──▶ billing-service (Java)  ──▶ PostgreSQL
                 │           ──▶ analytics-service (Python) ─▶ object storage
                 └── WebSocket fan-out
        Cross-service side effects flow through a Redis Streams event bus
```

Full detail: [architecture overview](docs/architecture/overview.md) · [service catalog](docs/architecture/services.md) · [data architecture](docs/architecture/data-architecture.md) · [security](docs/architecture/security.md)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, Vite, Redux Toolkit, TanStack Query, React Router v6, MUI + TailwindCSS, Recharts/Chart.js, Socket.io-client |
| Core backend (MERN) | Node.js, Express, MongoDB/Mongoose, JWT, Socket.io, Redis, Winston, Helmet |
| Edge gateway | Rust, Axum, tokio, redis-rs |
| Billing | Java 21, Spring Boot 3, JPA/Flyway, PostgreSQL, Stripe, Resilience4j |
| Analytics & ML | Python 3.12, FastAPI, Pydantic, pandas, scikit-learn, Celery/Arq |
| Data & infra | MongoDB, PostgreSQL, Redis (cache/sessions/rate limits/Streams), S3-compatible storage, Docker, Kubernetes |

## Getting Started

### Prerequisites

Node.js 18+, MongoDB 6+, Redis (optional today). Later phases additionally need Docker, JDK 21, Python 3.12, Rust — see the [development guide](docs/guides/development.md).

### Run the MERN core (works today)

```bash
# Backend
cd server
cp .env.example .env          # set MONGODB_URI, REDIS_URL, JWT_SECRET
npm install
npm run seed                  # demo data
npm run dev                   # http://localhost:5000/api

# Frontend (new terminal)
cd ../client
cp .env.example .env          # VITE_API_URL / VITE_SOCKET_URL → :5000
npm install
npm run dev                   # http://localhost:5173
```

### Full stack (Docker Compose)

```bash
docker compose -f deploy/docker-compose.yml up --build   # Phase 1 onward
```

## API

- Conventions (envelope, pagination, errors, rate limits): [docs/api/README.md](docs/api/README.md)
- OpenAPI 3.1 contract: [docs/api/openapi.yaml](docs/api/openapi.yaml)
- Async event catalog: [docs/api/events.md](docs/api/events.md)

Responses follow the platform envelope: `{ "statusCode": 200, "message": "Success", "data": {…}, "success": true }`.

## Repository Layout

```
saas-dashboard/
├── client/                    ✅ React SPA
├── server/                    ✅ core-api (Express)
├── services/
│   ├── gateway/               🚧 Rust edge gateway
│   ├── billing-service/       🚧 Java billing & subscriptions
│   └── analytics-service/     🚧 Python analytics & ML
├── deploy/                    🚧 Docker Compose, Kubernetes, CI pipelines
├── docs/                      ✅ Documentation (start here)
│   ├── architecture/          overview · services · data · security
│   ├── api/                   conventions · openapi.yaml · events
│   ├── adr/                   architecture decision records
│   ├── guides/                development · deployment
│   └── roadmap.md             phased delivery plan
└── README.md
```

## Documentation Map

| I want to… | Read |
|------------|------|
| Understand the system | [docs/architecture/overview.md](docs/architecture/overview.md) |
| Know what each service does | [docs/architecture/services.md](docs/architecture/services.md) |
| Integrate with the API | [docs/api/README.md](docs/api/README.md) + [openapi.yaml](docs/api/openapi.yaml) |
| Set up my dev environment | [docs/guides/development.md](docs/guides/development.md) |
| Deploy & operate | [docs/guides/deployment.md](docs/guides/deployment.md) |
| Know why the architecture is this way | [docs/adr/](docs/adr/README.md) |
| See what's next | [docs/roadmap.md](docs/roadmap.md) |

## License

MIT
