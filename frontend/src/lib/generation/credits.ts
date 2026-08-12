import type { BillingEntitlement } from '@/lib/billing/model';
import type { GenerationQuote } from '@/lib/generation/pricing';

export const PRO_MONTHLY_GENERATION_CREDITS = 200;

export function creditsForQuote(quote: Pick<GenerationQuote, 'estimatedCostUsd'>) {
  return Math.max(1, Math.ceil(quote.estimatedCostUsd * 100));
}

function addUtcMonths(date: Date, months: number) {
  const anchorDay = date.getUTCDate();
  const result = new Date(date);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(
    result.getUTCFullYear(),
    result.getUTCMonth() + 1,
    0,
  )).getUTCDate();
  result.setUTCDate(Math.min(anchorDay, lastDay));
  return result;
}

export function resolveCreditCycle(
  entitlement: BillingEntitlement,
  now = new Date(),
) {
  if (
    entitlement.tier !== 'pro'
    || !entitlement.currentPeriodStart
    || !entitlement.currentPeriodEnd
  ) return null;

  const subscriptionStart = new Date(entitlement.currentPeriodStart);
  const subscriptionEnd = new Date(entitlement.currentPeriodEnd);
  if (
    !Number.isFinite(subscriptionStart.getTime())
    || !Number.isFinite(subscriptionEnd.getTime())
    || subscriptionEnd <= subscriptionStart
  ) return null;

  if (entitlement.planId !== 'studio-pro-annual') {
    return {
      periodStart: subscriptionStart.toISOString(),
      periodEnd: subscriptionEnd.toISOString(),
    };
  }

  let periodStart = subscriptionStart;
  let periodEnd = addUtcMonths(subscriptionStart, 1);
  while (periodEnd <= now && periodEnd < subscriptionEnd) {
    periodStart = periodEnd;
    periodEnd = addUtcMonths(periodStart, 1);
  }
  if (periodEnd > subscriptionEnd) periodEnd = subscriptionEnd;

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };
}
