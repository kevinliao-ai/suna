export const BILLING_PLANS = [
  {
    id: 'studio-pro-monthly',
    name: 'Studio Pro',
    description: 'Anime production workspace with monthly generation credits.',
    amount: 599,
    currency: 'USD',
    interval: 'month',
    priceEnv: 'STRIPE_STUDIO_PRO_MONTHLY_PRICE_ID',
  },
  {
    id: 'studio-pro-annual',
    name: 'Studio Pro',
    description: 'Anime production workspace with monthly generation credits.',
    amount: 5900,
    currency: 'USD',
    interval: 'year',
    priceEnv: 'STRIPE_STUDIO_PRO_ANNUAL_PRICE_ID',
  },
] as const;

export type BillingPlanId = (typeof BILLING_PLANS)[number]['id'];

export function getBillingPlan(planId: string) {
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? null;
}

export function formatPlanPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
