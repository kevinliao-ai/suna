'use client';

import { useState } from 'react';
import { CreditCard, LoaderCircle } from 'lucide-react';
import type { BillingPlanId } from '@/lib/billing/plans';
import posthog from 'posthog-js';

interface BillingActionButtonProps {
  action: 'checkout' | 'portal';
  planId?: BillingPlanId;
  children: React.ReactNode;
  className?: string;
}

interface BillingActionResponse {
  url?: string;
  message?: string;
}

export function BillingActionButton({
  action,
  planId,
  children,
  className = '',
}: BillingActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    posthog.capture(
      action === 'checkout'
        ? 'billing_checkout_started'
        : 'billing_portal_started',
      { plan_id: planId || null },
    );

    try {
      const response = await fetch(`/api/billing/${action}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: action === 'checkout' ? JSON.stringify({ planId }) : '{}',
      });
      const body = (await response
        .json()
        .catch(() => ({}))) as BillingActionResponse;
      if (!response.ok || !body.url) {
        throw new Error(body.message || 'Billing is temporarily unavailable.');
      }
      posthog.capture(
        action === 'checkout'
          ? 'billing_checkout_created'
          : 'billing_portal_opened',
        { plan_id: planId || null },
      );
      window.location.assign(body.url);
    } catch (caught) {
      posthog.capture(
        action === 'checkout'
          ? 'billing_checkout_failed'
          : 'billing_portal_failed',
        { plan_id: planId || null },
      );
      setError(
        caught instanceof Error
          ? caught.message
          : 'Billing is temporarily unavailable.',
      );
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => void start()}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard className="size-4" aria-hidden="true" />
        )}
        {children}
      </button>
      {error ? (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
