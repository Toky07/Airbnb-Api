import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IAmenityRepository } from '@src/modules/amenity/domain/repositories/amenity.repository';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { ListAmenityOptionsQuery } from '@src/modules/amenity/applications/useCase/queries/ListAmenityOptionsQuery';

export class ListAmenityOptionsQueryHandler implements IQueryHandler<
  ListAmenityOptionsQuery,
  AmenityOutput[]
> {
  constructor(private readonly repository: IAmenityRepository) {}

  async execute(query: ListAmenityOptionsQuery): Promise<AmenityOutput[]> {
    const amenities = await this.repository.findActive(query.scope);
    return amenities.map(AmenityOutput.fromDomain);
  }
}
