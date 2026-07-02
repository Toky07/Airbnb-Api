import type { PaginatedResult } from '../../../../../shared/pagination/pagination.types';
import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '../../../domain/repositories/room.repository';
import { RoomOutput } from '../../dto/room.output';
import type { RoomMediaPresenter } from '../../presenters/room-media.presenter';
import type { ListRoomsQuery } from '../queries/ListRoomsQuery';

export class ListRoomsQueryHandler
  implements IQueryHandler<ListRoomsQuery, PaginatedResult<RoomOutput>>
{
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
