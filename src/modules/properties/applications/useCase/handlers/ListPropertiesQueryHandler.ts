import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyOutput } from '../../dto/property.outup';
import type { PropertyMediaPresenter } from '../../presenters/property-media.presenter';
import type { ListPropertiesQuery } from '../queries/ListPropertiesQuery';

export class ListPropertiesQueryHandler
  implements IQueryHandler<ListPropertiesQuery, PaginatedResult<PropertyOutput>>
{
  constructor(
    private readonly repository: IPropertyRepository,
    private readonly presenter: PropertyMediaPresenter,
  ) {}

  async execute(
    query: ListPropertiesQuery,
  ): Promise<PaginatedResult<PropertyOutput>> {
    const result = await this.repository.findPaginated(query.params);

    const data = await Promise.all(
      result.data.map((property) => this.presenter.toOutput(property)),
    );

    return { data, meta: result.meta };
  }
}
