# Enterprise SaaS Platform — Documentation

Welcome to the documentation for the **Enterprise SaaS Platform** — a full-system SaaS product built around a MERN core and a polyglot set of microservices (Java, Python, Rust).

This is the single entry point for all project documentation. Read the docs in the order below if you are new to the system.

## Reading Order

| # | Document | What it covers |
|---|----------|----------------|
| 1 | [Architecture — Overview](./architecture/overview.md) | System context, container diagram, key flows, quality attributes |
| 2 | [Architecture — Service Catalog](./architecture/services.md) | Every service, its tech stack, responsibilities, APIs, and SLOs |
| 3 | [Architecture — Data](./architecture/data-architecture.md) | Data ownership, persistence choices, tenancy model, event store |
| 4 | [Architecture — Security](./architecture/security.md) | Authentication, authorization, RBAC, multi-tenancy isolation, secrets |
| 5 | [API — Conventions](./api/README.md) | REST conventions, envelope format, pagination, errors, versioning |
| 6 | [API — OpenAPI Spec](./api/openapi.yaml) | Machine-readable API contract (OpenAPI 3.1) |
| 7 | [API — Event Catalog](./api/events.md) | Async event schemas published on the event bus |
| 8 | [Guides — Development](./guides/development.md) | Local setup, running services, testing, code standards |
| 9 | [Guides — Deployment](./guides/deployment.md) | Containers, CI/CD, environments, observability, scaling |
| 10 | [Roadmap](./roadmap.md) | Phased delivery plan from the current MERN core to the full system |

## Architecture Decision Records (ADRs)

Significant technical decisions are recorded as ADRs in [`adr/`](./adr/README.md):

| ADR | Decision | Status |
|-----|----------|--------|
| [0001](./adr/0001-adopt-polyglot-microservices.md) | Adopt a polyglot microservices architecture | Accepted |
| [0002](./adr/0002-service-technology-allocation.md) | Allocate Java / Python / Rust / JS per service domain | Accepted |
| [0003](./adr/0003-event-bus-redis-streams.md) | Use Redis Streams as the event bus | Accepted |
| [0004](./adr/0004-polyglot-persistence.md) | Use polyglot persistence (MongoDB + PostgreSQL + object storage) | Accepted |
| [0005](./adr/0005-communication-patterns.md) | REST for queries, events for side effects, JWT identity propagation | Accepted |

## Status Legend

The platform is delivered incrementally. Documentation describes the **target full system**; each component is marked:

- ✅ **Exists** — implemented in this repository today
- 🚧 **Planned** — designed and documented, implementation scheduled (see [Roadmap](./roadmap.md))

## Repository Layout (Current + Planned)

```
saas-dashboard/
├── client/                  ✅ React (Vite) SPA — dashboard, landing, onboarding
├── server/                  ✅ Node.js/Express core API (MERN backend)
├── services/
│   ├── gateway/             🚧 Rust (Axum) edge gateway
│   ├── billing-service/     🚧 Java (Spring Boot) billing & subscriptions
│   └── analytics-service/   🚧 Python (FastAPI) analytics & ML
├── deploy/                  🚧 Docker Compose, Kubernetes manifests, CI pipelines
├── docs/                    ✅ This documentation
└── README.md                ✅ Project overview
```

## Conventions

- **Diagrams** use [Mermaid](https://mermaid.js.org/) and render on GitHub.
- **APIs** follow [API — Conventions](./api/README.md); the source of truth is the [OpenAPI spec](./api/openapi.yaml).
- **Decisions** are captured as ADRs — never delete one; supersede it with a new ADR.
- Keep docs in the same PR as the code change they describe.
