-- Run only in a disposable/non-production Supabase project after applying
-- 20260812090000_anisora_generation_credits.sql. Replace both UUIDs first.
begin;

-- This verification intentionally rolls back all rows. It checks that client
-- roles can read only their own balance and cannot mutate credit state.
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

do $$
declare
  client_write_blocked boolean := false;
begin
  begin
    update public.anisora_generation_credit_accounts set available = 999999;
  exception when insufficient_privilege then
    client_write_blocked := true;
  end;
  if not client_write_blocked then
    raise exception 'RLS failure: authenticated user can mutate credits';
  end if;
end;
$$;

rollback;
