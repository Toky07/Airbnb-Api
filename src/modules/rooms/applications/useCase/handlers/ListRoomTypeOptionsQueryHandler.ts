import type { IQueryHandler } from '../../../../../shared/useCase/bus/query-handler.interface';
import type { IRoomTypeRepository } from '../../../domain/repositories/room-type.repository';
import { RoomTypeOutput } from '../../dto/room-type.output';
import type { ListRoomTypeOptionsQuery } from '../queries/ListRoomTypeOptionsQuery';

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
