# ☁️ CloudTrim AI

**FinOps cloud waste, zombie-resource & cost-leak radar.** Detects idle
compute, unattached EBS volumes, zombie NAT gateways, zero-connection RDS
replicas and friends — scores them 0–100 with the WasteScore formula, prices
the burn per hour, and hands you a copy-paste Terraform / CLI fix plus
Slack / Telegram / WhatsApp / email alerts.

## Quick start

```bash
npm install
npm run dev        # works with or without Postgres
```

With a database: put `DATABASE_URL` in `.env`, then

```bash
npx drizzle-kit push   # create the 9 tables
```

Without one, the console automatically serves the **verified 30-leak offline
catalog** from memory — no degraded UI, no build failures.

## Money path (QA)

- **Magic link sign-in**: `/login` → the response includes an instant QA
  link that logs you straight in (15-min single-use token, HMAC-signed
  `ct_session` cookie).
- **India checkout**: Razorpay hosted link (default
  `https://razorpay.me/@likhiths`).
- **Global checkout**: Stripe Checkout ($9/mo) when keys exist; simulated
  activation otherwise.
- **1-click VIP**: `POST /api/billing/sandbox-activate` (also in the pricing
  modal) — instant Club Pro for testers.

## Ops

- `GET /api/health` — DB connectivity, catalog count, uptime.
- `POST /api/cron/refresh-leaks` — simulated sweep; evaluates armed
  tripwires and dispatches latency-tracked alerts.
- Tripwires: `/watchlists` (authenticated) — provider/service/threshold/
  channel rules with pause & delete.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build (safe offline) |
| `npm run typecheck` | strict TS verification |
| `npx drizzle-kit push` | apply schema |

See `SPEC.md` for the full product specification and the WasteScore math.
