import Stripe from 'stripe';
import {
  createClient as createSupabaseAdminClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { getBillingPlan, type BillingPlanId } from './plans';
import {
  isKnownSubscriptionStatus,
  resolveBillingEntitlement,
  type BillingSubscriptionRecord,
} from './model';
import type { BillingDatabase } from './database';

let stripeClient: Stripe | null = null;
let billingAdminClient: SupabaseClient<BillingDatabase> | null = null;

export class BillingConfigurationError extends Error {}

function requiredEnvironment(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new BillingConfigurationError(`${names.join(' or ')} is not configured.`);
}

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(requiredEnvironment('STRIPE_SECRET_KEY'));
  }
  return stripeClient;
}

export function getBillingAdminClient() {
  if (!billingAdminClient) {
    billingAdminClient = createSupabaseAdminClient<BillingDatabase>(
      requiredEnvironment('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnvironment('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );
  }
  return billingAdminClient;
}

export function getConfiguredPrice(planId: string) {
  const plan = getBillingPlan(planId);
  if (!plan) return null;

  const priceId = requiredEnvironment(plan.priceEnv);
  if (!/^price_[A-Za-z0-9]+$/.test(priceId)) {
    throw new BillingConfigurationError(`${plan.priceEnv} is invalid.`);
  }

  return { plan, priceId };
}

export async function getAuthenticatedBillingUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getOrCreateStripeCustomer(user: {
  id: string;
  email?: string | null;
}) {
  const admin = getBillingAdminClient();
  const { data: existing, error: readError } = await admin
    .from('anisora_billing_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (readError) throw readError;
  if (existing?.stripe_customer_id) return existing.stripe_customer_id;

  const customer = await getStripeClient().customers.create(
    {
      email: user.email || undefined,
      metadata: { anisora_user_id: user.id },
    },
    { idempotencyKey: `anisora-customer-${user.id}` },
  );

  const { error: upsertError } = await admin
    .from('anisora_billing_customers')
    .upsert(
      {
        user_id: user.id,
        stripe_customer_id: customer.id,
        billing_email: user.email || null,
      },
      { onConflict: 'user_id' },
    );
  if (upsertError) throw upsertError;

  return customer.id;
}

function stripeObjectId(value: string | { id: string } | null) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function stripeTimestamp(value: number | null | undefined) {
  return typeof value === 'number'
    ? new Date(value * 1000).toISOString()
    : null;
}

export async function resolveUserIdForStripeCustomer(
  customerId: string,
  metadataUserId?: string | null,
) {
  if (metadataUserId) return metadataUserId;

  const { data, error } = await getBillingAdminClient()
    .from('anisora_billing_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

export async function upsertStripeSubscription(
  subscription: Stripe.Subscription,
  metadataUserId?: string | null,
  stripeEventCreated = 0,
) {
  const customerId = stripeObjectId(subscription.customer);
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const planId = subscription.metadata.anisora_plan_id;
  if (!customerId || !priceId || !planId || !getBillingPlan(planId)) {
    throw new Error('Stripe subscription is missing AniSora billing metadata.');
  }
  if (!isKnownSubscriptionStatus(subscription.status)) {
    throw new Error(
      `Unsupported Stripe subscription status: ${subscription.status}`,
    );
  }

  const userId = await resolveUserIdForStripeCustomer(
    customerId,
    metadataUserId || subscription.metadata.anisora_user_id,
  );
  if (!userId) {
    throw new Error('Stripe customer is not linked to an AniSora user.');
  }

  const admin = getBillingAdminClient();
  const { error: customerError } = await admin
    .from('anisora_billing_customers')
    .upsert(
      { user_id: userId, stripe_customer_id: customerId },
      { onConflict: 'user_id' },
    );
  if (customerError) throw customerError;

  const { data: applied, error } = await admin.rpc(
    'upsert_anisora_subscription',
    {
      p_stripe_subscription_id: subscription.id,
      p_user_id: userId,
      p_stripe_customer_id: customerId,
      p_stripe_price_id: priceId,
      p_plan_id: planId as BillingPlanId,
      p_status: subscription.status,
      p_currency: subscription.currency,
      p_cancel_at_period_end: subscription.cancel_at_period_end,
      p_current_period_start: stripeTimestamp(item?.current_period_start),
      p_current_period_end: stripeTimestamp(item?.current_period_end),
      p_cancel_at: stripeTimestamp(subscription.cancel_at),
      p_canceled_at: stripeTimestamp(subscription.canceled_at),
      p_metadata: subscription.metadata,
      p_stripe_event_created: stripeEventCreated,
    },
  );
  if (error) throw error;
  return applied;
}

export async function getUserBillingEntitlement(userId: string) {
  const { data, error } = await getBillingAdminClient()
    .from('anisora_subscriptions')
    .select(
      'stripe_subscription_id,user_id,stripe_customer_id,stripe_price_id,plan_id,status,currency,cancel_at_period_end,current_period_start,current_period_end,cancel_at,canceled_at,updated_at',
    )
    .eq('user_id', userId)
    .order('current_period_end', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  return resolveBillingEntitlement(data as BillingSubscriptionRecord | null);
}
