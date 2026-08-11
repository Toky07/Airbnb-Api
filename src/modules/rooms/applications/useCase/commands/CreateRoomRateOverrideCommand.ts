import type { CreateRoomRateOverrideDto } from '@src/modules/rooms/applications/dto/create-room-rate-override.dto';

export class CreateRoomRateOverrideCommand {
  constructor(
    public readonly roomId: number,
    public readonly dto: CreateRoomRateOverrideDto,
  ) {}
}
