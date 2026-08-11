import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { ListAmenitiesQuery } from '@src/modules/amenity/applications/useCase/queries/ListAmenitiesQuery';

export class ListAmenitiesQueryHandler implements IQueryHandler<
  ListAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(private readonly repository: IAmenityRepository) {}

  async execute(query: ListAmenitiesQuery): Promise<AmenityOutput[]> {
    const amenities = await this.repository.findAll(query.scope);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
