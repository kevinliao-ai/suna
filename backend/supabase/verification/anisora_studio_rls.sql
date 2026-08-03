-- Run only in a disposable/non-production Supabase project after applying
-- 20260729090000_anisora_studio.sql.
--
-- Replace the UUIDs below with two distinct test users that already exist in
-- auth.users. The transaction always rolls back the test rows.

begin;

do $$
declare
  user_a constant uuid := '00000000-0000-0000-0000-000000000001';
  user_b constant uuid := '00000000-0000-0000-0000-000000000002';
begin
  if user_a = user_b then
    raise exception 'AniSora RLS verification requires two distinct users';
  end if;

  if not exists (select 1 from auth.users where id = user_a)
    or not exists (select 1 from auth.users where id = user_b) then
    raise exception
      'Replace the placeholder UUIDs with two existing non-production users';
  end if;

  perform set_config('anisora.test_user_a', user_a::text, true);
  perform set_config('anisora.test_user_b', user_b::text, true);
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  current_setting('anisora.test_user_a'),
  true
);

insert into public.anisora_projects (id, user_id, name)
values (
  '10000000-0000-0000-0000-000000000001',
  current_setting('anisora.test_user_a')::uuid,
  'RLS verification project'
);

insert into public.anisora_assets (
  id,
  project_id,
  user_id,
  name,
  url
)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  current_setting('anisora.test_user_a')::uuid,
  'RLS verification asset',
  'https://example.com/reference.png'
);

insert into public.anisora_tasks (
  id,
  project_id,
  user_id,
  title
)
values (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  current_setting('anisora.test_user_a')::uuid,
  'RLS verification task'
);

select set_config(
  'request.jwt.claim.sub',
  current_setting('anisora.test_user_b'),
  true
);

do $$
declare
  visible_count integer;
  affected_count integer;
  cross_project_insert_blocked boolean := false;
  cross_insert_blocked boolean := false;
  cross_task_insert_blocked boolean := false;
begin
  select count(*)
  into visible_count
  from public.anisora_projects
  where id = '10000000-0000-0000-0000-000000000001';

  if visible_count <> 0 then
    raise exception 'RLS failure: user B can read user A project';
  end if;

  update public.anisora_projects
  set name = 'Unauthorized update'
  where id = '10000000-0000-0000-0000-000000000001';
  get diagnostics affected_count = row_count;

  if affected_count <> 0 then
    raise exception 'RLS failure: user B can update user A project';
  end if;

  delete from public.anisora_projects
  where id = '10000000-0000-0000-0000-000000000001';
  get diagnostics affected_count = row_count;

  if affected_count <> 0 then
    raise exception 'RLS failure: user B can delete user A project';
  end if;

  begin
    insert into public.anisora_projects (user_id, name)
    values (
      current_setting('anisora.test_user_a')::uuid,
      'Unauthorized project'
    );
  exception
    when insufficient_privilege then
      cross_project_insert_blocked := true;
  end;

  if not cross_project_insert_blocked then
    raise exception
      'RLS failure: user B can create a project owned by user A';
  end if;

  begin
    insert into public.anisora_assets (
      project_id,
      user_id,
      name,
      url
    )
    values (
      '10000000-0000-0000-0000-000000000001',
      current_setting('anisora.test_user_b')::uuid,
      'Unauthorized asset',
      'https://example.com/blocked.png'
    );
  exception
    when insufficient_privilege then
      cross_insert_blocked := true;
  end;

  if not cross_insert_blocked then
    raise exception
      'RLS failure: user B can add an asset to user A project';
  end if;

  begin
    insert into public.anisora_tasks (
      project_id,
      user_id,
      title
    )
    values (
      '10000000-0000-0000-0000-000000000001',
      current_setting('anisora.test_user_b')::uuid,
      'Unauthorized task'
    );
  exception
    when insufficient_privilege then
      cross_task_insert_blocked := true;
  end;

  if not cross_task_insert_blocked then
    raise exception
      'RLS failure: user B can add a task to user A project';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  current_setting('anisora.test_user_a'),
  true
);

do $$
begin
  if not exists (
    select 1
    from public.anisora_projects
    where id = '10000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'RLS failure: user A cannot read their project';
  end if;

  if not exists (
    select 1
    from public.anisora_assets
    where id = '20000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'RLS failure: user A cannot read their asset';
  end if;

  if not exists (
    select 1
    from public.anisora_tasks
    where id = '30000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'RLS failure: user A cannot read their task';
  end if;
end;
$$;

rollback;
