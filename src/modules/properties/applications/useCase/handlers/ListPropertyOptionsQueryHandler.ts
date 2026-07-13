import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyOutput } from '../../dto/property.output';
import type { PropertyMediaPresenter } from '../../presenters/property-media.presenter';
import type { ListPropertyOptionsQuery } from '../queries/ListPropertyOptionsQuery';

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
