import type { CreateRoomTypeDto } from '@src/modules/rooms/applications/dto/create-room-type.dto';

export class CreateRoomTypeCommand {
  constructor(public readonly dto: CreateRoomTypeDto) {}
}
