import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { PropertyMediaPresenter } from '@src/modules/properties/contracts';
import { PropertyOutput } from '@src/modules/properties/contracts';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { ListHostPropertiesQuery } from '@src/modules/host/applications/useCase/queries/ListHostPropertiesQuery';

export class ListHostPropertiesQueryHandler implements IQueryHandler<
  ListHostPropertiesQuery,
  PropertyOutput[]
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
    private readonly propertyPresenter: PropertyMediaPresenter,
  ) {}

  async execute(query: ListHostPropertiesQuery): Promise<PropertyOutput[]> {
    const properties = await this.resolveHostProperty.listOwned(query.authUser);
    return Promise.all(
      properties.map((property) => this.propertyPresenter.toOutput(property)),
    );
  }
}
