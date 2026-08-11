import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { ListRoomRateOverridesQuery } from '../../../../rooms/contracts';
import { RoomRateOverrideOutput } from '../../../../rooms/contracts';
import { AssertHostRoomOwnershipService } from '../../services/assert-host-room-ownership.service';
import type { ListHostRoomRateOverridesQuery } from '../queries/ListHostRoomRateOverridesQuery';

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
