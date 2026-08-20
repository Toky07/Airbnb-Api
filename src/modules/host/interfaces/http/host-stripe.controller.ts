import { Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@src/modules/authentication/contracts';
import { RequirePermissions } from '@src/modules/authentication/contracts';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { ApiJwtAuth } from '@src/shared/swagger/swagger.decorators';
import { SWAGGER_TAGS } from '@src/shared/swagger/swagger.constants';
import { CreateHostStripeOnboardingLinkCommand } from '@src/modules/host/applications/useCase/commands/CreateHostStripeOnboardingLinkCommand';
import { CreateHostStripeDashboardLinkCommand } from '@src/modules/host/applications/useCase/commands/CreateHostStripeDashboardLinkCommand';
import type { HostStripeLinkOutput } from '@src/modules/host/applications/dto/host-stripe-link.output';

@ApiTags(SWAGGER_TAGS.HOST)
@ApiJwtAuth()
@Controller('host/stripe')
export class HostStripeController {
  @Post('onboarding-link')
  @RequirePermissions('host.dashboard.read')
  @ApiOperation({ summary: 'Lien d’onboarding Stripe Connect Express' })
  onboardingLink(
    @Req() request: { user: JwtPayload },
  ): Promise<HostStripeLinkOutput> {
    return CommandBus.execute(
      new CreateHostStripeOnboardingLinkCommand(request.user),
    );
  }

  @Post('dashboard-link')
  @RequirePermissions('host.dashboard.read')
  @ApiOperation({ summary: 'Lien vers le dashboard Stripe Express' })
  dashboardLink(
    @Req() request: { user: JwtPayload },
  ): Promise<HostStripeLinkOutput> {
    return CommandBus.execute(
      new CreateHostStripeDashboardLinkCommand(request.user),
    );
  }
}
