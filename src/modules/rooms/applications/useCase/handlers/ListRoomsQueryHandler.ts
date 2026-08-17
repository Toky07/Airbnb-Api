import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';
import type { RoomMediaPresenter } from '@src/modules/rooms/applications/presenters/room-media.presenter';
import type { ListRoomsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomsQuery';
import { PUBLIC_ROOM_STATUS } from '@src/modules/rooms/domain/utils/is-publicly-listed-room';

export class ListRoomsQueryHandler implements IQueryHandler<
  ListRoomsQuery,
  PaginatedResult<RoomOutput>
> {
  constructor(
    private readonly repository: IRoomRepository,
    private readonly presenter: RoomMediaPresenter,
  ) {}

  async execute(query: ListRoomsQuery): Promise<PaginatedResult<RoomOutput>> {
    const params = query.publicCatalog
      ? { ...query.params, status: PUBLIC_ROOM_STATUS }
      : query.params;
    const result = await this.repository.findPaginated(params);

    const data = await Promise.all(
      result.data.map((room) =>
        this.presenter.toOutput(room, query.publicCatalog),
      ),
    );

    return { data, meta: result.meta };
  }
}
