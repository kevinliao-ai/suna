'use client';

import Link from 'next/link';
import { Crown } from 'lucide-react';
import { BillingActionButton } from './billing-action-button';
import type { BillingEntitlement } from '@/lib/billing/model';
import { getBillingPlan } from '@/lib/billing/plans';

interface BillingStatusCardProps {
  entitlement: BillingEntitlement | null;
  isLoading: boolean;
  isAvailable: boolean;
}

export function BillingStatusCard({
  entitlement,
  isLoading,
  isAvailable,
}: BillingStatusCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-black/10 p-3 text-xs text-zinc-500 dark:border-white/10">
        Checking billing status…
      </div>
    );
  }

  if (!isAvailable) return null;

  if (entitlement?.tier === 'pro') {
    const plan = entitlement.planId ? getBillingPlan(entitlement.planId) : null;
    const periodEnd = entitlement.currentPeriodEnd
      ? new Date(entitlement.currentPeriodEnd)
      : null;
    const periodEndLabel =
      periodEnd && Number.isFinite(periodEnd.getTime())
        ? new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeZone: 'UTC',
          }).format(periodEnd)
        : null;

    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Crown className="size-4 text-violet-500" />
          Studio Pro
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {entitlement.cancelAtPeriodEnd
            ? 'Your plan remains active until the end of this billing period.'
            : entitlement.inGracePeriod
              ? 'Payment needs attention. Update it to keep cloud access.'
              : 'Cloud workspace access is active.'}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
          <div>
            <dt className="uppercase tracking-wide text-zinc-400">Plan</dt>
            <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
              {plan?.interval === 'year' ? 'Studio Pro Annual' : 'Studio Pro Monthly'}
            </dd>
          </div>
          {periodEndLabel ? (
            <div>
              <dt className="uppercase tracking-wide text-zinc-400">
                {entitlement.cancelAtPeriodEnd ? 'Access until' : 'Renews'}
              </dt>
              <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                {periodEndLabel}
              </dd>
            </div>
          ) : null}
        </dl>
        <BillingActionButton
          action="portal"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium dark:border-white/10 dark:bg-white/5"
        >
          Manage billing
        </BillingActionButton>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 p-3 dark:border-white/10">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Crown className="size-4 text-zinc-400" />
        Free workspace
      </div>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        Upgrade for cross-device cloud projects and automatic recovery.
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-flex rounded-lg bg-zinc-950 px-3 py-2 text-xs font-medium text-white dark:bg-white dark:text-zinc-950"
      >
        View Studio Pro
      </Link>
    </div>
  );
}
