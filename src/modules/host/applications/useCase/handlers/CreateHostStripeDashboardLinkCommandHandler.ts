import { BadRequestException } from '@nestjs/common';
import type { ICommandHandler } from '@src/shared/useCase/bus/command-handler.interface';
import type { IStripeConnectAccounts } from '@src/modules/payment/contracts';
import { HostStripeLinkOutput } from '@src/modules/host/applications/dto/host-stripe-link.output';
import { ResolveHostUserService } from '@src/modules/host/applications/services/resolve-host-user.service';
import type { CreateHostStripeDashboardLinkCommand } from '@src/modules/host/applications/useCase/commands/CreateHostStripeDashboardLinkCommand';

export class CreateHostStripeDashboardLinkCommandHandler implements ICommandHandler<
  CreateHostStripeDashboardLinkCommand,
  HostStripeLinkOutput
> {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    private readonly stripeConnectAccounts: IStripeConnectAccounts,
  ) {}

  async execute(
    command: CreateHostStripeDashboardLinkCommand,
  ): Promise<HostStripeLinkOutput> {
    const user = await this.resolveHostUser.resolve(command.authUser.sub);

    if (!user.stripeAccountId) {
      throw new BadRequestException(
        'Activez d’abord les paiements Stripe pour ouvrir le dashboard.',
      );
    }

    const link = await this.stripeConnectAccounts.createLoginLink(
      user.stripeAccountId,
    );

    return new HostStripeLinkOutput(link.url);
  }
}
