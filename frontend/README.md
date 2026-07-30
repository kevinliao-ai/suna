# AniSora Web

AniSora Web is the first-party product shell for
[anisora.ai](https://www.anisora.ai). It provides authentication, marketing
pages, a local-first Studio workspace, and allow-listed adapters for the
existing anime video and voice tools.

The retained frontend does not run the upstream Suna general agent. Do not add
Suna agent, billing, thread, template, or legacy backend routes unless a new
AniSora product requirement explicitly needs them.

## Stack

- Next.js 16 and React 19
- Supabase Auth
- optional Supabase Studio metadata sync
- Vercel hosting
- Cloudflare DNS and edge proxy
- Tailwind CSS 4

## Local setup

Use Node.js 22 to match Vercel.

```bash
npm install
npm run dev
```

Copy the required public variables into `.env.local`; never commit that file.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STUDIO_SYNC_ENABLED=false
```

`NEXT_PUBLIC_STUDIO_SYNC_ENABLED` must remain `false` until the additive
Supabase migration and RLS verification have passed in a non-production
project.

## Quality gate

```bash
npm run check
```

This runs the Node test suite, ESLint, TypeScript, and the production build.

## Product boundaries

- Studio projects, tasks, and asset links are stored per user in browser local
  storage by default.
- Users can download and restore a versioned JSON workspace backup while cloud
  sync is disabled.
- Video and voice generation run in embedded third-party tools. Their prompts
  and media are processed by those providers, not by the Studio metadata
  layer.
- Google, GitHub, email confirmation, and password recovery use exact
  allow-listed Supabase callback URLs.
- The public Sora resolver accepts only official HTTPS share hosts.
- Supabase service-role credentials are server-only and must never be added to
  this frontend environment.

## Release documentation

- [Deployment runbook](./DEPLOYMENT_RUNBOOK.md)
- [Production release checklist](./PRODUCTION_RELEASE_CHECKLIST.md)
- [Route audit](./ROUTE_AUDIT.md)
