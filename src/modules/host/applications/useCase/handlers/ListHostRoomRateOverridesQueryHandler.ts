import { ForbiddenException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { ListRoomRateOverridesQuery } from '../../../../rooms/applications/useCase/queries/ListRoomRateOverridesQuery';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomRateOverrideOutput } from '../../../../rooms/applications/dto/room-rate-override.output';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { ListHostRoomRateOverridesQuery } from '../queries/ListHostRoomRateOverridesQuery';

export class ListHostRoomRateOverridesQueryHandler implements IQueryHandler<
  ListHostRoomRateOverridesQuery,
  RoomRateOverrideOutput[]
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    query: ListHostRoomRateOverridesQuery,
  ): Promise<RoomRateOverrideOutput[]> {
    const property = await this.resolveHostProperty.requireOwned(
      query.authUser,
      query.propertyId,
    );
    const room = await QueryBus.execute<RoomOutput | null>(
      new FindRoomQuery({ id: query.roomId }),
    );

    if (!room || room.property.id !== property.id) {
      throw new ForbiddenException('Chambre introuvable ou accès refusé.');
    }

    return QueryBus.execute(new ListRoomRateOverridesQuery(query.roomId));
  }
}
