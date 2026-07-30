# Frontend route audit

Audit refreshed: 2026-07-30.

## Current inventory

- 7 page files
- 2 route handlers
- 70 files under `src`
- no unused source files reported by Knip
- no unused or unlisted production dependencies reported by Knip

The retained product routes are:

- `/`
- `/auth`, `/auth/callback`, and `/auth/reset-password`
- `/dashboard`
- `/index-tts`
- `/sora-watermark-remove`
- `/legal`
- `/api/watermark/parse`
- the generated Open Graph image route

## Completed removal

The inherited Suna agent, project, task, billing, team, template, trigger,
webhook, document-export, enterprise, changelog, and documentation route groups
were removed from the AniSora frontend. The legacy GitHub popup callback was
also removed after Google and GitHub were unified on `/auth/callback`.

Knip reports a small set of unused named exports, primarily reusable methods
from the retained UI primitives. These are not unreachable files or runtime
dependencies and can be pruned opportunistically when the component API is
next revised.

## Verification gate

The current route surface is accepted only while all of the following remain
true:

1. `npm run test`, lint, type checking, and the production build pass.
2. Unauthenticated `/dashboard` requests redirect to `/auth`.
3. Google, GitHub, email confirmation, and recovery return through the
   allow-listed `/auth/callback`.
4. Both external tools remain constrained to their configured HTTPS hosts.
5. The public Sora resolver accepts only official HTTPS share URLs.
6. No removed Suna route is reintroduced merely to follow upstream.
