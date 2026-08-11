import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { ListPropertyAmenitiesQuery } from '@src/modules/amenity/applications/useCase/queries/ListPropertyAmenitiesQuery';
import type { ListEntityAmenitiesService } from '@src/modules/amenity/applications/services/list-entity-amenities.service';

export class ListPropertyAmenitiesQueryHandler implements IQueryHandler<
  ListPropertyAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(
    private readonly listEntityAmenitiesService: ListEntityAmenitiesService,
  ) {}

  async execute(query: ListPropertyAmenitiesQuery): Promise<AmenityOutput[]> {
    return this.listEntityAmenitiesService.listForProperty(query.propertyId);
  }
}
