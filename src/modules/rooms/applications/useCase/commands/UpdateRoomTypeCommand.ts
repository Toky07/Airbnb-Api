import type { UpdateRoomTypeDto } from '@src/modules/rooms/applications/dto/create-room-type.dto';

export class UpdateRoomTypeCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdateRoomTypeDto,
  ) {}
}
