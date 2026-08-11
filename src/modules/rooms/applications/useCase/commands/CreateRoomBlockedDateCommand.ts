import type { CreateRoomBlockedDateDto } from '@src/modules/rooms/applications/dto/create-room-blocked-date.dto';

export class CreateRoomBlockedDateCommand {
  constructor(
    public readonly roomId: number,
    public readonly dto: CreateRoomBlockedDateDto,
  ) {}
}
