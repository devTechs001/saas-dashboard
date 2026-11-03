# ADR-0004: Polyglot Persistence (MongoDB + PostgreSQL + Object Storage + Redis)

- **Status:** Accepted (2026-11-03)
- **Deciders:** Platform team
- **Related:** [ADR-0001](./0001-adopt-polyglot-microservices.md), [Data architecture](../architecture/data-architecture.md)

## Context

The platform's data workloads differ sharply:

- CRM/user/notification entities are flexible documents evolving with the product (already in MongoDB via Mongoose).
- Billing requires strict transactions, relational integrity (invoices ↔ line items ↔ ledger), and auditable immutability.
- Analytics produces large generated artifacts (PDF/CSV reports, trained models) that belong in blob storage.
- Sessions, rate-limit counters, and hot aggregate caches are ephemeral key-value state.

Forcing one store over all of these creates either schema rigidity (everything relational) or integrity risk (money in a document store without constraints).

## Decision

**Polyglot persistence with single ownership per store** ([data architecture](../architecture/data-architecture.md)):

| Store | Data | Owner |
|-------|------|-------|
| MongoDB 7 | users, customers, analytics events, reports metadata, notifications | core-api |
| PostgreSQL 16 | plans, subscriptions, invoices, payments, double-entry ledger, entitlements | billing-service |
| S3-compatible object storage | report artifacts, ML models, analytics archives | analytics-service |
| Redis 7 | cache, sessions, rate-limit counters, streams (ADR-0003) | all (shared, keyspace partitioned) |

Rules:

1. Only the owner writes; other services use APIs or events (analytics-service has a documented read-only connection to MongoDB replicas).
2. Multi-tenant scoping is enforced in every store ([tenancy model](../architecture/data-architecture.md#tenancy-model)).
3. Migrations are per-store tooling: Mongoose schema migrations (core-api), Flyway (billing-service).

## Consequences

**Positive**

- Money gets relational constraints + ACID; documents keep schema flexibility; blobs stay out of databases; Redis stays ephemeral.
- Each service can tune and scale its store independently.

**Negative / mitigated**

- Cross-store joins are impossible → resolved by events + denormalized read models (analytics rollups), not distributed queries.
- Backups/restore per store ([data architecture](../architecture/data-architecture.md#backup--recovery)) — rehearsed in staging.
- Operational surface grows (3 stateful technologies) → acceptable at this scope; revisit if a domain could simply reuse another store *without* compromising ownership.

## Alternatives Considered

- **MongoDB everywhere:** less friction, but no ACID multi-statement guarantees of the kind ledger accounting relies on (Mongo multi-doc transactions exist but lack the surrounding relational tooling and constraint model auditors expect).
- **PostgreSQL everywhere (JSONB):** strong consistency, but documents lose flexible indexing ergonomics and the existing Mongoose codebase would be rewritten for no product gain.
