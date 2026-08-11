import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { ListRoomBlockedDatesQuery } from '../../../../rooms/contracts';
import { RoomBlockedDateOutput } from '../../../../rooms/contracts';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { ListHostRoomBlockedDatesQuery } from '../queries/ListHostRoomBlockedDatesQuery';

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
