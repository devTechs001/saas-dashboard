# Event Catalog

**Status:** 🚧 (bus ships in Phase 4 of the [roadmap](../roadmap.md); schemas below are the contract)

All cross-service asynchronous communication flows through the Redis Streams event bus ([ADR-0003](../adr/0003-event-bus-redis-streams.md)). This document is the source of truth for event names and payload schemas.

## Delivery Semantics

| Property | Value |
|----------|-------|
| Transport | Redis Stream `stream:events` |
| Delivery | At-least-once |
| Ordering | Per aggregate ID preserved (single stream, `XADD` order); global order not guaranteed across aggregates |
| Consumer groups | `core-api`, `billing-service`, `analytics-service` (+ future) |
| Idempotency | Consumers dedupe by `id` (persisted in `processed_events`, TTL 30 days) |
| Failure handling | Failed messages retry with backoff (5 attempts), then dead-letter stream `stream:events:dlq` + alert |
| Schema evolution | Additive changes only within a `version`; breaking changes bump `version` and producers dual-publish during migration |

## Envelope

Every event on the bus uses this envelope (fields are fixed; `payload` varies per type):

```jsonc
{
  "id": "evt_01HQ8Z3N7K...",        // ULID, globally unique, used for idempotency
  "type": "billing.invoice.paid",   // <domain>.<entity>.<action>
  "version": 1,                      // payload schema version
  "occurredAt": "2026-11-03T09:15:00Z",
  "tenantId": "tnt_66f1c2...",       // tenant scope — mandatory on every event
  "actor": {                         // who caused it (system actors use "type": "system")
    "type": "user", "id": "usr_...", "role": "admin"
  },
  "correlationId": "req_...",        // X-Request-Id of the originating request, if any
  "payload": { }
}
```

Naming rules: `domain` ∈ {`user`, `tenant`, `customer`, `billing`, `analytics`, `report`, `notification`}; `action` is past tense (`created`, `updated`, `deleted`, `paid`, `failed`).

## Event Types

### `user.*` — producer: core-api

| Type | v | Payload | Consumers |
|------|---|---------|-----------|
| `user.created` | 1 | `{ userId, email, role, name }` | billing (provision trial), analytics |
| `user.updated` | 1 | `{ userId, changed: ["role", ...] }` | billing, analytics |
| `user.deactivated` | 1 | `{ userId, reason }` | billing (revoke seats), core-api (kill sessions) |

### `customer.*` — producer: core-api

| Type | v | Payload | Consumers |
|------|---|---------|-----------|
| `customer.created` | 1 | `{ customerId, name, email, status, value }` | analytics (rollups) |
| `customer.updated` | 1 | `{ customerId, changed: {...} }` | analytics |
| `customer.deleted` | 1 | `{ customerId }` | analytics (purge rollups) |

### `billing.*` — producer: billing-service

| Type | v | Payload | Consumers |
|------|---|---------|-----------|
| `billing.subscription.created` | 1 | `{ subscriptionId, planId, status, currentPeriodEnd }` | core-api (entitlements), analytics |
| `billing.subscription.changed` | 1 | `{ subscriptionId, planId, status, previousStatus }` | core-api, analytics |
| `billing.invoice.created` | 1 | `{ invoiceId, subscriptionId, amountDue: "120.00", currency: "USD", dueAt }` | core-api (notify), analytics |
| `billing.invoice.paid` | 1 | `{ invoiceId, amountPaid: "120.00", currency, paidAt, paymentId }` | core-api, analytics |
| `billing.invoice.paymentFailed` | 1 | `{ invoiceId, attempt, nextRetryAt, reason }` | core-api (notify admin), analytics |
| `billing.payment.refunded` | 1 | `{ paymentId, amount: "40.00", currency, reason }` | analytics |

### `analytics.*` — producer: analytics-service

| Type | v | Payload | Consumers |
|------|---|---------|-----------|
| `analytics.anomaly.detected` | 1 | `{ metric, series, point: {ts, value}, score, modelVersion }` | core-api (notify) |
| `analytics.rollup.completed` | 1 | `{ bucket: "2026-11-03", metrics: {...}, durationMs }` | (observability) |

### `report.*` — producer: analytics-service

| Type | v | Payload | Consumers |
|------|---|---------|-----------|
| `report.requested` | 1 | `{ reportId, type, parameters, requestedBy }` | analytics (self, queued work) |
| `report.generated` | 1 | `{ reportId, artifactUrl, format, sizeBytes, generatedAt }` | core-api (notification + Socket.io push) |
| `report.failed` | 1 | `{ reportId, reason, retryable }` | core-api (notify) |

### `notification.*` — producer: core-api

| Type | v | Payload | Consumers |
|------|---|---------|-----------|
| `notification.delivered` | 1 | `{ notificationId, userId, channel: "inapp"\|"email"\|"sms" }` | analytics (engagement) |

## WebSocket Mirror

Real-time client events mirror bus events 1:1 over Socket.io, delivered to room `tenant:<tenantId>` (or `user:<userId>` for personal notifications). The Socket.io event name is the bus `type` with `.` → `:` (e.g. `report:generated`), and the payload is the envelope's `payload` plus `occurredAt`.

## Adding a New Event

1. Add the schema here first (review in the PR).
2. Bump nothing if additive; create a new `version` row if breaking.
3. Implement producer with a stable `id` (ULID) and mandatory `tenantId`.
4. Register consumer(s) with idempotent handling before enabling in staging.
