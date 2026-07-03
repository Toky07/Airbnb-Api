import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomTypeRepository } from '../../../domain/repositories/room-type.repository';
import { RoomTypeOutput } from '../../dto/room-type.output';
import type { ListRoomTypesQuery } from '../queries/ListRoomTypesQuery';

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
