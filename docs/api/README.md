# API Conventions

All external HTTP APIs follow these conventions. The machine-readable contract is [`openapi.yaml`](./openapi.yaml); async contracts are in the [event catalog](./events.md).

## Base URL & Versioning

| Environment | Base URL |
|-------------|----------|
| Local dev | `http://localhost:3000/api/v1` (gateway 🚧) / `http://localhost:5000/api` (core-api direct ✅) |
| Production | `https://api.<domain>/api/v1` |

- **URL versioning:** all endpoints live under `/api/v1`. Breaking changes ship as `/api/v2` with a documented deprecation window (min. 6 months). Additive changes (new fields, new endpoints) are non-breaking.
- The existing core-api serves `/api/*`; the gateway rewrites `/api/v1/*` to the correct service and preserves `/api/v1` in docs as the canonical external namespace.

## Request Standards

- **Format:** JSON (`Content-Type: application/json`), UTF-8.
- **Auth:** `Authorization: Bearer <JWT>` on every non-public endpoint.
- **Request ID:** clients may send `X-Request-Id`; otherwise the gateway generates one and propagates it to logs and the response.
- **Idempotency:** unsafe operations that create money objects (`POST /billing/invoices`, payment attempts) accept an `Idempotency-Key` header; replays return the original result.
- **Dates:** ISO-8601 UTC strings (`2026-11-03T12:00:00Z`). Query params accept `from`/`to` date ranges.
- **Field naming:** camelCase in JSON.

## Response Envelope

Every response uses the platform envelope (matches `server/src/utils/ApiResponse.js` ✅):

```jsonc
// success
{
  "statusCode": 200,
  "message": "Success",
  "data": { "…": "resource or array" },
  "success": true
}

// error
{
  "statusCode": 404,
  "message": "Customer not found",
  "data": null,
  "success": false,
  "errors": ["field-level detail"]      // optional, validation failures
}
```

## Pagination

List endpoints accept:

| Param | Default | Max | Meaning |
|-------|---------|-----|---------|
| `page` | 1 | — | 1-based page number |
| `limit` | 10 | 100 | Items per page |
| `sort` | resource default | — | e.g. `sort=-createdAt` (descending) |
| `q` | — | — | free-text search where supported |

And return pagination metadata alongside the data (matches core-api's existing shape):

```jsonc
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "customers": [ { "…": "…" } ],
    "pagination": { "total": 128, "page": 2, "limit": 10, "pages": 13 }
  }
}
```

## Error Codes

| HTTP | `message` pattern | When |
|------|-------------------|------|
| 400 | `Validation failed` / `Bad request` | Malformed input; `errors[]` lists fields |
| 401 | `Unauthorized` | Missing/invalid/expired JWT |
| 403 | `Forbidden` | Valid JWT, insufficient role/permission |
| 404 | `Not Found` | Missing **or cross-tenant** resource (anti-enumeration) |
| 409 | `Conflict` | Unique constraint (e.g. email already registered) |
| 429 | `Too many requests` | Rate limit exceeded; `Retry-After` header set |
| 5xx | `Internal Server Error` | Unexpected failure; check `X-Request-Id` in support tickets |

Clients must treat unknown `2xx` as success and unknown fields as ignorable.

## Rate Limiting

| Client tier | Limit (planned, enforced at gateway 🚧) |
|-------------|------------------------------------------|
| Anonymous | 60 req/min per IP |
| Authenticated | 300 req/min per user |
| Service-to-service | 1000 req/min per token |

Today, core-api applies `express-rate-limit` per IP ✅. Exceeding a limit returns `429` + `Retry-After`.

## Realtime (WebSocket)

- Endpoint: `wss://<host>/socket.io` (Socket.io protocol).
- Auth: JWT via `auth.token` in the handshake payload.
- Rooms: `tenant:<tenantId>`, `user:<userId>`. Events are named `notification:new`, `report:ready`, etc. (see [event catalog](./events.md) for payloads).

## Service-Specific Prefixes

| Prefix | Service | Docs section |
|--------|---------|--------------|
| `/api/v1/auth`, `/users`, `/customers`, `/notifications` | core-api | [openapi.yaml](./openapi.yaml) |
| `/api/v1/billing/*` | billing-service 🚧 | openapi.yaml (`Billing` tag) |
| `/api/v1/analytics/*`, `/api/v1/reports/*` | analytics-service 🚧 (served by core-api today ✅) | openapi.yaml (`Analytics`, `Reports` tags) |

## Health Endpoints (internal)

Each service exposes `GET /health` → `200 {"status":"ok"}` (liveness) and `GET /ready` → `200/503` (readiness with dependency checks). Not exposed through the gateway.
