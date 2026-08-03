export const STRIPE_SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused',
] as const;

export type BillingSubscriptionStatus =
  (typeof STRIPE_SUBSCRIPTION_STATUSES)[number];

export interface BillingSubscriptionRecord {
  stripe_subscription_id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  plan_id: string;
  status: BillingSubscriptionStatus;
  currency: string;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  updated_at?: string | null;
}

export interface BillingEntitlement {
  tier: 'free' | 'pro';
  status: BillingSubscriptionStatus | 'none';
  planId: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  currentPeriodEnd: string | null;
  inGracePeriod: boolean;
}

const PAST_DUE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export function resolveBillingEntitlement(
  subscription: BillingSubscriptionRecord | null | undefined,
  now = new Date(),
): BillingEntitlement {
  if (!subscription) {
    return {
      tier: 'free',
      status: 'none',
      planId: null,
      cancelAtPeriodEnd: false,
      cancelAt: null,
      currentPeriodEnd: null,
      inGracePeriod: false,
    };
  }

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const periodEndTime = periodEnd?.getTime();
  const hasValidPeriodEnd =
    typeof periodEndTime === 'number' && Number.isFinite(periodEndTime);
  const isPaidStatus = ['active', 'trialing'].includes(subscription.status);
  const inGracePeriod =
    subscription.status === 'past_due' &&
    hasValidPeriodEnd &&
    now.getTime() <= periodEndTime + PAST_DUE_GRACE_MS;
  const canceledWithTimeRemaining =
    subscription.status === 'canceled' &&
    subscription.cancel_at_period_end &&
    hasValidPeriodEnd &&
    now.getTime() < periodEndTime;
  const hasScheduledCancellation = Boolean(subscription.cancel_at);

  return {
    tier:
      isPaidStatus || inGracePeriod || canceledWithTimeRemaining
        ? 'pro'
        : 'free',
    status: subscription.status,
    planId: subscription.plan_id,
    cancelAtPeriodEnd:
      subscription.cancel_at_period_end || hasScheduledCancellation,
    cancelAt: subscription.cancel_at,
    currentPeriodEnd: subscription.current_period_end,
    inGracePeriod,
  };
}

export function isKnownSubscriptionStatus(
  status: string,
): status is BillingSubscriptionStatus {
  return STRIPE_SUBSCRIPTION_STATUSES.includes(
    status as BillingSubscriptionStatus,
  );
}
