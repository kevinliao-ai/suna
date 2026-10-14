export function isGenerationAllowlisted(
  email: string | null | undefined,
  environment: NodeJS.ProcessEnv = process.env,
) {
  const allowed = (environment.GENERATION_TEST_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && allowed.includes(email.toLowerCase()));
}

// Pro entitlement and credit reservation still gate every paid request.
export function paidGenerationRolloutEnabled(
  email: string | null | undefined,
  environment: NodeJS.ProcessEnv = process.env,
) {
  if (environment.ENABLE_PAID_GENERATION?.trim() !== 'true') return false;
  if (environment.PAID_GENERATION_ALLOWLIST_ONLY?.trim() === 'true') {
    return isGenerationAllowlisted(email, environment);
  }
  return true;
}

export function generationSimulationEnabled(
  email: string | null | undefined,
  environment: NodeJS.ProcessEnv = process.env,
) {
  return (
    environment.ENABLE_GENERATION_SIMULATION?.trim() === 'true' &&
    isGenerationAllowlisted(email, environment)
  );
}
