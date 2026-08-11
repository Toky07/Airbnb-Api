import type { PaginatedResult } from '@src/shared/pagination/pagination.types';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import { RoomOutput } from '@src/modules/rooms/applications/dto/room.output';
import type { RoomMediaPresenter } from '@src/modules/rooms/applications/presenters/room-media.presenter';
import type { ListRoomsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomsQuery';

export class ListRoomsQueryHandler implements IQueryHandler<
  ListRoomsQuery,
  PaginatedResult<RoomOutput>
> {
  constructor(
    private readonly repository: IRoomRepository,
    private readonly presenter: RoomMediaPresenter,
  ) {}

  async execute(query: ListRoomsQuery): Promise<PaginatedResult<RoomOutput>> {
    const result = await this.repository.findPaginated(query.params);

    const data = await Promise.all(
      result.data.map((room) => this.presenter.toOutput(room)),
    );

    return { data, meta: result.meta };
  }
}
