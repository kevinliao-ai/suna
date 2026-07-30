# AniSora deployment runbook

Environment audit date: 2026-07-30.

This document contains configuration names and project identifiers only. It
must not contain API keys, tokens, database passwords, or revealed environment
variable values.

## Current topology

- GitHub repository: `kevinliao-ai/suna`
- development branch: `dev`
- Vercel project: `anisora`
- Vercel root directory: `frontend`
- Vercel runtime: Node.js 22
- Vercel production branch: `master`
- production domain: `www.anisora.ai`
- Supabase project reference: `izdknrhlgosfqyowjkfb`
- Supabase region: Singapore (`ap-southeast-1`)
- Cloudflare zone: `anisora.ai`

Every unassigned Git branch is mapped to the Vercel Preview environment.
Merging to `dev` does not update production. Production changes require a
reviewed merge or promotion to `master`.

Vercel currently reports 19k Speed Insights data points against the free
10k allowance. Keep Speed Insights disabled on non-production deployments or
upgrade the plan if that telemetry is still required.

## Verified Vercel variables

The project currently contains these relevant variables for all environments:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Legacy variables still present in Vercel include
`NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET`. The current
frontend does not require the legacy backend or direct GitHub OAuth secrets.
Remove them only after a Preview deployment proves that no remaining route
depends on them.

`GITHUB_CLIENT_SECRET` is currently flagged by Vercel as a secret that should
be stored as Sensitive. It should be rotated if it has ever been exposed
outside Vercel.

## Supabase authentication

Enabled providers:

- Email with confirmation
- Google
- GitHub

Current Site URL:

`https://www.anisora.ai`

Current redirect allow list:

- `https://www.anisora.ai/auth/callback`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/auth/github-popup`

Before testing OAuth on a Vercel Preview deployment, add that deployment's
exact `/auth/callback` URL. Avoid a broad `https://*.vercel.app/**` wildcard.

Supabase currently reports that email OTP expiry exceeds the recommended
one-hour threshold. Reduce it to 3600 seconds or less before production
hardening.

The production database currently has no migration history, database branch,
or visible scheduled backup. Apply the additive AniSora migration only after a
restorable backup or a verified non-production rehearsal exists.

## Cloudflare

Current routing:

- apex `A` → `76.76.21.21`, proxied
- `www` `CNAME` → `cname.vercel-dns.com`, proxied
- `cdn` is backed by the `anisora-cdn` R2 bucket
- `api-production` points to Railway

Vercel reports `Proxy Detected` for both apex and `www`, which is expected
because Cloudflare proxying is enabled. Verify certificate renewal after any
DNS proxy change.

Current TLS posture:

- encryption mode: Full, not Full (strict)
- Universal SSL certificate: active
- Always Use HTTPS: off
- minimum TLS version: TLS 1.0
- TLS 1.3: on
- Automatic HTTPS Rewrites: on
- no Cache Rules configured

Observed request behavior:

- `http://anisora.ai` returns a permanent HTTPS redirect;
- `https://anisora.ai` redirects to `https://www.anisora.ai`;
- the Vercel origin currently supplies a two-year HSTS response header even
  though Cloudflare's zone-level HSTS control is not enabled.

Recommended order:

1. Verify the Vercel origin certificate and switch to Full (strict).
2. Keep the existing HTTP redirect behavior; enabling Cloudflare's duplicate
   Always Use HTTPS rule is optional and must first be checked for loops.
3. Raise minimum TLS to 1.2.
4. Add HSTS only after the strict HTTPS configuration has been stable.
5. Keep authenticated and API routes uncached. Cache only immutable Next.js
   assets and explicitly public media.

The zone also contains four legacy Porkbun NS records at the apex. They do not
control registrar delegation from inside the Cloudflare zone and should be
reviewed before removal.

SPF and DMARC records are not configured. Add them if `@anisora.ai` sends
email.

## Preview release sequence

1. Push `codex/anisora-web-v2`.
2. Open a Draft PR targeting `dev`.
3. Wait for GitHub CI and Vercel Preview.
4. Add only the exact Preview OAuth callback URL in Supabase.
5. Test Email, Google, and GitHub sign-in.
6. Test project, task, asset, and external-tool workflows.
7. Keep `NEXT_PUBLIC_STUDIO_SYNC_ENABLED=false` until the database migration
   has been rehearsed.
8. Merge to `dev` after approval.
9. Promote to `master` only after a production checklist review.
