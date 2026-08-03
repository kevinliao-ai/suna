import { NextResponse } from 'next/server';
import { BillingConfigurationError } from './server';

export function billingError(status: number, code: string, message: string) {
  return NextResponse.json({ success: false, code, message }, { status });
}

export function billingException(error: unknown) {
  if (error instanceof BillingConfigurationError) {
    console.error('Billing configuration error:', error.message);
    return billingError(
      503,
      'billing_not_configured',
      'Billing is not available in this deployment yet.',
    );
  }

  console.error(
    'Billing request failed:',
    error instanceof Error ? error.name : 'UnknownError',
  );
  return billingError(
    500,
    'billing_request_failed',
    'The billing request could not be completed. Try again later.',
  );
}
