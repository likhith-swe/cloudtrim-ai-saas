# CloudTrim AI — Product Specification

Institutional-grade FinOps cloud waste, zombie resource & AWS/GCP cost-leak
radar. Engineering teams lose 25–40% of their cloud budget to idle compute,
unattached EBS volumes, zombie RDS replicas, misconfigured NAT gateways and
uncompressed S3 logs. CloudTrim AI detects these leaks, scores them with the
proprietary **WasteScore (0–100)**, prices them per hour, generates 1-click
Terraform / CLI remediation and fires multi-channel alerts before the invoice
lands.

## Stack

- Next.js 16 App Router · React 19 · TypeScript strict
- Tailwind CSS 4 · Space Grotesk + JetBrains Mono
- Drizzle ORM + PostgreSQL with **offline resilience** (boots & renders with
  no database; falls back to the 30-leak catalog + `globalThis.__ctMem`)
- Dual-currency billing: Razorpay (₹499/mo, fallback
  `https://razorpay.me/@likhiths`) + Stripe Checkout ($9/mo) + zero-config
  sandbox VIP activation
- Passwordless magic-link auth with HMAC-SHA256 signed `ct_session` cookie
- Telegram / WhatsApp / Slack / Resend alert dispatch with latency tracking

## WasteScore formula

```
WasteScore = 0.40·S_idle_compute + 0.25·S_orphan_storage
           + 0.20·S_egress_drain + 0.15·S_db_waste
           + B_critical_abandoned − P_production_risk
```

| Component | Normalization |
| --- | --- |
| `S_idle_compute` | `clamp(IdleCpuHours / 72 · 100, 0, 100)` |
| `S_orphan_storage` | `clamp(MonthlyOrphanGb / 500 · 100, 0, 100)` |
| `S_egress_drain` | `clamp(EgressCostMonthly / 300 · 100, 0, 100)` |
| `S_db_waste` | `clamp(OverprovisionedRamGb / 64 · 100, 0, 100)` |
| `B_critical_abandoned` | +15 when zero network I/O ≥ 14 days |
| `P_production_risk` | −30 when env tag is prod/production |

`isHighImpactLeak = WasteScore ≥ 80 AND MonthlyWaste ≥ $150`.
Implementation: `src/lib/waste-score.ts`.

## Offline catalog

`src/lib/fallback-leaks.ts` ships **30 verified leak signatures** across 5
categories (compute, storage, networking, database, serverless/AI). Every
record carries id, resourceName, provider, region, service, monthly waste in
minor units, detection reason, risk level, Terraform + CLI remediation and
raw metrics. Scores are **computed from metrics at module load** via the
formula — never hand-typed.

## Data layer

| Table | Purpose |
| --- | --- |
| `leaks` | Seeded from catalog on first successful DB boot |
| `remediation_history` | Script generation audit trail |
| `profiles` | Passwordless users + VIP flag |
| `user_watchlists` | FinOps tripwires (threshold rules) |
| `subscriptions` | razorpay / stripe / sandbox plans |
| `affiliate_clicks` | Monetization attribution |
| `newsletter_subscribers` | Weekly waste digest |
| `alert_events` | Delivery latency log per channel |
| `system_state` | KV (magic tokens, last scan, …) |

Every query in `src/lib/queries.ts` runs through `withDb(fn, fallback)`:
Postgres first (2.5 s probe, 4 s query cap, 20 s negative cache), memory
store otherwise. Zero unhandled rejections either way.

## API surface

- `GET /api/health` — service + DB + catalog status
- `GET /api/og` — 1200×630 dynamic waste certificate
- `GET /api/leaks` — filterable catalog (provider, service, minScore,
  minWasteUsd, maxRisk, q, sort)
- `POST /api/leak/[id]/remediate` — personalized Terraform/CLI scripts
- `GET|POST /api/watchlists`, `POST|DELETE /api/watchlists/[id]`
- `POST /api/newsletter/subscribe`
- `POST /api/auth/magic-link` → `GET /api/auth/verify` → `ct_session`
- `GET /api/auth/session`, `POST /api/auth/signout`
- `POST /api/billing/checkout` (razorpay | stripe),
  `POST /api/billing/sandbox-activate`
- `POST /api/webhooks/razorpay`, `POST /api/webhooks/stripe`
- `GET|POST /api/cron/refresh-leaks` — simulated scan + tripwire dispatch

## Rules honoured

1. 100 % complete functional code — no TODO placeholders.
2. Razorpay default fallback is `https://razorpay.me/@likhiths`.
3. Every DB-backed function degrades to the offline catalog gracefully.
4. `typecheck` and `build` pass with zero errors, with or without Postgres.
