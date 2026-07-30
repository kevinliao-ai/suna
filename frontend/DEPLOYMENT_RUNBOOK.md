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
- `https://anisora-git-codex-anisora-web-v2-kevinliao-ais-projects.vercel.app/auth/callback`
- `https://anisora-git-codex-anisora-web-v2-kevinliao-ais-projects.vercel.app/auth/recovery/callback`

The frontend routes Google, GitHub, and email confirmation through the exact
`/auth/callback` handler. Internal return paths are kept in a short-lived,
same-site cookie so query parameters do not broaden the Supabase allow list.
Password recovery uses the separate exact `/auth/recovery/callback` handler.
The local `/auth/github-popup` entry is legacy and can be removed after
returning-user OAuth tests pass.

GitHub and Google returning-user OAuth have now passed end to end on the listed
Preview: the user returned to `/dashboard`, the session survived refresh, and
an authenticated visit to `/auth` was redirected back to the workspace.
Signing out and returning through Google preserved that user's local Studio
workspace. New-email confirmation and password recovery remain separate
acceptance tests.

Before testing OAuth or recovery on a Vercel Preview deployment, add that
deployment's exact `/auth/callback` and `/auth/recovery/callback` URLs. Avoid a
broad `https://*.vercel.app/**` wildcard.

Supabase currently reports that email OTP expiry exceeds the recommended
one-hour threshold. Reduce it to 3600 seconds or less before production
hardening.

The production database currently has no migration history, database branch,
or visible scheduled backup. Apply the additive AniSora migration only after a
restorable backup or a verified non-production rehearsal exists.

The Auth project currently contains approximately 7,000 users from the
existing product. Treat authentication and schema changes as a live production
migration: do not delete or rewrite legacy users, preserve current provider
compatibility, and test returning-user login as well as new-user signup before
promotion.

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

### Railway audit

Railway was inspected read-only on 2026-07-30. The workspace trial has
expired. Its three projects contain five services in total, and all services
are offline.

- `trustworthy-amazement` retains an offline `suna` service connected to
  `kevinliao-ai/suna`, a second offline service, and Redis.
- The offline `suna` service still declares `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Variable values were
  not opened or copied.
- `friendly-flow` and `vivacious-integrity` each show a staged removal of a
  `suna` service. The staged destructive changes were not applied.
- `https://api-production.anisora.ai/` currently reaches Railway's fallback
  edge and returns HTTP 404; it is not an active application API.

The retained Railway variable means the old service-role credential still has
at least one historical server consumer in addition to the unsafe Cloudflare
Pages copy. Because the service is offline, it does not block the current
frontend, but its configuration should be preserved until the credential is
rotated. Do not redeploy the legacy service.

### Legacy Cloudflare Pages project

Cloudflare Pages also has an `anisora` project connected to the same GitHub
repository. Its production branch is `master`, automatic deployment is
enabled, and every watched path can trigger a second build in addition to
Vercel.

The Pages project is not a valid fallback for the current application:

- it sets `NEXT_OUTPUT=export`;
- its configured build output is `.next/static`, not the Next.js export
  directory;
- a successful Preview build currently returns HTTP 404 at its public
  `pages.dev` URL;
- production has no successful Pages deployment.

Treat Vercel as the only application host. After preserving any required build
logs, disconnect or delete the legacy Pages project so pull requests do not
produce misleading green deployment checks and public 404 Preview URLs.

The Pages project also contains `SUPABASE_SERVICE_ROLE_KEY` as a plaintext
production build variable. The frontend does not reference that variable, and
a browser-facing build must never receive it. Before removing it, audit the
Railway backend and any other server deployment for the same credential. Then:

1. create or rotate the server-only Supabase credential;
2. update every confirmed server-side consumer;
3. verify those services;
4. remove the variable from Cloudflare Pages;
5. revoke the old credential.

Never copy the value into Vercel frontend variables, source control, logs, or
client-side code.

## Preview release sequence

The detailed sign-off and rollback gates are tracked in
`PRODUCTION_RELEASE_CHECKLIST.md`.

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
