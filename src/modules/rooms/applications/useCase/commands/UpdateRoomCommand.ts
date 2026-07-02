import type { CreateRoomDto } from '../../dto/createRoom.dto';
import type { UploadFile } from '../../../../media/types/upload-file';

export class UpdateRoomCommand {
  constructor(
    public readonly id: number,
    public readonly dto: CreateRoomDto,
    public readonly images?: UploadFile[],
    public readonly keptImagePaths?: string[],
  ) {}
}
