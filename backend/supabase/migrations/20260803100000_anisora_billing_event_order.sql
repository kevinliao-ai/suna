-- Prevent out-of-order Stripe webhooks from overwriting newer subscription
-- state. The database performs the comparison atomically so concurrent
-- serverless webhook deliveries cannot race an older event over a newer one.

alter table public.anisora_subscriptions
  add column if not exists last_stripe_event_created bigint not null default 0
  check (last_stripe_event_created >= 0);

create or replace function public.upsert_anisora_subscription(
  p_stripe_subscription_id text,
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_price_id text,
  p_plan_id text,
  p_status text,
  p_currency text,
  p_cancel_at_period_end boolean,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_canceled_at timestamptz,
  p_metadata jsonb,
  p_stripe_event_created bigint
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  applied boolean;
begin
  insert into public.anisora_subscriptions (
    stripe_subscription_id,
    user_id,
    stripe_customer_id,
    stripe_price_id,
    plan_id,
    status,
    currency,
    cancel_at_period_end,
    current_period_start,
    current_period_end,
    canceled_at,
    metadata,
    last_stripe_event_created
  ) values (
    p_stripe_subscription_id,
    p_user_id,
    p_stripe_customer_id,
    p_stripe_price_id,
    p_plan_id,
    p_status,
    p_currency,
    p_cancel_at_period_end,
    p_current_period_start,
    p_current_period_end,
    p_canceled_at,
    coalesce(p_metadata, '{}'::jsonb),
    p_stripe_event_created
  )
  on conflict (stripe_subscription_id) do update set
    user_id = excluded.user_id,
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_price_id = excluded.stripe_price_id,
    plan_id = excluded.plan_id,
    status = excluded.status,
    currency = excluded.currency,
    cancel_at_period_end = excluded.cancel_at_period_end,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    canceled_at = excluded.canceled_at,
    metadata = excluded.metadata,
    last_stripe_event_created = excluded.last_stripe_event_created
  where public.anisora_subscriptions.last_stripe_event_created
    <= excluded.last_stripe_event_created
  returning true into applied;

  return coalesce(applied, false);
end;
$$;

revoke all on function public.upsert_anisora_subscription(
  text, uuid, text, text, text, text, text, boolean,
  timestamptz, timestamptz, timestamptz, jsonb, bigint
) from public, anon, authenticated;

grant execute on function public.upsert_anisora_subscription(
  text, uuid, text, text, text, text, text, boolean,
  timestamptz, timestamptz, timestamptz, jsonb, bigint
) to service_role;
