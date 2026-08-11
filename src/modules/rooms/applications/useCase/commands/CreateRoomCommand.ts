import type { CreateRoomDto } from '@src/modules/rooms/applications/dto/createRoom.dto';
import type { UploadFile } from '@src/modules/media/contracts';

export class CreateRoomCommand {
  constructor(
    public readonly dto: CreateRoomDto,
    public readonly images?: UploadFile[],
  ) {}
}
