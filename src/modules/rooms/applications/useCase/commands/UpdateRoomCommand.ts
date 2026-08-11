import type { CreateRoomDto } from '@src/modules/rooms/applications/dto/createRoom.dto';
import type { UploadFile } from '@src/modules/media/contracts';

export class UpdateRoomCommand {
  constructor(
    public readonly id: number,
    public readonly dto: CreateRoomDto,
    public readonly images?: UploadFile[],
    public readonly keptImagePaths?: string[],
  ) {}
}
