import type { CreateRoomBlockedDateDto } from '../../dto/create-room-blocked-date.dto';

export class CreateRoomBlockedDateCommand {
  constructor(
    public readonly roomId: number,
    public readonly dto: CreateRoomBlockedDateDto,
  ) {}
}
