import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { ListRoomRateOverridesQuery } from '@src/modules/rooms/contracts';
import { RoomRateOverrideOutput } from '@src/modules/rooms/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { ListHostRoomRateOverridesQuery } from '@src/modules/host/applications/useCase/queries/ListHostRoomRateOverridesQuery';

export class ListHostRoomRateOverridesQueryHandler implements IQueryHandler<
  ListHostRoomRateOverridesQuery,
  RoomRateOverrideOutput[]
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(
    query: ListHostRoomRateOverridesQuery,
  ): Promise<RoomRateOverrideOutput[]> {
    await this.assertHostRoomOwnership.assert(
      query.authUser,
      query.propertyId,
      query.roomId,
    );

    return QueryBus.execute(new ListRoomRateOverridesQuery(query.roomId));
  }
}
