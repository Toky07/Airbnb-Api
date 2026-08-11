import type { IQueryHandler } from '@src/shared/useCase/bus/query-handler.interface';
import type { IRoomTypeRepository } from '@src/modules/rooms/domain/repositories/room-type.repository';
import { RoomTypeOutput } from '@src/modules/rooms/applications/dto/room-type.output';
import type { ListRoomTypesQuery } from '@src/modules/rooms/applications/useCase/queries/ListRoomTypesQuery';

export class ListRoomTypesQueryHandler implements IQueryHandler<
  ListRoomTypesQuery,
  RoomTypeOutput[]
> {
  constructor(private readonly repository: IRoomTypeRepository) {}

  async execute(_query: ListRoomTypesQuery): Promise<RoomTypeOutput[]> {
    const types = await this.repository.findAll();
    return types.map(RoomTypeOutput.fromDomain);
  }
}
