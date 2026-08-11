import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { ListRoomsQuery } from '@src/modules/rooms/contracts';
import { RoomOutput } from '@src/modules/rooms/contracts';
import { ResolveHostPropertyService } from '@src/modules/host/applications/services/resolve-host-property.service';
import type { ListHostRoomsQuery } from '@src/modules/host/applications/useCase/queries/ListHostRoomsQuery';

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
