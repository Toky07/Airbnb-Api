import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { PropertyMediaPresenter } from '@src/modules/properties/contracts';
import { PropertyOutput } from '@src/modules/properties/contracts';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { GetHostPropertyQuery } from '@src/modules/host/applications/useCase/queries/GetHostPropertyQuery';

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
