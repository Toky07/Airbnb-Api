import { afterEach, describe, expect, it, vi } from 'vitest';
import { computeApplicationFeeAmount } from './compute-application-fee.service';

describe('computeApplicationFeeAmount', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('impute les frais Stripe à l’hôte en plus des frais de service', () => {
    vi.stubEnv('HOST_COMMISSION_PERCENT', '0');
    vi.stubEnv('STRIPE_FEE_PERCENT', '0.015');
    vi.stubEnv('STRIPE_FEE_FIXED_CENTS', '25');

    const result = computeApplicationFeeAmount({
      subtotalCents: 10_000,
      serviceFeeCents: 1_000,
      totalCents: 12_000,
    });

    expect(result.hostCommissionCents).toBe(0);
    expect(result.stripeFeeEstimateCents).toBe(205);
    expect(result.applicationFeeAmount).toBe(1_205);
    expect(result.hostPayoutCents).toBe(10_795);
  });

  it('ajoute une commission hôte sur le sous-total', () => {
    vi.stubEnv('HOST_COMMISSION_PERCENT', '0.03');
    vi.stubEnv('STRIPE_FEE_PERCENT', '0');
    vi.stubEnv('STRIPE_FEE_FIXED_CENTS', '0');

    const result = computeApplicationFeeAmount({
      subtotalCents: 10_000,
      serviceFeeCents: 1_000,
      totalCents: 12_000,
    });

    expect(result.hostCommissionCents).toBe(300);
    expect(result.applicationFeeAmount).toBe(1_300);
    expect(result.hostPayoutCents).toBe(10_700);
  });

  it('plafonne application_fee sous le montant total', () => {
    vi.stubEnv('HOST_COMMISSION_PERCENT', '1');
    vi.stubEnv('STRIPE_FEE_PERCENT', '1');
    vi.stubEnv('STRIPE_FEE_FIXED_CENTS', '1000');

    const result = computeApplicationFeeAmount({
      subtotalCents: 100,
      serviceFeeCents: 50,
      totalCents: 200,
    });

    expect(result.applicationFeeAmount).toBe(199);
    expect(result.hostPayoutCents).toBe(1);
  });
});
