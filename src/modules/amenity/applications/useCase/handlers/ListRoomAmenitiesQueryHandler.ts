import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { AmenityOutput } from '../../dto/amenity.output';
import type { ListRoomAmenitiesQuery } from '../queries/ListRoomAmenitiesQuery';
import type { ListEntityAmenitiesService } from '../../services/entity-amenities.service';

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
