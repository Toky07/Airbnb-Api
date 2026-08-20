export const STRIPE_CONNECT_ONBOARDING_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  COMPLETE: 'complete',
} as const;

export type StripeConnectOnboardingStatus =
  (typeof STRIPE_CONNECT_ONBOARDING_STATUS)[keyof typeof STRIPE_CONNECT_ONBOARDING_STATUS];

export function isStripeConnectOnboardingStatus(
  value: string,
): value is StripeConnectOnboardingStatus {
  return (
    value === STRIPE_CONNECT_ONBOARDING_STATUS.NOT_STARTED ||
    value === STRIPE_CONNECT_ONBOARDING_STATUS.PENDING ||
    value === STRIPE_CONNECT_ONBOARDING_STATUS.COMPLETE
  );
}

export function resolveStripeConnectOnboardingStatus(params: {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
}): StripeConnectOnboardingStatus {
  if (!params.stripeAccountId) {
    return STRIPE_CONNECT_ONBOARDING_STATUS.NOT_STARTED;
  }

  if (params.chargesEnabled) {
    return STRIPE_CONNECT_ONBOARDING_STATUS.COMPLETE;
  }

  return STRIPE_CONNECT_ONBOARDING_STATUS.PENDING;
}
