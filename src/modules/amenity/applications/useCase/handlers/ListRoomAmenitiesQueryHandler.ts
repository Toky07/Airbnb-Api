import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { AmenityOutput } from '@src/modules/amenity/applications/dto/amenity.output';
import type { ListRoomAmenitiesQuery } from '@src/modules/amenity/applications/useCase/queries/ListRoomAmenitiesQuery';
import type { ListEntityAmenitiesService } from '@src/modules/amenity/applications/services/entity-amenities.service';

export class ListRoomAmenitiesQueryHandler implements IQueryHandler<
  ListRoomAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(
    private readonly listEntityAmenitiesService: ListEntityAmenitiesService,
  ) {}

  async execute(query: ListRoomAmenitiesQuery): Promise<AmenityOutput[]> {
    return this.listEntityAmenitiesService.listForRoom(query.roomId);
  }
}
