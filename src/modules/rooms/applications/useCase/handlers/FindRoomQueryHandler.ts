import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '../../../domain/repositories/room.repository';
import type { RoomDetailResolver } from '../../services/room-detail.resolver';
import type { FindRoomQuery } from '../queries/FindRoomQuery';

export class FindRoomQueryHandler implements IQueryHandler<
  FindRoomQuery,
  Awaited<ReturnType<RoomDetailResolver['resolve']>>
> {
  constructor(
    private readonly repository: IRoomRepository,
    private readonly roomDetailResolver: RoomDetailResolver,
  ) {}

  async execute(query: FindRoomQuery) {
    const room =
      'id' in query.lookup
        ? await this.repository.findById(query.lookup.id)
        : await this.repository.findBySlug(query.lookup.slug);

    return this.roomDetailResolver.resolve(room);
  }
}
