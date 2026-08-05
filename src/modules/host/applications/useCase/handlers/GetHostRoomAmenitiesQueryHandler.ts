import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { AmenityOutput } from '../../../../amenity/applications/dto/amenity.output';
import { ListRoomAmenitiesQuery } from '../../../../amenity/applications/useCase/queries/ListRoomAmenitiesQuery';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { GetHostRoomAmenitiesQuery } from '../queries/GetHostRoomAmenitiesQuery';

export class GetHostRoomAmenitiesQueryHandler implements IQueryHandler<
  GetHostRoomAmenitiesQuery,
  AmenityOutput[]
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(query: GetHostRoomAmenitiesQuery): Promise<AmenityOutput[]> {
    await this.assertHostRoomOwnership.assert(
      query.authUser,
      query.propertyId,
      query.roomId,
    );

    return QueryBus.execute(new ListRoomAmenitiesQuery(query.roomId));
  }
}
