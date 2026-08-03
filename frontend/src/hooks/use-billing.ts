'use client';

import { useEffect, useState } from 'react';
import type { BillingEntitlement } from '@/lib/billing/model';

interface BillingStatusResponse {
  success?: boolean;
  entitlement?: BillingEntitlement;
}

export function useBillingStatus(enabled = true) {
  const [entitlement, setEntitlement] = useState<BillingEntitlement | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(enabled);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setEntitlement(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;
    const checkoutReturn =
      new URLSearchParams(window.location.search).get('billing') === 'success';
    let attemptsRemaining = checkoutReturn ? 6 : 1;

    const load = async () => {
      try {
        const response = await fetch('/api/billing/status', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        const body = (await response
          .json()
          .catch(() => ({}))) as BillingStatusResponse;

        if (cancelled) return;
        if (response.ok && body.entitlement) {
          setEntitlement(body.entitlement);
          setIsAvailable(true);
          if (body.entitlement.tier === 'pro') attemptsRemaining = 0;
        } else if (response.status === 503) {
          setIsAvailable(false);
        }
      } catch {
        if (!cancelled) setIsAvailable(false);
      } finally {
        if (cancelled) return;
        attemptsRemaining -= 1;
        if (attemptsRemaining > 0) {
          timer = window.setTimeout(() => void load(), 1500);
        } else {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled]);

  return { entitlement, isLoading, isAvailable };
}
