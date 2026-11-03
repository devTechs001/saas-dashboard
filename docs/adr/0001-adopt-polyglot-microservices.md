# ADR-0001: Adopt a Polyglot Microservices Architecture

- **Status:** Accepted (2026-11-03)
- **Deciders:** Platform team

## Context

The repository currently contains a working MERN application (`client/` React SPA + `server/` Express API + MongoDB). The product vision is a **full SaaS system**: CRM, analytics, billing/subscriptions, ML-driven insights, and realtime updates, delivered to many tenants.

Building billing and ML directly into the Node monolith would work short-term but creates known failure modes:

- Money handling needs strict transactions and audit guarantees that are hard to retrofit later.
- ML/data workloads (pandas, model training) do not belong in the request path of a Node API.
- Edge concerns (rate limiting, WebSocket fan-out at scale) have latency/throughput profiles that a garbage-collected runtime handles poorly under burst.
- Different parts of the system need to evolve and deploy on different cadences.

## Decision

Structure the platform as **domain microservices behind a single edge gateway**, in a **polyglot** stack, with the existing MERN app as the core domain service:

- `client` + `core-api` (MERN) — keep and own: identity, users, CRM, notifications.
- `gateway` (Rust) — new edge service.
- `billing-service` (Java) — new domain service.
- `analytics-service` (Python) — new domain service.
- Redis Streams as the event bus between them (see ADR-0003).

We migrate incrementally behind the gateway (strangler-fig style) per the [roadmap](../roadmap.md) — the monolith-ish core-api keeps serving existing endpoints while new services take over their domains.

## Consequences

**Positive**

- Each domain gets the runtime/ecosystem that fits it best (ADR-0002).
- Independent deployment and scaling; billing can get its own release cadence and compliance posture.
- Failure isolation: ML backpressure or a billing outage does not take down the dashboard.

**Negative / mitigated**

- Operational complexity (more moving parts) → mitigated by a strict service template, shared observability, and Docker Compose/K8s tooling ([deployment guide](../guides/deployment.md)).
- Distributed-systems pitfalls (partial failure, eventual consistency) → mitigated by [ADR-0005](./0005-communication-patterns.md) (events + idempotency, sagas where needed) and contract tests in CI.
- Four languages to support → mitigated by keeping the number of services small (4) and conventions uniform ([API conventions](../api/README.md)).

**Risks**

- Over-splitting. Guardrail: no new service unless it has a distinct domain owner AND a distinct scaling/compliance need.
