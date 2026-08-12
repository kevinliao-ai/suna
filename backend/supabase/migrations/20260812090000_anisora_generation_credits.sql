-- Subscription-backed generation credits. All mutations are performed by
-- service-role-only RPCs so concurrent serverless requests cannot overspend.

create table if not exists public.anisora_generation_credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null check (period_end > period_start),
  allowance integer not null check (allowance >= 0),
  available integer not null check (available >= 0),
  reserved integer not null check (reserved >= 0),
  spent integer not null check (spent >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (available + reserved + spent = allowance)
);

create table if not exists public.anisora_generation_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.anisora_tasks(id) on delete cascade,
  event_type text not null check (event_type in ('reserve', 'settle', 'release')),
  amount integer not null check (amount > 0),
  idempotency_key text not null unique check (char_length(idempotency_key) between 10 and 120),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists anisora_generation_credit_ledger_user_created_idx
  on public.anisora_generation_credit_ledger(user_id, created_at desc);
create index if not exists anisora_generation_credit_ledger_task_idx
  on public.anisora_generation_credit_ledger(task_id);

alter table public.anisora_generation_credit_accounts enable row level security;
alter table public.anisora_generation_credit_ledger enable row level security;

drop policy if exists "Users view their AniSora generation credit account"
  on public.anisora_generation_credit_accounts;
create policy "Users view their AniSora generation credit account"
on public.anisora_generation_credit_accounts
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users view their AniSora generation credit ledger"
  on public.anisora_generation_credit_ledger;
create policy "Users view their AniSora generation credit ledger"
on public.anisora_generation_credit_ledger
for select to authenticated
using ((select auth.uid()) = user_id);

grant select on public.anisora_generation_credit_accounts,
  public.anisora_generation_credit_ledger to authenticated;
grant select, insert, update, delete on public.anisora_generation_credit_accounts,
  public.anisora_generation_credit_ledger to service_role;
revoke all on public.anisora_generation_credit_accounts,
  public.anisora_generation_credit_ledger from anon;
revoke insert, update, delete on public.anisora_generation_credit_accounts,
  public.anisora_generation_credit_ledger from authenticated;

create or replace function public.ensure_anisora_generation_credits(
  p_user_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_allowance integer
)
returns table (
  allowance integer,
  available integer,
  reserved integer,
  spent integer,
  period_start timestamptz,
  period_end timestamptz
)
language plpgsql
set search_path = ''
as $$
begin
  if p_allowance < 0 or p_period_end <= p_period_start then
    raise exception 'Invalid AniSora credit period';
  end if;

  insert into public.anisora_generation_credit_accounts (
    user_id, period_start, period_end, allowance, available, reserved, spent
  ) values (
    p_user_id, p_period_start, p_period_end, p_allowance, p_allowance, 0, 0
  )
  on conflict (user_id) do update set
    period_start = excluded.period_start,
    period_end = excluded.period_end,
    allowance = case
      when public.anisora_generation_credit_accounts.period_start <> excluded.period_start
        or public.anisora_generation_credit_accounts.period_end <> excluded.period_end
      then greatest(excluded.allowance, public.anisora_generation_credit_accounts.reserved)
      else public.anisora_generation_credit_accounts.allowance end,
    available = case
      when public.anisora_generation_credit_accounts.period_start <> excluded.period_start
        or public.anisora_generation_credit_accounts.period_end <> excluded.period_end
      then greatest(0, excluded.allowance - public.anisora_generation_credit_accounts.reserved)
      else public.anisora_generation_credit_accounts.available
    end,
    reserved = case
      when public.anisora_generation_credit_accounts.period_start <> excluded.period_start
        or public.anisora_generation_credit_accounts.period_end <> excluded.period_end
      then public.anisora_generation_credit_accounts.reserved
      else public.anisora_generation_credit_accounts.reserved end,
    spent = case
      when public.anisora_generation_credit_accounts.period_start <> excluded.period_start
        or public.anisora_generation_credit_accounts.period_end <> excluded.period_end
      then 0
      else public.anisora_generation_credit_accounts.spent end,
    updated_at = now();

  return query
  select account.allowance, account.available, account.reserved, account.spent,
    account.period_start, account.period_end
  from public.anisora_generation_credit_accounts account
  where account.user_id = p_user_id;
end;
$$;

