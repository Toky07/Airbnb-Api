import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IPropertyTypeRepository } from '../../../domain/repositories/property-type.repository';
import { PropertyTypeOutput } from '../../dto/property-type.output';
import type { ListPropertyTypesQuery } from '../queries/ListPropertyTypesQuery';

export class ListPropertyTypesQueryHandler implements IQueryHandler<
  ListPropertyTypesQuery,
  PropertyTypeOutput[]
> {
  constructor(private readonly repository: IPropertyTypeRepository) {}

  async execute(_query: ListPropertyTypesQuery): Promise<PropertyTypeOutput[]> {
    const types = await this.repository.findAll();
    return types.map(PropertyTypeOutput.fromDomain);
  }
}
