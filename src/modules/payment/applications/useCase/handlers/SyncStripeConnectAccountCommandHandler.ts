import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IUserRepository } from '@src/modules/user/contracts';
import {
  resolveStripeConnectOnboardingStatus,
  STRIPE_CONNECT_ONBOARDING_STATUS,
} from '@src/modules/user/contracts';
import type { SyncStripeConnectAccountCommand } from '@src/modules/payment/applications/useCase/commands/SyncStripeConnectAccountCommand';

export class SyncStripeConnectAccountCommandHandler implements ICommandHandler<
  SyncStripeConnectAccountCommand,
  void
> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: SyncStripeConnectAccountCommand): Promise<void> {
    const user = await this.userRepository.findByStripeAccountId(
      command.stripeAccountId,
    );

    if (!user) {
      return;
    }

    if (command.deauthorized) {
      user.stripeAccountId = null;
      user.stripeChargesEnabled = false;
      user.stripePayoutsEnabled = false;
      user.stripeOnboardingStatus =
        STRIPE_CONNECT_ONBOARDING_STATUS.NOT_STARTED;
    } else {
      user.stripeChargesEnabled = command.chargesEnabled;
      user.stripePayoutsEnabled = command.payoutsEnabled;
      user.stripeOnboardingStatus = resolveStripeConnectOnboardingStatus({
        stripeAccountId: user.stripeAccountId,
        chargesEnabled: command.chargesEnabled,
      });
    }

    await this.userRepository.update(user);
  }
}
