import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ListPropertyAmenitiesQuery } from '../queries/ListPropertyAmenitiesQuery';
import type { ListEntityAmenitiesService } from '../../services/entity-amenities.service';

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
