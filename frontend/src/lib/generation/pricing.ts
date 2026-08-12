export type FalGenerationKind = 'reference' | 'video';

export interface GenerationQuote {
  currency: 'USD';
  estimatedCostUsd: number;
  hardLimitUsd: number;
  model: string;
  quantity: number;
  unit: string;
  unitPriceUsd: number;
}

interface FalPricingPayload {
  prices?: Array<{
    currency?: unknown;
    endpoint_id?: unknown;
    unit?: unknown;
    unit_price?: unknown;
  }>;
}

function positiveNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function generationHardLimit(kind: FalGenerationKind, environment = process.env) {
  const name = kind === 'reference'
    ? 'MAX_REFERENCE_GENERATION_USD'
    : 'MAX_VIDEO_GENERATION_USD';
  const configured = positiveNumber(environment[name]);
  return configured ?? (kind === 'reference' ? 0.2 : 2);
}

export function buildGenerationQuote({
  kind,
  model,
  payload,
  environment = process.env,
}: {
  kind: FalGenerationKind;
  model: string;
  payload: unknown;
  environment?: NodeJS.ProcessEnv;
}): GenerationQuote | null {
  const prices = (payload as FalPricingPayload | null)?.prices;
  const price = prices?.find((candidate) => candidate.endpoint_id === model) ?? prices?.[0];
  const unitPriceUsd = positiveNumber(price?.unit_price);
  const unit = typeof price?.unit === 'string' ? price.unit.trim() : '';
  const currency = typeof price?.currency === 'string' ? price.currency.toUpperCase() : '';

  if (!unitPriceUsd || !unit || currency !== 'USD') return null;

  const normalizedUnit = unit.toLowerCase();
  let quantity: number;
  if (kind === 'video' && normalizedUnit.includes('second')) quantity = 5;
  else if (kind === 'video' && normalizedUnit.includes('video')) quantity = 1;
  else if (kind === 'reference' && normalizedUnit.includes('megapixel')) quantity = 1.1;
  else if (kind === 'reference' && normalizedUnit.includes('image')) quantity = 1;
  else return null;
  return {
    currency: 'USD',
    estimatedCostUsd: Number((unitPriceUsd * quantity).toFixed(6)),
    hardLimitUsd: generationHardLimit(kind, environment),
    model,
    quantity,
    unit,
    unitPriceUsd,
  };
}

export function quoteIsWithinLimit(quote: GenerationQuote) {
  return quote.estimatedCostUsd <= quote.hardLimitUsd;
}
