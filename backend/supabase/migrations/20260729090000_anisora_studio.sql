-- AniSora-owned product data. This migration is additive and does not depend
-- on the legacy Suna agent tables.

create extension if not exists pgcrypto;

create table if not exists public.anisora_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  active_tool text not null default 'anisora'
    check (active_tool in ('anisora', 'index-tts')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anisora_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.anisora_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 180),
  url text not null check (
    char_length(url) between 8 and 2048
    and url ~ '^https?://'
  ),
  kind text not null default 'reference'
    check (kind in ('reference', 'source', 'output')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anisora_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.anisora_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  status text not null default 'todo'
    check (status in ('todo', 'running', 'done', 'failed')),
  provider text,
  provider_job_id text,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists anisora_projects_user_updated_idx
  on public.anisora_projects(user_id, updated_at desc);
create index if not exists anisora_assets_project_created_idx
  on public.anisora_assets(project_id, created_at desc);
create index if not exists anisora_tasks_project_created_idx
  on public.anisora_tasks(project_id, created_at desc);

create or replace function public.set_anisora_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists anisora_projects_set_updated_at
  on public.anisora_projects;
create trigger anisora_projects_set_updated_at
before update on public.anisora_projects
for each row execute function public.set_anisora_updated_at();

drop trigger if exists anisora_assets_set_updated_at
  on public.anisora_assets;
create trigger anisora_assets_set_updated_at
before update on public.anisora_assets
for each row execute function public.set_anisora_updated_at();

drop trigger if exists anisora_tasks_set_updated_at
  on public.anisora_tasks;
create trigger anisora_tasks_set_updated_at
before update on public.anisora_tasks
for each row execute function public.set_anisora_updated_at();

alter table public.anisora_projects enable row level security;
alter table public.anisora_assets enable row level security;
alter table public.anisora_tasks enable row level security;

drop policy if exists "Users manage their AniSora projects"
  on public.anisora_projects;
create policy "Users manage their AniSora projects"
on public.anisora_projects
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their AniSora assets"
  on public.anisora_assets;
create policy "Users manage their AniSora assets"
on public.anisora_assets
for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.anisora_projects project
    where project.id = project_id
      and project.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.anisora_projects project
    where project.id = project_id
      and project.user_id = (select auth.uid())
  )
);

drop policy if exists "Users manage their AniSora tasks"
  on public.anisora_tasks;
create policy "Users manage their AniSora tasks"
on public.anisora_tasks
for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.anisora_projects project
    where project.id = project_id
      and project.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.anisora_projects project
    where project.id = project_id
      and project.user_id = (select auth.uid())
  )
);

grant select, insert, update, delete
  on public.anisora_projects, public.anisora_assets, public.anisora_tasks
  to authenticated;

revoke all
  on public.anisora_projects, public.anisora_assets, public.anisora_tasks
  from anon;
