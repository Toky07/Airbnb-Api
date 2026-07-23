type EnvSource = NodeJS.ProcessEnv;

function readNumber(env: EnvSource, key: string, fallback: number): number {
  const raw = env[key]?.trim();
  if (!raw) {
    return fallback;
  }

  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function getVatRate(env: EnvSource = process.env): number {
  return readNumber(env, 'VAT_RATE', 0.1);
}

export function getServiceFeePercent(env: EnvSource = process.env): number {
  return readNumber(env, 'SERVICE_FEE_PERCENT', 0);
}
