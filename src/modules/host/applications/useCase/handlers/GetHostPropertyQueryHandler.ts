import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { PropertyMediaPresenter } from '../../../../properties/applications/presenters/property-media.presenter';
import { PropertyOutput } from '../../../../properties/applications/dto/property.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { GetHostPropertyQuery } from '../queries/GetHostPropertyQuery';

export class GetHostPropertyQueryHandler implements IQueryHandler<
  GetHostPropertyQuery,
  PropertyOutput
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(query: GetHostPropertyQuery): Promise<PropertyOutput> {
    const property = await this.resolveHostProperty.requireOwned(
      query.authUser,
      query.propertyId,
    );
    return this.propertyPresenter.toOutput(property);
  }
}
