import type { UpdateRoomTypeDto } from '../../dto/create-room-type.dto';

export class UpdateRoomTypeCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdateRoomTypeDto,
  ) {}
}
