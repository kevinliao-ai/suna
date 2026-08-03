-- Run only in a disposable/non-production Supabase project after applying
-- 20260803090000_anisora_billing.sql.
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
    raise exception 'AniSora billing RLS verification requires two users';
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

set local role service_role;

insert into public.anisora_billing_customers (
  user_id,
  stripe_customer_id,
  billing_email
)
values (
  current_setting('anisora.test_user_a')::uuid,
  'cus_anisora_rls_a',
  'billing-a@anisora.invalid'
);

insert into public.anisora_subscriptions (
  stripe_subscription_id,
  user_id,
  stripe_customer_id,
  stripe_price_id,
  plan_id,
  status,
  currency,
  current_period_start,
  current_period_end
)
values (
  'sub_anisora_rls_a',
  current_setting('anisora.test_user_a')::uuid,
  'cus_anisora_rls_a',
  'price_anisora_rls_monthly',
  'studio-pro-monthly',
  'active',
  'usd',
  now(),
  now() + interval '1 month'
);

insert into public.anisora_stripe_events (
  stripe_event_id,
  event_type,
  object_id
)
values ('evt_anisora_rls_a', 'customer.subscription.created', 'sub_anisora_rls_a');

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  current_setting('anisora.test_user_a'),
  true
);

do $$
declare
  visible_count integer;
  client_write_blocked boolean := false;
begin
  select count(*) into visible_count
  from public.anisora_subscriptions
  where stripe_subscription_id = 'sub_anisora_rls_a';
  if visible_count <> 1 then
    raise exception 'RLS failure: user A cannot read their subscription';
  end if;

  begin
    update public.anisora_subscriptions
    set status = 'canceled'
    where stripe_subscription_id = 'sub_anisora_rls_a';
  exception
    when insufficient_privilege then
      client_write_blocked := true;
  end;
  if not client_write_blocked then
    raise exception 'RLS failure: authenticated user can write billing state';
  end if;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  current_setting('anisora.test_user_b'),
  true
);

do $$
declare
  visible_count integer;
  event_read_blocked boolean := false;
begin
  select count(*) into visible_count
  from public.anisora_subscriptions
  where stripe_subscription_id = 'sub_anisora_rls_a';
  if visible_count <> 0 then
    raise exception 'RLS failure: user B can read user A subscription';
  end if;

  begin
    perform stripe_event_id from public.anisora_stripe_events limit 1;
  exception
    when insufficient_privilege then
      event_read_blocked := true;
  end;
  if not event_read_blocked then
    raise exception 'RLS failure: authenticated user can read Stripe events';
  end if;
end;
$$;

rollback;
