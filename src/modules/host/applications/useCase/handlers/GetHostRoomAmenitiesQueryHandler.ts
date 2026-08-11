import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { AmenityOutput } from '@src/modules/amenity/contracts';
import { ListRoomAmenitiesQuery } from '@src/modules/amenity/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { GetHostRoomAmenitiesQuery } from '@src/modules/host/applications/useCase/queries/GetHostRoomAmenitiesQuery';

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
