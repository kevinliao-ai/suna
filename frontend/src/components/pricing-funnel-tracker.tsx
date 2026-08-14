'use client';

import { useEffect, useRef } from 'react';
import posthog from 'posthog-js';

export function PricingFunnelTracker({
  source,
  signedIn,
  checkout,
}: {
  source: string;
  signedIn: boolean;
  checkout?: string;
}) {
  const captured = useRef(false);

  useEffect(() => {
    if (captured.current) return;
    captured.current = true;

    posthog.capture('pricing_viewed', {
      source,
      signed_in: signedIn,
    });

    if (checkout === 'canceled') {
      posthog.capture('billing_checkout_returned_canceled', { source });
    }
  }, [checkout, signedIn, source]);

  return null;
}
