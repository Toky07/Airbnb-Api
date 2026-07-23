import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomBlockedDateRepository } from '../../../domain/repositories/room-blocked-date.repository';
import { RoomBlockedDateOutput } from '../../dto/room-blocked-date.output';
import type { ListRoomBlockedDatesQuery } from '../queries/ListRoomBlockedDatesQuery';

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
