import { BadRequestException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IStripeConnectAccounts } from '@src/modules/payment/contracts';
import {
  STRIPE_CONNECT_ONBOARDING_STATUS,
  resolveStripeConnectOnboardingStatus,
} from '@src/modules/user/contracts';
import {
  getAppPublicUrl,
  getStripeConnectCountry,
} from '@src/config/env.config';
import { HostStripeLinkOutput } from '@src/modules/host/applications/dto/host-stripe-link.output';
import { ResolveHostUserService } from '@src/modules/host/applications/services/resolve-host-user.service';
import type { CreateHostStripeOnboardingLinkCommand } from '@src/modules/host/applications/useCase/commands/CreateHostStripeOnboardingLinkCommand';

export class CreateHostStripeOnboardingLinkCommandHandler implements ICommandHandler<
  CreateHostStripeOnboardingLinkCommand,
  HostStripeLinkOutput
> {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    private readonly stripeConnectAccounts: IStripeConnectAccounts,
  ) {}

  async execute(
    command: CreateHostStripeOnboardingLinkCommand,
  ): Promise<HostStripeLinkOutput> {
    const user = await this.resolveHostUser.resolve(command.authUser.sub);
    let stripeAccountId = user.stripeAccountId;

    if (!stripeAccountId) {
      const account = await this.stripeConnectAccounts.createExpressAccount({
        email: user.email,
        country: getStripeConnectCountry(),
      });
      stripeAccountId = account.id;
      user.stripeAccountId = account.id;
      user.stripeChargesEnabled = account.chargesEnabled;
      user.stripePayoutsEnabled = account.payoutsEnabled;
      user.stripeOnboardingStatus = resolveStripeConnectOnboardingStatus({
        stripeAccountId: account.id,
        chargesEnabled: account.chargesEnabled,
      });
      await this.resolveHostUser.update(user);
    }

    if (!stripeAccountId) {
      throw new BadRequestException('Impossible de créer le compte Stripe.');
    }

    const appUrl = getAppPublicUrl();
    const link = await this.stripeConnectAccounts.createAccountLink({
      accountId: stripeAccountId,
      refreshUrl: `${appUrl}/host?stripe=refresh`,
      returnUrl: `${appUrl}/host?stripe=return`,
    });

    if (
      user.stripeOnboardingStatus ===
      STRIPE_CONNECT_ONBOARDING_STATUS.NOT_STARTED
    ) {
      user.stripeOnboardingStatus = STRIPE_CONNECT_ONBOARDING_STATUS.PENDING;
      await this.resolveHostUser.update(user);
    }

    return new HostStripeLinkOutput(link.url);
  }
}
