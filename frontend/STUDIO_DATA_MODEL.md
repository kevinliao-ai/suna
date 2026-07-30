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

## Rollout order

1. Review and apply the migration in a non-production Supabase project.
2. Generate typed Supabase database definitions for the frontend.
3. Add a repository layer with local-first optimistic updates.
4. Import existing browser projects only after explicit user confirmation.
5. Enable synchronization for internal accounts, then a small production
   cohort.
6. Add object storage and signed uploads only when real media persistence is
   required.

Do not enable database synchronization merely by adding the migration. The
browser-local MVP remains the safe default until the repository and import
flow are shipped and tested.
