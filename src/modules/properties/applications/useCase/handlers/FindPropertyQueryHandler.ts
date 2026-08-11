import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IPropertyRepository } from '@src/modules/properties/domain/repositories/property.repository';
import { PropertyOutput } from '@src/modules/properties/applications/dto/property.output';
import type { PropertyMediaPresenter } from '@src/modules/properties/applications/presenters/property-media.presenter';
import type { FindPropertyQuery } from '@src/modules/properties/applications/useCase/queries/FindPropertyQuery';

export class FindPropertyQueryHandler implements IQueryHandler<
  FindPropertyQuery,
  PropertyOutput
> {
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
