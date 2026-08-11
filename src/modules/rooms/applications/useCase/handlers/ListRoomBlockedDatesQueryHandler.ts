import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomBlockedDateRepository } from '@src/modules/rooms/domain/repositories/room-blocked-date.repository';
import { RoomBlockedDateOutput } from '@src/modules/rooms/applications/dto/room-blocked-date.output';
import type { ListRoomBlockedDatesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomBlockedDatesQuery';

export class ListRoomBlockedDatesQueryHandler implements IQueryHandler<
  ListRoomBlockedDatesQuery,
  RoomBlockedDateOutput[]
> {
  constructor(
    private readonly blockedDateRepository: IRoomBlockedDateRepository,
  ) {}

  async execute(
    query: ListRoomBlockedDatesQuery,
  ): Promise<RoomBlockedDateOutput[]> {
    const items = await this.blockedDateRepository.findByRoomId(query.roomId);
    return items.map((item) => RoomBlockedDateOutput.fromDomain(item));
  }
}
