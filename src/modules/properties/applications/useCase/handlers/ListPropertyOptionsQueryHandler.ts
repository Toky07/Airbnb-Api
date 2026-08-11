import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '@src/modules/properties/domain/repositories/property.repository';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
import type { PropertyMediaPresenter } from '@src/modules/properties/applications/presenters/property-media.presenter';
import type { ListPropertyOptionsQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertyOptionsQuery';

export class ListPropertyOptionsQueryHandler implements IQueryHandler<
  ListPropertyOptionsQuery,
  PropertyOutput[]
> {
  constructor(
    private readonly repository: IPropertyRepository,
    private readonly presenter: PropertyMediaPresenter,
  ) {}

  async execute(_query: ListPropertyOptionsQuery): Promise<PropertyOutput[]> {
    const properties = await this.repository.findAll();
    return Promise.all(
      properties.map((property) => this.presenter.toOutput(property)),
    );
  }
}
