import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import { QueryBus } from '../../../../../shared/useCase/bus/query-bus';
import { ListRoomsQuery } from '../../../../rooms/applications/useCase/queries/ListRoomsQuery';
import { RoomOutput } from '../../../../rooms/applications/dto/room.output';
import { ResolveHostPropertyService } from '../../services/resolve-host-property.service';
import type { ListHostRoomsQuery } from '../queries/ListHostRoomsQuery';

export class ListHostRoomsQueryHandler implements IQueryHandler<
  ListHostRoomsQuery,
  PaginatedResult<RoomOutput>
> {
  constructor(
    private readonly resolveHostProperty: ResolveHostPropertyService,
  ) {}

  async execute(
    query: ListHostRoomsQuery,
  ): Promise<PaginatedResult<RoomOutput>> {
    await this.resolveHostProperty.requireOwned(
      query.authUser,
      query.propertyId,
    );

    return QueryBus.execute(
      new ListRoomsQuery({
        ...query.params,
        propertyId: query.propertyId,
      }),
    );
  }
}
