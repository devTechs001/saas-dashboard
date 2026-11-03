# Data Architecture

**Status legend:** ✅ exists today · 🚧 planned

## Principles

1. **Data ownership** — each service is the only writer of its data. Other services read via APIs or events, never by touching another service's tables/collections directly (analytics read-only access is the one documented exception).
2. **Polyglot persistence** — the store matches the workload ([ADR-0004](../adr/0004-polyglot-persistence.md)): document store for flexible core entities, relational for money, object storage for blobs, Redis for ephemeral state.
3. **Tenant isolation everywhere** — every document/row/artifact is scoped by `tenantId` ([Tenancy model](#tenancy-model)).
4. **Events are the integration backbone** — cross-service data propagation happens through the [event bus](../api/events.md), at-least-once with idempotent consumers.

## Store Overview

| Store | Tech | Owner | Data | Status |
|-------|------|-------|------|--------|
| Core domain | MongoDB 7 | core-api ✅ | users, customers, analytics events, reports, notifications | ✅ |
| Billing ledger | PostgreSQL 16 | billing-service | plans, subscriptions, invoices, payments, ledger entries | 🚧 |
| Cache / ephemeral | Redis 7 | all | sessions, rate-limit counters, hot aggregate caches | ✅ |
| Event bus | Redis Streams | all | domain event log (retained, consumer groups) | 🚧 |
| Artifacts | S3-compatible (MinIO locally) | analytics-service | generated report PDFs/CSVs | 🚧 |

## core-api — MongoDB ✅

Collections mirror the existing Mongoose models in `server/src/models/`:

| Collection | Key fields | Notes |
|------------|------------|-------|
| `users` | `name`, `email` (unique), `password` (bcrypt, `select:false`), `role` (`admin\|manager\|viewer`), `permissions[]`, `tenantId`, `isActive` | Auth identity; RBAC source |
| `customers` | `name`, `email`, `company`, `status`, `value`, `tags[]`, `tenantId`, `ownerId` → users | CRM records |
| `analytics` | `type`, `metrics{}`, `dimensions{}`, `date`, `tenantId` | Raw & rolled-up metrics |
| `reports` | `title`, `type`, `parameters{}`, `status`, `fileUrl`, `tenantId`, `createdBy` | Report definitions + generation state |
| `notifications` | `user` → users, `title`, `message`, `type`, `read`, `tenantId` | In-app notification feed |

**Indexes (minimum):**

```js
users:       { email: 1 } unique
             { tenantId: 1, role: 1 }
customers:   { tenantId: 1, email: 1 }
             { tenantId: 1, status: 1, value: -1 }
analytics:   { tenantId: 1, type: 1, date: -1 }
reports:     { tenantId: 1, createdAt: -1 }
notifications: { user: 1, read: 1, createdAt: -1 }
```

**Retention:** raw `analytics` documents older than 13 months are archived to object storage (Parquet) and deleted by a monthly job 🚧. Audit-relevant `reports` metadata is kept indefinitely; artifacts follow the plan's retention.

## billing-service — PostgreSQL 🚧

Relational, strictly transactional. Schema managed by Flyway (`services/billing-service/src/main/resources/db/migration`).

| Table | Purpose |
|-------|---------|
| `plans`, `prices` | Product catalog (per-tenant overrides allowed) |
| `subscriptions` | Lifecycle state machine: `trialing → active → past_due → canceled` |
| `invoices`, `invoice_lines` | Immutable once issued; corrections via credit notes |
| `payments`, `refunds` | Stripe references, status, idempotency keys |
| `ledger_entries` | Double-entry rows (`account_id`, `debit`, `credit`, `entry_ts`); sum of debits = sum of credits enforced per transaction |
| `entitlements` | Effective feature set per tenant/subscription; replicated to core-api cache via events |
| `webhook_events` | Processed Stripe event IDs (idempotency guard) |

Money is stored as `NUMERIC(19,4)` + ISO-4217 currency code — never floats.

## analytics-service — reads + artifacts 🚧

- **Reads:** MongoDB replica (or secondaryPreferred) for raw events, PostgreSQL read-only for revenue series. Analytics **never writes** to core collections; computed rollups live in its own Redis keys (`analytics:rollup:<tenant>:<bucket>`).
- **Artifacts:** generated reports land in object storage under `reports/<tenantId>/<reportId>/<file>` and are served via short-lived signed URLs. Artifacts are encrypted at rest (bucket policy) and never publicly readable.
- **Model storage:** trained ML models (scikit-learn) are versioned files in object storage under `models/<name>/<version>/`, loaded on worker start.

## Redis — cache, sessions, rate limits ✅ / events 🚧

| Use | Key pattern | TTL |
|-----|-------------|-----|
| Session / refresh tokens | `sess:<userId>` | matches `JWT_EXPIRE` |
| Rate limiting (gateway) | `rl:<tenant\|user\|ip>:<window>` | window + skew |
| Hot aggregate cache | `analytics:rollup:…` | 5 min |
| Event bus | `stream:events` (Redis Streams) | max ~10M entries / 7 days |

## Event Bus 🚧

Redis Streams carry all cross-service events ([Event catalog](../api/events.md), [ADR-0003](../adr/0003-event-bus-redis-streams.md)):

- Single logical stream `stream:events`, routed by event `type` to consumer groups (`core-api`, `billing-service`, `analytics-service`).
- Delivery: **at-least-once**. Consumers must be idempotent (dedupe by event `id` stored in a `processed_events` collection/table with TTL).
- Events are the source of truth for *change propagation only*; state lives in each service's own store.

## Tenancy Model

**Shared database, discriminator column/field.** Every document and row carries `tenantId`; every query is scoped by it.

| Layer | Enforcement |
|-------|-------------|
| JWT | `tenantId`, `userId`, `role`, `permissions` claims; signed, short-lived |
| gateway 🚧 | injects `X-Tenant-Id` from verified JWT; rejects cross-tenant header spoofing |
| core-api ✅ | Mongoose middleware scopes all queries by `tenantId` |
| billing-service 🚧 | JPA `@TenantFilter` + PostgreSQL row-level security on ledger tables |
| analytics-service 🚧 | tenant predicate required in every query builder (validated by tests) |
| object storage | path prefix + bucket policy per tenant; signed URLs embed tenant scope |

A request whose `tenantId` claim does not match the target resource's `tenantId` receives `404` (not `403`) to avoid resource-existence leaks.

## Backup & Recovery

| Store | Backup | RPO | RTO |
|-------|--------|-----|-----|
| MongoDB | daily snapshots + continuous oplog backup 🚧 | 5 min | 1 h |
| PostgreSQL | WAL archiving + nightly full | 5 min | 30 min |
| Object storage | cross-region replication | 15 min | 2 h |
| Redis | RDB every 15 min (cache loss tolerable; streams re-derivable from services) | 15 min | 30 min |

Restore procedures are rehearsed quarterly in staging ([Deployment](../guides/deployment.md#environments)).
