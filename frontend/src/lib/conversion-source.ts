export const DEFAULT_CONVERSION_SOURCE = 'direct';

const SOURCE_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function normalizeConversionSource(value: unknown) {
  if (typeof value !== 'string') return DEFAULT_CONVERSION_SOURCE;

  const source = value.trim().toLowerCase();
  return SOURCE_PATTERN.test(source) ? source : DEFAULT_CONVERSION_SOURCE;
}

export function pricingHref(source: string) {
  return `/pricing?source=${encodeURIComponent(normalizeConversionSource(source))}`;
}

export function authPricingHref(source: string) {
  return `/auth?returnUrl=${encodeURIComponent(pricingHref(source))}`;
}
