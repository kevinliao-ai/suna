-- Emergency rollback for 20260729090000_anisora_studio.sql.
--
-- This script intentionally refuses to run after users have created Studio
-- data. Export and validate a backup before designing a data-bearing rollback.

begin;

do $$
begin
  if exists (select 1 from public.anisora_projects limit 1)
    or exists (select 1 from public.anisora_assets limit 1)
    or exists (select 1 from public.anisora_tasks limit 1) then
    raise exception
      'Rollback refused: AniSora Studio tables contain data';
  end if;
end;
$$;

drop table if exists public.anisora_tasks;
drop table if exists public.anisora_assets;
drop table if exists public.anisora_projects;
drop function if exists public.set_anisora_updated_at();

commit;
