import { PropertyOutput } from '@src/modules/properties/contracts';
import type { StripeConnectOnboardingStatus } from '@src/modules/user/contracts';
import { STRIPE_CONNECT_ONBOARDING_STATUS } from '@src/modules/user/contracts';

export class HostStripeConnectOutput {
  constructor(
    public readonly onboardingStatus: StripeConnectOnboardingStatus,
    public readonly chargesEnabled: boolean,
    public readonly payoutsEnabled: boolean,
    public readonly hasAccount: boolean,
  ) {}
}

export class HostProfileOutput {
  constructor(
    public readonly user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    },
    public readonly properties: PropertyOutput[],
    public readonly stripe: HostStripeConnectOutput = new HostStripeConnectOutput(
      STRIPE_CONNECT_ONBOARDING_STATUS.NOT_STARTED,
      false,
      false,
      false,
    ),
  ) {}
}
