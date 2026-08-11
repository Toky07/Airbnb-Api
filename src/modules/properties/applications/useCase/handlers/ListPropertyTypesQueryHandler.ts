import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IPropertyTypeRepository } from '@src/modules/properties/domain/repositories/property-type.repository';
import { PropertyTypeOutput } from '@src/modules/properties/applications/dto/property-type.output';
import type { ListPropertyTypesQuery } from '@src/modules/properties/applications/useCase/queries/ListPropertyTypesQuery';

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
