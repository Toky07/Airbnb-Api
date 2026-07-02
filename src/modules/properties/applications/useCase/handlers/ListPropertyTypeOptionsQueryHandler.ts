import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyTypeRepository } from '../../../domain/repositories/property-type.repository';
import { PropertyTypeOutput } from '../../dto/property-type.output';
import type { ListPropertyTypeOptionsQuery } from '../queries/ListPropertyTypeOptionsQuery';

export class ListPropertyTypeOptionsQueryHandler
  implements IQueryHandler<ListPropertyTypeOptionsQuery, PropertyTypeOutput[]>
{
  constructor(private readonly repository: IPropertyTypeRepository) {}

  async execute(_query: ListPropertyTypeOptionsQuery): Promise<PropertyTypeOutput[]> {
    const types = await this.repository.findActive();
    return types.map(PropertyTypeOutput.fromDomain);
  }
}
