import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { ListRoomBlockedDatesQuery } from '@src/modules/rooms/contracts';
import { RoomBlockedDateOutput } from '@src/modules/rooms/contracts';
import { AssertHostRoomOwnershipService } from '@src/modules/host/applications/services/assert-host-room-ownership.service';
import type { ListHostRoomBlockedDatesQuery } from '@src/modules/host/applications/useCase/queries/ListHostRoomBlockedDatesQuery';

export class ListHostRoomBlockedDatesQueryHandler implements IQueryHandler<
  ListHostRoomBlockedDatesQuery,
  RoomBlockedDateOutput[]
> {
  constructor(
    private readonly assertHostRoomOwnership: AssertHostRoomOwnershipService,
  ) {}

  async execute(
    query: ListHostRoomBlockedDatesQuery,
  ): Promise<RoomBlockedDateOutput[]> {
    await this.assertHostRoomOwnership.assert(
      query.authUser,
      query.propertyId,
      query.roomId,
    );

    return QueryBus.execute(new ListRoomBlockedDatesQuery(query.roomId));
  }
}
