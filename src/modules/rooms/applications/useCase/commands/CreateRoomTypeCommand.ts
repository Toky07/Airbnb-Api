import type { CreateRoomTypeDto } from '../../dto/create-room-type.dto';

export class CreateRoomTypeCommand {
  constructor(public readonly dto: CreateRoomTypeDto) {}
}
