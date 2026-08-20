import type { PricingBreakdown } from './pricing-breakdown.types';
import {
  getHostCommissionPercent,
  getStripeFeeFixedCents,
  getStripeFeePercent,
} from './pricing.constants';

export type ApplicationFeeComputation = {
  hostCommissionCents: number;
  stripeFeeEstimateCents: number;
  applicationFeeAmount: number;
  hostPayoutCents: number;
};

export function estimateStripeFeeCents(
  totalCents: number,
  env: NodeJS.ProcessEnv = process.env,
): number {
  if (totalCents <= 0) {
    return 0;
  }

  return (
    Math.round(totalCents * getStripeFeePercent(env)) +
    getStripeFeeFixedCents(env)
  );
}

export function computeApplicationFeeAmount(
  breakdown: Pick<
    PricingBreakdown,
    'subtotalCents' | 'serviceFeeCents' | 'totalCents'
  >,
  env: NodeJS.ProcessEnv = process.env,
): ApplicationFeeComputation {
  const hostCommissionCents = Math.round(
    breakdown.subtotalCents * getHostCommissionPercent(env),
  );
  const stripeFeeEstimateCents = estimateStripeFeeCents(
    breakdown.totalCents,
    env,
  );
  const uncapped =
    breakdown.serviceFeeCents + hostCommissionCents + stripeFeeEstimateCents;
  const maxFee = Math.max(0, breakdown.totalCents - 1);
  const applicationFeeAmount = Math.min(Math.max(0, uncapped), maxFee);

  return {
    hostCommissionCents,
    stripeFeeEstimateCents,
    applicationFeeAmount,
    hostPayoutCents: breakdown.totalCents - applicationFeeAmount,
  };
}
