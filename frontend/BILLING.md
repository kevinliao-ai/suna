# AniSora billing

AniSora billing is a first-party Stripe Checkout integration for the Studio
workspace. It is independent of the removed Suna frontend and the legacy
Basejump billing schema.

## Product boundary

Studio Pro pays for AniSora-owned cloud workspace features. It does not sell
or imply third-party generation credits, uptime, or provider access. Keep that
boundary visible on the pricing, checkout, legal, and account surfaces.

The initial public plan catalogue is defined in `src/lib/billing/plans.ts`:

- `studio-pro-monthly`: USD 5.99 per month;
- `studio-pro-annual`: USD 59 per year.

The browser sends only one of these internal plan IDs. The server maps it to a
Stripe Price ID from the deployment environment and never accepts a client-
supplied `price_*` value.

## Environment

Configure these values separately for local development, Vercel Preview, and
Vercel Production. Never prefix a secret with `NEXT_PUBLIC_`.

```dotenv
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STUDIO_PRO_MONTHLY_PRICE_ID=
STRIPE_STUDIO_PRO_ANNUAL_PRICE_ID=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STUDIO_PRO_GATE_ENABLED=false
```

Use only Stripe test-mode objects in Preview. Keep
`NEXT_PUBLIC_STUDIO_PRO_GATE_ENABLED=false` until the billing migration,
webhook, Checkout, portal, renewal, payment-failure, and cancellation paths
have all passed in staging.

## Database

Apply `backend/supabase/migrations/20260803090000_anisora_billing.sql` only to
the matching environment. It creates:

- `anisora_billing_customers`: Supabase user to Stripe customer mapping;
- `anisora_subscriptions`: server-owned subscription state;
- `anisora_stripe_events`: processed-event ledger for webhook idempotency.

Authenticated users can read only their customer/subscription rows and cannot
write them. Only `service_role` can write billing state. Stripe event payloads
are not exposed to client roles.

Run `backend/supabase/verification/anisora_billing_rls.sql` with two staging-
only users after the migration. The transaction checks cross-user reads,
client writes, and Stripe event access, then rolls back.

## Server routes

- `POST /api/billing/checkout`: authenticated, allow-listed plan to Checkout;
- `POST /api/billing/portal`: authenticated Customer Portal session;
- `GET /api/billing/status`: current server-derived entitlement;
- `POST /api/stripe/webhook`: raw-body signature verification and state sync.

Configure the Stripe endpoint to send only:

- `checkout.session.completed`;
- `customer.subscription.created`;
- `customer.subscription.updated`;
- `customer.subscription.deleted`;
- `invoice.paid`;
- `invoice.payment_failed`.

The Checkout success URL never grants Pro access. The webhook updates the
subscription record, and the dashboard briefly polls the server-derived
entitlement after returning from Checkout.

## Entitlement rules

- `active` and `trialing`: Pro;
- `past_due`: Pro for at most three days after the recorded period end;
- canceled with paid time remaining: Pro until the recorded period end;
- `unpaid`, `incomplete`, `incomplete_expired`, `paused`, or expired: Free.

Disabling the Pro gate preserves the existing local-first and staging sync
behaviour. Downgrading must never delete cloud project data.

## Release gate

Before live mode:

1. Complete Stripe business and payout verification.
2. Confirm the seller identity, support email, refund policy, and tax advice.
3. Test all routes with Stripe test keys and signed webhook events.
4. Verify monthly and annual Checkout, portal cancellation, renewal, failed
   payment, duplicate events, and out-of-order delivery.
5. Apply and verify the billing migration in production during a controlled
   release.
6. Add live keys and Price IDs only to Vercel Production.
7. Perform one authorized internal low-value live purchase and refund.
8. Enable the Pro gate only after the live webhook has persisted the expected
   entitlement.
