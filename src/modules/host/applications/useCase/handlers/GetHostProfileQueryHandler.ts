import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { PropertyMediaPresenter } from '@src/modules/properties/contracts';
import {
  HostProfileOutput,
  HostStripeConnectOutput,
} from '@src/modules/host/applications/dto/host-profile.output';
import { STRIPE_CONNECT_ONBOARDING_STATUS } from '@src/modules/user/contracts';
import { ResolveHostUserService } from '@src/modules/host/applications/services/resolve-host-user.service';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { GetHostProfileQuery } from '@src/modules/host/applications/useCase/queries/GetHostProfileQuery';

export class GetHostProfileQueryHandler implements IQueryHandler<
  GetHostProfileQuery,
  HostProfileOutput
> {
  constructor(
    private readonly resolveHostUser: ResolveHostUserService,
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(query: GetHostProfileQuery): Promise<HostProfileOutput> {
    const user = await this.resolveHostUser.resolve(query.authUser.sub);
    const properties = await this.resolveHostProperty.listOwned(query.authUser);
    const propertyOutputs = await Promise.all(
      properties.map((property) => this.propertyPresenter.toOutput(property)),
    );

    return new HostProfileOutput(
      {
        id: user.id!,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      propertyOutputs,
      new HostStripeConnectOutput(
        user.stripeOnboardingStatus ??
          STRIPE_CONNECT_ONBOARDING_STATUS.NOT_STARTED,
        Boolean(user.stripeChargesEnabled),
        Boolean(user.stripePayoutsEnabled),
        Boolean(user.stripeAccountId),
      ),
    );
  }
}
