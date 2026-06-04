import { Inject, Injectable } from '@nestjs/common';
import { RoomTypeOutput } from '../dto/room-type.output';
import {
  ROOM_TYPE_REPOSITORY,
  type IRoomTypeRepository,
} from '../../domain/repositories/room-type.repository';

@Injectable()
export class ListRoomTypeOptionsUseCase {
  constructor(
    @Inject(ROOM_TYPE_REPOSITORY)
    private readonly repository: IRoomTypeRepository,
  ) {}

  async execute(): Promise<RoomTypeOutput[]> {
    const types = await this.repository.findActive();
    return types.map(RoomTypeOutput.fromDomain);
  }
}
