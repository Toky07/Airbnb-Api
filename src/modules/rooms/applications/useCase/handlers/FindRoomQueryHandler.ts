import { NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomRepository } from '@src/modules/rooms/domain/repositories/room.repository';
import type { RoomDetailResolver } from '@src/modules/rooms/applications/services/room-detail.resolver';
import type { FindRoomQuery } from '@src/modules/rooms/applications/useCase/queries/FindRoomQuery';
import { isPubliclyListedRoom } from '@src/modules/rooms/domain/utils/is-publicly-listed-room';

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

    if (query.publicCatalog && !isPubliclyListedRoom(room)) {
      throw new NotFoundException('Room not found');
    }

    return this.roomDetailResolver.resolve(room, query.publicCatalog);
  }
}
