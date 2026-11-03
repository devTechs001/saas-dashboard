# ADR-0003: Redis Streams as the Event Bus

- **Status:** Accepted (2026-11-03)
- **Deciders:** Platform team
- **Related:** [ADR-0005](./0005-communication-patterns.md)

## Context

Services need to react to each other's state changes (invoice paid → unlock entitlements + refresh analytics; report generated → notify user). We need durable, ordered-enough, at-least-once event delivery with consumer groups, but our current footprint is a single-region deployment with modest throughput (hundreds of events/sec at peak, not millions).

## Decision

Use **Redis Streams** (`XADD`/`XREADGROUP`/`XACK`) as the event bus:

- One logical stream `stream:events` (partitionable later into `stream:events:<shard>` if needed), plus `stream:events:dlq` for dead letters.
- Consumer groups per service: `core-api`, `billing-service`, `analytics-service`.
- Delivery **at-least-once**; consumers are **idempotent** (dedupe by envelope `id`, [event catalog](../api/events.md)).
- Events retained ~7 days / bounded entries (`MAXLEN`); they are a *change-propagation* mechanism, not the system of record.
- A thin outbox pattern in producers (write to DB + stream in one transaction where the DB supports it, or DB-outbox + relay job 🚧) prevents lost events on crash.

We already run Redis for caching and rate limiting, so this adds no new infrastructure.

## Consequences

**Positive**

- Zero new infra components; ops surface unchanged; consumer groups + ACKs + pending-entry claiming cover retries and crash recovery.
- Simple mental model; easy local development (docker-compose already needs Redis).

**Negative / mitigated**

- Redis is not a "forever log" like Kafka — acceptable because events are not the system of record; retention is bounded and state lives in service stores ([data architecture](../architecture/data-architecture.md)).
- Throughput ceiling lower than Kafka → revisit if sustained load exceeds ~50k events/s or multi-region replication is required. Migration path: swap the transport behind the same envelope ([event catalog](../api/events.md)); producers/consumers talk to a small internal `eventbus` abstraction, so only the adapter changes.

## Alternatives Considered

- **Kafka / Redpanda:** superior durability and replay, but a heavy new operational dependency at our current scale. Trigger to reconsider: multi-region, >50k ev/s, or audit-grade replay requirements.
- **RabbitMQ:** mature routing semantics, but another broker to run; Streams' log semantics fit our append-only event model better.
- **DB polling (outbox only):** simpler but higher latency (seconds) for realtime UX; we keep the outbox for reliability but deliver via Streams.
