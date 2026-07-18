import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { PropertyMediaPresenter } from '../../../../properties/applications/presenters/property-media.presenter';
import { PropertyOutput } from '../../../../properties/applications/dto/property.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { ListHostPropertiesQuery } from '../queries/ListHostPropertiesQuery';

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
