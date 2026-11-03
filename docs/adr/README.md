# Architecture Decision Records (ADRs)

We keep lightweight ADRs to record *why* the architecture is the way it is. Format is a trimmed [MADR](https://adr.github.io/madr/): Status / Context / Decision / Consequences.

## Rules

- One decision per ADR; never edit an accepted ADR's decision — supersede it with a new one and mark the old one `Superseded by ADR-XXX`.
- Every ADR gets a number in `NNNN-kebab-title.md`, sequential and gap-free.
- Anything that changes a cross-service contract, trust boundary, or technology choice needs an ADR in the same PR.

## Index

| # | Title | Status | Summary |
|---|-------|--------|---------|
| [0001](./0001-adopt-polyglot-microservices.md) | Adopt a polyglot microservices architecture | Accepted | Split the MERN monolith-into-being into domain services behind a gateway |
| [0002](./0002-service-technology-allocation.md) | Service technology allocation | Accepted | Java→billing, Python→analytics/ML, Rust→gateway, JS/TS→MERN core |
| [0003](./0003-event-bus-redis-streams.md) | Redis Streams as the event bus | Accepted | At-least-once events over Redis Streams instead of Kafka/RabbitMQ now |
| [0004](./0004-polyglot-persistence.md) | Polyglot persistence | Accepted | MongoDB + PostgreSQL + object storage + Redis, one owner per store |
| [0005](./0005-communication-patterns.md) | Communication patterns | Accepted | REST for commands/queries, events for side effects, JWT identity propagation |
