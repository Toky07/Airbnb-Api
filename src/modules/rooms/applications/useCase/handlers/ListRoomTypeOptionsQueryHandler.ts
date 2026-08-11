import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomTypeRepository } from '@src/modules/rooms/domain/repositories/room-type.repository';
import { RoomTypeOutput } from '@src/modules/rooms/applications/dto/room-type.output';
import type { ListRoomTypeOptionsQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypeOptionsQuery';

export class ListRoomTypeOptionsQueryHandler implements IQueryHandler<
  ListRoomTypeOptionsQuery,
  RoomTypeOutput[]
> {
  constructor(private readonly repository: IRoomTypeRepository) {}

  async execute(_query: ListRoomTypeOptionsQuery): Promise<RoomTypeOutput[]> {
    const types = await this.repository.findActive();
    return types.map(RoomTypeOutput.fromDomain);
  }
}