create or replace function public.reserve_anisora_generation_credits(
  p_user_id uuid,
  p_task_id uuid,
  p_amount integer
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  current_available integer;
begin
  if p_amount <= 0 then raise exception 'Credit reservation must be positive'; end if;
  if exists (
    select 1 from public.anisora_generation_credit_ledger
    where idempotency_key = 'reserve:' || p_task_id::text and user_id = p_user_id
  ) then return true; end if;
  if not exists (
    select 1 from public.anisora_tasks
    where id = p_task_id and user_id = p_user_id
  ) then raise exception 'Generation task ownership mismatch'; end if;

  select account.available into current_available
  from public.anisora_generation_credit_accounts account
  where account.user_id = p_user_id for update;
  if current_available is null or current_available < p_amount then return false; end if;

  update public.anisora_generation_credit_accounts
  set available = available - p_amount,
    reserved = reserved + p_amount,
    updated_at = now()
  where user_id = p_user_id;
  insert into public.anisora_generation_credit_ledger (
    user_id, task_id, event_type, amount, idempotency_key
  ) values (p_user_id, p_task_id, 'reserve', p_amount, 'reserve:' || p_task_id::text);
  return true;
end;
$$;

create or replace function public.settle_anisora_generation_credits(
  p_user_id uuid,
  p_task_id uuid
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  reserved_amount integer;
begin
  if exists (
    select 1 from public.anisora_generation_credit_ledger
    where idempotency_key = 'settle:' || p_task_id::text and user_id = p_user_id
  ) then return true; end if;
  if exists (
    select 1 from public.anisora_generation_credit_ledger
    where idempotency_key = 'release:' || p_task_id::text and user_id = p_user_id
  ) then return false; end if;

  select ledger.amount into reserved_amount
  from public.anisora_generation_credit_ledger ledger
  where ledger.idempotency_key = 'reserve:' || p_task_id::text
    and ledger.user_id = p_user_id;
  if reserved_amount is null then return false; end if;

  perform 1 from public.anisora_generation_credit_accounts
  where user_id = p_user_id for update;
  update public.anisora_generation_credit_accounts
  set reserved = reserved - reserved_amount,
    spent = spent + reserved_amount,
    updated_at = now()
  where user_id = p_user_id and reserved >= reserved_amount;
  if not found then raise exception 'Reserved credit balance is inconsistent'; end if;

  insert into public.anisora_generation_credit_ledger (
    user_id, task_id, event_type, amount, idempotency_key
  ) values (p_user_id, p_task_id, 'settle', reserved_amount, 'settle:' || p_task_id::text);
  return true;
end;
$$;

create or replace function public.release_anisora_generation_credits(
  p_user_id uuid,
  p_task_id uuid
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  reserved_amount integer;
begin
  if exists (
    select 1 from public.anisora_generation_credit_ledger
    where idempotency_key = 'release:' || p_task_id::text and user_id = p_user_id
  ) then return true; end if;
  if exists (
    select 1 from public.anisora_generation_credit_ledger
    where idempotency_key = 'settle:' || p_task_id::text and user_id = p_user_id
  ) then return false; end if;

  select ledger.amount into reserved_amount
  from public.anisora_generation_credit_ledger ledger
  where ledger.idempotency_key = 'reserve:' || p_task_id::text
    and ledger.user_id = p_user_id;
  if reserved_amount is null then return false; end if;

  perform 1 from public.anisora_generation_credit_accounts
  where user_id = p_user_id for update;
  update public.anisora_generation_credit_accounts
  set reserved = reserved - reserved_amount,
    available = available + reserved_amount,
    updated_at = now()
  where user_id = p_user_id and reserved >= reserved_amount;
  if not found then raise exception 'Reserved credit balance is inconsistent'; end if;

  insert into public.anisora_generation_credit_ledger (
    user_id, task_id, event_type, amount, idempotency_key
  ) values (p_user_id, p_task_id, 'release', reserved_amount, 'release:' || p_task_id::text);
  return true;
end;
$$;

revoke all on function public.ensure_anisora_generation_credits(uuid, timestamptz, timestamptz, integer)
  from public, anon, authenticated;
revoke all on function public.reserve_anisora_generation_credits(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.settle_anisora_generation_credits(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.release_anisora_generation_credits(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.ensure_anisora_generation_credits(uuid, timestamptz, timestamptz, integer)
  to service_role;
grant execute on function public.reserve_anisora_generation_credits(uuid, uuid, integer)
  to service_role;
grant execute on function public.settle_anisora_generation_credits(uuid, uuid)
  to service_role;
grant execute on function public.release_anisora_generation_credits(uuid, uuid)
  to service_role;
