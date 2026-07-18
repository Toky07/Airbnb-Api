import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { PropertyMediaPresenter } from '../../../../properties/applications/presenters/property-media.presenter';
import { HostProfileOutput } from '../../dto/host-profile.output';
import { ResolveHostUserService } from '../../services/resolve-host-user.service';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { GetHostProfileQuery } from '../queries/GetHostProfileQuery';

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
    );
  }
}
