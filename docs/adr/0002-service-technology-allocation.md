# ADR-0002: Service Technology Allocation (Java / Python / Rust / JS)

- **Status:** Accepted (2026-11-03)
- **Deciders:** Platform team
- **Related:** [ADR-0001](./0001-adopt-polyglot-microservices.md)

## Context

ADR-0001 chose a polyglot microservices architecture. We must allocate languages to domains so each choice is defensible long-term, not fashion-driven. The product explicitly spans MERN, Java, Python, and Rust.

## Decision

| Service | Language / runtime | Rationale |
|---------|--------------------|-----------|
| `client` | **JavaScript/TypeScript** (React 18, Vite) | Only practical choice for the SPA; shared types and validation libs with core-api; existing codebase. |
| `core-api` | **Node.js / Express (MERN backend)** | CRUD-heavy domain (users, CRM, notifications) with high iteration speed; one language across client/server for DTOs, validation schemas, and shared error envelopes; existing codebase with Socket.io realtime. |
| `billing-service` | **Java 21 (Spring Boot 3)** | Money correctness first: JPA/JTA-style transaction discipline, mature payments/ledger ecosystem, strong typing for financial invariants, LTS runtime, first-class batch jobs (invoicing runs), and the compliance tooling auditors expect (JaCoCo coverage gates, OWASP dependency-check). |
| `analytics-service` | **Python 3.12 (FastAPI)** | The ML/data ecosystem (pandas, scikit-learn, statsmodels, Jupyter→pipeline workflow) is unmatched; FastAPI gives typed request models (Pydantic) and async I/O so the API layer stays fast while heavy work runs in workers. |
| `gateway` | **Rust (Axum + tokio)** | The edge does auth verification, rate limiting, header hygiene, and WebSocket fan-out — a latency-critical, concurrency-heavy, memory-safety-critical path. Rust delivers p99 latency without GC pauses and eliminates whole classes of memory bugs at the public attack surface. |

Standards per language (kept uniform across services):

- Java: Spring Boot conventions, `mapstruct` DTO mapping, Testcontainers for integration tests.
- Python: `uv`/`pip` + `pyproject.toml`, `ruff` + `mypy --strict` in CI, Pydantic v2 models.
- Rust: `cargo clippy -D warnings`, `cargo test`, `tokio` + `axum` idioms.
- JS: ESM, ESLint, Vitest/Jest as already configured.

## Consequences

**Positive**

- Each service uses the ecosystem where it is strongest; hiring/specialization maps to domains.
- Billing gets JVM-grade transactional tooling; ML gets Python's library stack; the edge gets predictable latency.

**Negative / mitigated**

- Four toolchains in CI → pipeline templates per language ([deployment guide](../guides/deployment.md#cicd)); dependency updates automated (Renovate).
- Cross-language contracts drift → contract-first: [OpenAPI spec](../api/openapi.yaml) and [event catalog](../api/events.md) are the source of truth; CI validates generated clients/server stubs against them 🚧.
- Context switching → mitigated by the small service count and the rule that shared conventions (envelope, errors, pagination, events) are identical everywhere.

## Alternatives Considered

- **All-TypeScript** (NestJS everywhere): fastest start, but weaker ML ecosystem and GC pauses at the edge; billing tooling less standard for audits.
- **All-Java backend**: excellent for billing, poor for ML iteration speed, heavier for the CRUD core.
- **Go for the gateway** instead of Rust: simpler learning curve, but Rust's zero-GC latency and memory-safety guarantees at the public attack surface won for this system's priorities.
