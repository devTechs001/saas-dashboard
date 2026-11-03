# ADR-0005: Communication Patterns (REST + Events + JWT Propagation)

- **Status:** Accepted (2026-11-03)
- **Deciders:** Platform team
- **Related:** [ADR-0003](./0003-event-bus-redis-streams.md), [API conventions](../api/README.md), [Event catalog](../api/events.md)

## Context

With four services (ADR-0001) we must decide how they talk: synchronous vs asynchronous, protocol choice, and how identity/tenancy context travels between them. Wrong choices here cause cascading failures, hidden coupling, or security holes (tenancy bypass).

## Decision

**1. Synchronous REST/JSON for commands and queries.**

- External clients → gateway → services; service-to-service calls use the same REST conventions and envelope ([API conventions](../api/README.md)).
- OpenAPI 3.1 is contract-first: `docs/api/openapi.yaml` is the source of truth; breaking changes require versioning.
- **No synchronous chains deeper than one hop** — a service may call another only to serve an immediate request; anything that fans out or retriggers work goes to the event bus.

**2. Asynchronous events for cross-service side effects.**

- Rule of thumb: *if an action must trigger work in another service, publish an event instead of calling it.* (Example: Stripe webhook → billing commits ledger → emits `billing.invoice.paid` → core-api updates entitlements, analytics refreshes rollups. No service calls another in that chain.)
- Envelope, naming, and delivery guarantees per [event catalog](../api/events.md); transport per [ADR-0003](./0003-event-bus-redis-streams.md).
- **Transactional outbox** in producers (DB write + outbox row; relay publishes) so events survive crashes 🚧.

**3. Identity and tenancy propagate via verified JWT claims.**

- The gateway verifies the JWT and forwards `X-Tenant-Id`, `X-User-Id`, `X-User-Role`, `X-Request-Id` (stripping any client-supplied values). Services verify the JWT themselves too (defense in depth).
- `tenantId` is never read from request bodies.

**4. Resilience defaults for sync calls**

| Mechanism | Default |
|-----------|---------|
| Timeout | 2 s intra-cluster (10 s external like Stripe) |
| Retry | Idempotent GETs only, 3 attempts, exponential backoff + jitter |
| Circuit breaker | Open after 5 failures / 30 s window; half-open probe after 15 s |
| Bulkhead | Per-dependency connection pools and concurrency caps |

## Consequences

**Positive**

- Clear, testable rule set for every interaction; cascading failure paths are structurally limited.
- Services remain independently deployable; contracts are explicit and machine-checkable.
- Identity spoofing across services is blocked at both the edge and the services.

**Negative / mitigated**

- Some flows become eventually consistent (entitlements after payment) → documented acceptable window (< 30 s); critical reads can query billing's API synchronously when strong consistency is required.
- REST for internal calls is less efficient than binary RPC → acceptable at current scale; revisit gRPC only if profiling shows serialization overhead matters.

## Alternatives Considered

- **gRPC internally:** efficient and strongly typed, but adds toolchain friction across four languages and a second contract system alongside OpenAPI. Revisit with evidence.
- **Choreography + orchestration both everywhere:** we use pure choreography via events now; introduce explicit sagas/orchestrator only for flows needing compensation (e.g., failed payment → entitlement rollback).
- **GraphQL at the edge:** good for dashboard aggregation, but complicates caching, rate limiting, and authz at the gateway; REST + tailored endpoints fit the current UI.
