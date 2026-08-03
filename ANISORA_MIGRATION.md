# AniSora frontend migration

This branch isolates the current production-facing frontend from the inherited
Suna agent platform. The original `dev` working tree remains unchanged.

## Current production path

1. Cloudflare provides DNS and proxying.
2. Vercel hosts the Next.js frontend.
3. Supabase provides authentication.
4. `/dashboard` embeds the AniSora and Index-TTS external applications.

The inherited agent backend, SDK, sandbox, project threads, agent configuration,
Composio, team billing, and API key screens are not part of the current product.

## Migration rules

- Keep the existing homepage, authentication and dashboard working while the
  frontend is extracted.
- Do not merge the current upstream Suna code into this product.
- Remove unused routes and dependencies only after a successful baseline build
  and an import/reachability audit.
- Keep third-party embed hosts allowlisted.
- Never commit long-lived access tokens. Public iframe URLs are observable by
  every browser user, even when configured through `NEXT_PUBLIC_*` variables.
- Make production changes only after a Vercel Preview has passed the acceptance
  checklist.

## Milestones

1. Establish a reproducible build and remove exposed embed parameters.
2. Classify routes as retain, replace or delete.
3. Extract a minimal standalone Next.js application.
4. Add tests, CI, security headers and preview deployment.
5. Replace iframe integrations incrementally with server-side provider adapters.
