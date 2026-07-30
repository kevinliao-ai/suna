# AniSora Studio data model

The current Studio MVP stores project names, tasks, and asset links in
user-scoped browser storage. It deliberately does not depend on the legacy Suna
agent, thread, or billing tables.

The additive migration at
`backend/supabase/migrations/20260729090000_anisora_studio.sql` defines the
server-backed model for the next rollout:

- `anisora_projects`: the user-owned creative workspace;
- `anisora_assets`: source, reference, and output links associated with a
  project;
- `anisora_tasks`: the lifecycle of a generation or manual project task.

All three tables use Supabase row-level security. A signed-in user can only
read or mutate rows owned by their `auth.uid()`. Asset and task policies also
verify ownership of the parent project.

## Current implementation

The frontend now includes a repository layer with these safeguards:

- browser storage remains the default and is always updated first;
- cloud synchronization is gated by
  `NEXT_PUBLIC_STUDIO_SYNC_ENABLED=true`;
- an existing browser workspace is never uploaded automatically when the
  cloud workspace is empty;
- the user must select **Import local projects to cloud** before that first
  upload;
- failed cloud reads or writes leave the browser copy intact.

The feature flag must remain `false` until the migration is applied and
verified.

## Rollout order

1. Apply the migration in a non-production Supabase project.
2. Run the RLS verification queries below with two separate test users.
3. Enable synchronization only on a Vercel Preview deployment.
4. Test first-time cloud creation, explicit local import, updates, deletion,
   sign-out, and sign-in on a second browser.
5. Apply the migration to production during a low-traffic window.
6. Enable synchronization for internal accounts, then a small production
   cohort.
7. Add object storage and signed uploads only when real media persistence is
   required.

## RLS verification

For each table, confirm that an authenticated user can only select, insert,
update, and delete rows where `user_id = auth.uid()`. Also verify that a task
or asset cannot reference a project owned by a different user.

Keep the browser-local mode available as the operational fallback. Turning the
feature flag back to `false` immediately stops cloud reads and writes without
removing local data.
