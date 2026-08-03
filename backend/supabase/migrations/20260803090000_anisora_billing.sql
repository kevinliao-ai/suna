-- AniSora-owned Stripe billing data. This migration is additive and does not
-- depend on the legacy Suna/Basejump account or billing schema.

create table if not exists public.anisora_billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique
    check (stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
  billing_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anisora_subscriptions (
  stripe_subscription_id text primary key
    check (stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_price_id text not null
    check (stripe_price_id ~ '^price_[A-Za-z0-9]+$'),
  plan_id text not null check (plan_id in ('studio-pro-monthly', 'studio-pro-annual')),
  status text not null check (
    status in (
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'incomplete',
      'incomplete_expired',
      'paused'
    )
  ),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anisora_stripe_events (
  stripe_event_id text primary key
    check (stripe_event_id ~ '^evt_[A-Za-z0-9]+$'),
  event_type text not null,
  object_id text,
  processed_at timestamptz not null default now()
);

create index if not exists anisora_subscriptions_user_period_idx
  on public.anisora_subscriptions(user_id, current_period_end desc nulls last);
create index if not exists anisora_subscriptions_customer_idx
  on public.anisora_subscriptions(stripe_customer_id);
create index if not exists anisora_stripe_events_processed_idx
  on public.anisora_stripe_events(processed_at desc);

create or replace function public.set_anisora_billing_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_anisora_billing_updated_at()
  from public, anon, authenticated;

drop trigger if exists anisora_billing_customers_set_updated_at
  on public.anisora_billing_customers;
create trigger anisora_billing_customers_set_updated_at
before update on public.anisora_billing_customers
for each row execute function public.set_anisora_billing_updated_at();

drop trigger if exists anisora_subscriptions_set_updated_at
  on public.anisora_subscriptions;
create trigger anisora_subscriptions_set_updated_at
before update on public.anisora_subscriptions
for each row execute function public.set_anisora_billing_updated_at();

alter table public.anisora_billing_customers enable row level security;
alter table public.anisora_subscriptions enable row level security;
alter table public.anisora_stripe_events enable row level security;

drop policy if exists "Users view their AniSora billing customer"
  on public.anisora_billing_customers;
create policy "Users view their AniSora billing customer"
on public.anisora_billing_customers
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users view their AniSora subscriptions"
  on public.anisora_subscriptions;
create policy "Users view their AniSora subscriptions"
on public.anisora_subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

grant select on public.anisora_billing_customers, public.anisora_subscriptions
  to authenticated;
grant select, insert, update, delete on
  public.anisora_billing_customers,
  public.anisora_subscriptions,
  public.anisora_stripe_events
  to service_role;

revoke all on
  public.anisora_billing_customers,
  public.anisora_subscriptions,
  public.anisora_stripe_events
  from anon;
revoke insert, update, delete on
  public.anisora_billing_customers,
  public.anisora_subscriptions
  from authenticated;
revoke all on public.anisora_stripe_events from authenticated;
