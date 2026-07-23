import { ForbiddenException } from '@nestjs/common';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { ListRoomBlockedDatesQuery } from '../../../../rooms/applications/useCase/queries/ListRoomBlockedDatesQuery';
import { FindRoomQuery } from '../../../../rooms/applications/useCase/queries/FindRoomQuery';
import { RoomBlockedDateOutput } from '../../../../rooms/applications/dto/room-blocked-date.output';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { ListHostRoomBlockedDatesQuery } from '../queries/ListHostRoomBlockedDatesQuery';

export class ListHostRoomBlockedDatesQueryHandler implements IQueryHandler<
  ListHostRoomBlockedDatesQuery,
  RoomBlockedDateOutput[]
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    query: ListHostRoomBlockedDatesQuery,
  ): Promise<RoomBlockedDateOutput[]> {
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

    return QueryBus.execute(new ListRoomBlockedDatesQuery(query.roomId));
  }
}
