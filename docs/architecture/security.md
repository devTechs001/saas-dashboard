# Security Architecture

**Status legend:** ✅ exists today · 🚧 planned

## Threat Model Summary

| Asset | Primary threats | Mitigation |
|-------|-----------------|------------|
| Tenant data | Cross-tenant access, injection, stolen tokens | Tenant scoping at every layer, input sanitization, short-lived JWTs |
| Credentials | Brute force, credential stuffing, hash theft | bcrypt (cost ≥ 10), rate limiting, lockout policy 🚧, argon2 migration 🚧 |
| Payment data | Fraud, webhook spoofing, tampering | Stripe-hosted fields (SAQ-A), signature verification, immutable ledger |
| Service traffic | MITM, spoofed internal calls | TLS everywhere externally, mTLS internally 🚧, service tokens |
| Availability | DDoS, abusive clients | Gateway rate limiting (Redis), upstream quotas, WAF at ingress 🚧 |

Compliance targets: SOC 2 Type II readiness, GDPR (data residency, right-to-erasure runbook), PCI-DSS SAQ-A (no card data at rest).

## Authentication

- **Mechanism:** JWT (HS256 today; RS256/JWKS rotation planned 🚧).
- **Claims:** `userId`, `tenantId`, `role`, `permissions[]`, `iat`, `exp`.
- **Lifetimes:** access token short-lived (`JWT_EXPIRE`, default 7d today → moving to 15 min + rotating refresh tokens 🚧).
- **Passwords:** bcrypt-hashed (`select: false` on the model), minimum length 6 today → policy tightening to 12 + breach-list check 🚧.
- **Verification points:** the Rust gateway verifies JWTs at the edge (rejects before routing); services re-verify defensively (zero-trust).

## Authorization (RBAC)

Roles are hierarchical but enforced as explicit grants, mirroring the `User` model (`role` + `permissions[]`):

| Capability | `admin` | `manager` | `viewer` |
|------------|:-------:|:---------:|:--------:|
| View dashboards & analytics | ✅ | ✅ | ✅ |
| Manage customers (CRM) | ✅ | ✅ | ❌ |
| Generate / download reports | ✅ | ✅ | own only |
| Manage users & roles | ✅ | ❌ | ❌ |
| Billing: view | ✅ | ✅ | ❌ |
| Billing: change plan / payment methods | ✅ | ❌ | ❌ |
| Tenant settings & integrations | ✅ | ❌ | ❌ |

- Enforcement is **deny by default**; route-level middleware in core-api, `@PreAuthorize` in billing-service, dependency guards in analytics-service.
- Fine-grained `permissions[]` strings (e.g. `customers:write`, `reports:download`) allow future per-user overrides without new roles.

## Multi-Tenancy Isolation

See [Data architecture — Tenancy model](./data-architecture.md#tenancy-model). Rules:

1. `tenantId` comes **only** from the verified JWT — never from request bodies/headers.
2. Every datastore query is scoped; cross-tenant reads return `404`.
3. Object storage paths embed the tenant and signed URLs are scoped + expiring.
4. Background jobs carry an explicit tenant context; fan-out jobs iterate tenants explicitly.

## Service-to-Service Security 🚧

- Inside the cluster: mTLS via service mesh or sidecars; services additionally require a static service token (`X-Service-Token`, rotated via secrets manager) for non-user-initiated calls.
- Webhooks (Stripe): signature verification (`Stripe-Signature`, timestamp tolerance 5 min), replay protection via `webhook_events` idempotency table.
- No public service except the gateway; internal services bind to the cluster network only.

## Input & Output Protection

Already in core-api ✅:

- `helmet` (security headers), `express-mongo-sanitize` (NoSQL injection), `xss-clean`, `express-validator` on routes, JSON body limit 10 MB, `express-rate-limit` per-IP.

Planned 🚧:

- Central rate limiting & payload caps at the gateway (per tenant/user/IP tiers).
- Strict content-type allow-lists and output encoding at the edge.
- Dependency scanning (Dependabot/Renovate + `npm audit`, `cargo audit`, `pip-audit`, OWASP dependency-check for Java) in CI — failing on critical CVEs.

## Secrets Management

| Environment | Store |
|-------------|-------|
| Local | `.env` files (git-ignored; `.env.example` committed) |
| CI | GitHub Actions encrypted secrets |
| Staging/Prod | Cloud secrets manager (e.g. AWS Secrets Manager / Vault) mounted as env or files; **never** in images |

Secrets inventory (names): `JWT_SECRET`, `MONGODB_URI`, `REDIS_URL`, `POSTGRES_DSN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `S3_*`, `SERVICE_TOKEN`. Rotation cadence: 90 days or on incident.

## Audit & Monitoring

- **Audit log 🚧:** append-only (PostgreSQL `audit_log` or WORM bucket) for: auth events, role changes, billing mutations, data exports. Fields: actor, tenant, action, target, before/after digest, `X-Request-Id`.
- **Alerts 🚧:** auth failure spikes, rate-limit trip spikes, cross-tenant 404 anomalies, webhook signature failures, ledger balance invariant violations (page immediately).
- **Logging hygiene:** never log tokens, passwords, or full request bodies containing PII; redact `Authorization` headers (Winston redaction already in place for common fields).

## Secure Development Lifecycle

1. PR review required for `server/`, `services/` (CODEOWNERS 🚧).
2. CI gates: lint, unit tests, SAST (Semgrep 🚧), dependency audit.
3. Quarterly pen-test / threat-model review; ADR updates for any trust-boundary change.
4. Incident response: runbook in [Deployment](../guides/deployment.md#incident-response) — severity table, comms plan, rollback procedure.
