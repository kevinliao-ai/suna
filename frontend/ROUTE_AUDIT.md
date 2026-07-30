# Frontend route audit

Baseline inventory:

- 43 page routes
- 8 route handlers
- 696 source files
- 165 production dependencies
- 19 development dependencies

This is substantially larger than the current AniSora product surface.

## Retain for the first migration

- `/`
- `/auth` and the Supabase callback/reset flows required by production
- `/dashboard`
- `/index-tts`
- `/sora-watermark-remove`
- `/legal`

## Candidate for removal

These routes belong to the inherited Suna agent platform and should be removed
after the retained routes pass a Vercel Preview acceptance test:

- `/agents/**`
- `/projects/**`
- `/tasks`
- `/composio-test`
- `/model-pricing`
- `/settings/api-keys`
- `/settings/credentials`
- team-account settings and invitations
- agent webhooks, triggers, template sharing and document export handlers

## Product decision required

These routes may be useful later but should not remain simply because they came
from Suna:

- `/subscription`
- personal billing and transaction history
- `/enterprise`
- `/changelog`
- `/docs/**`

## Removal gate

Before deleting a route group:

1. Trace imports reachable from the retained routes.
2. Confirm no Supabase callback, database function or Vercel rewrite depends on it.
3. Run lint, TypeScript and the production build.
4. Verify login, logout, both embedded tools and mobile navigation in Preview.
