# AniSora production release checklist

Use this checklist to promote the Studio foundation from the Draft PR to
`dev`, and later from `master` to `www.anisora.ai`. A green build alone is not
production approval.

## 1. Pull request gate

- [ ] The PR targets `dev` and remains Draft until Preview acceptance is
      complete.
- [ ] `npm run check` passes from a clean install.
- [ ] GitHub `verify` and Vercel Preview checks pass for the current head SHA.
- [ ] The worktree contains no `.env`, credentials, tokens, database exports,
      or generated build output.
- [ ] A reviewer confirms the large upstream-code deletion is intentional.

## 2. Preview authentication

- [ ] Supabase contains only the exact Preview
      `https://<branch>.vercel.app/auth/callback` and
      `https://<branch>.vercel.app/auth/recovery/callback` redirects, not a
      broad wildcard.
- [ ] A returning Google user reaches `/dashboard`.
- [ ] A returning GitHub user reaches `/dashboard`.
- [ ] A new email user receives a confirmation link and returns through
      `/auth/callback`.
- [ ] Password recovery exchanges the callback code, allows one password
      update, and signs out existing sessions.
- [ ] `returnUrl=//external.example` and backslash variants resolve to
      `/dashboard`.
- [ ] Signing out does not delete the browser-local Studio workspace.

## 3. Studio local-mode acceptance

- [ ] `NEXT_PUBLIC_STUDIO_SYNC_ENABLED` is absent or `false`.
- [ ] Create, rename, switch, and delete projects.
- [ ] Add, complete, and remove tasks.
- [ ] Add and remove HTTP/HTTPS asset links; unsafe schemes are rejected.
- [ ] Switch between the AniSora and IndexTTS adapters.
- [ ] Switching adapters resets the loading state; a slow provider shows retry
      and open-in-new-tab fallbacks without losing Studio metadata.
- [ ] Refresh the page and confirm the user-scoped browser workspace restores.
- [ ] Sign in as another user and confirm workspaces do not cross.
- [ ] Rename a project and confirm the new name survives refresh.
- [ ] Download a JSON backup, restore it in local mode, and confirm malformed
      or oversized files are rejected without replacing the workspace.

## 4. Supabase cloud-sync gate

- [ ] A restorable production backup exists and its restore procedure has been
      rehearsed.
- [ ] The additive migration is first applied to a non-production project.
- [ ] `anisora_studio_rls.sql` passes with two distinct test users.
- [ ] Anonymous users have no table privileges.
- [ ] Cross-user project, asset, and task reads/writes are rejected.
- [ ] A stale second browser cannot delete rows it never previously synced.
- [ ] Explicit local import requires a user action and never runs on sign-in.
- [ ] The empty-schema rollback is tested before any Studio data is created.
- [ ] Cloud sync is enabled only on Preview for the first acceptance cycle.

## 5. Platform and secret gate

- [ ] Vercel is the sole application host.
- [ ] The legacy Cloudflare Pages project is disconnected or deleted after its
      settings and build logs are preserved.
- [ ] Every server consumer of the existing Supabase service-role credential
      is inventoried.
- [ ] Server consumers are updated before the old credential is revoked.
- [ ] No service-role credential exists in a frontend build environment.
- [ ] Cloudflare SSL is moved to Full (strict) only after origin certificate
      verification.
- [ ] Minimum TLS is raised to 1.2 and HTTP/apex redirects are rechecked.
- [ ] Production and Preview environment variables are reviewed separately.

## 6. Production promotion

- [ ] Merge to `dev` and complete a final Preview smoke test.
- [ ] Obtain explicit approval before merging or promoting to `master`.
- [ ] Record the approved commit SHA and Vercel deployment ID.
- [ ] Confirm `www.anisora.ai`, apex redirect, `/auth`, `/dashboard`, legal
      page, embedded tools, and the Sora resolver.
- [ ] Confirm CSP, frame protection, referrer policy, HSTS, and cache headers.
- [ ] Watch Vercel errors, Supabase Auth errors, and resolver 4xx/5xx rates.

## 7. Rollback

- [ ] Frontend rollback: promote the last known-good Vercel deployment.
- [ ] Cloud-sync rollback: set `NEXT_PUBLIC_STUDIO_SYNC_ENABLED=false` and
      redeploy; do not drop data-bearing tables.
- [ ] Authentication rollback: restore the previous deployment and keep the
      production callback URL valid.
- [ ] Database rollback: use the guarded empty-schema script only before user
      data exists; otherwise restore/migrate from the validated backup.
- [ ] Document the incident, affected SHA, timestamps, and user impact.
