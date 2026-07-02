import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '../../../domain/repositories/property.repository';
import { PropertyOutput } from '../../dto/property.outup';
import type { PropertyMediaPresenter } from '../../presenters/property-media.presenter';
import type { FindPropertyQuery } from '../queries/FindPropertyQuery';

export class FindPropertyQueryHandler
  implements IQueryHandler<FindPropertyQuery, PropertyOutput>
{
  constructor(
    private readonly repository: IPropertyRepository,
    private readonly presenter: PropertyMediaPresenter,
  ) {}

  async execute(query: FindPropertyQuery): Promise<PropertyOutput> {
    const property = await this.repository.findById(query.id);
    if (!property) {
      throw new Error('Property not found');
    }
    return this.presenter.toOutput(property);
  }
}
