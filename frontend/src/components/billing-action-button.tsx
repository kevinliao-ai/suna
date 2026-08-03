'use client';

import { useState } from 'react';
import { CreditCard, LoaderCircle } from 'lucide-react';
import type { BillingPlanId } from '@/lib/billing/plans';

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
      window.location.assign(body.url);
    } catch (caught) {
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
