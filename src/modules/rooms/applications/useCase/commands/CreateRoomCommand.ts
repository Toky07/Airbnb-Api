import type { CreateRoomDto } from '../../dto/createRoom.dto';
import type { UploadFile } from '../../../../media/contracts';

export class CreateRoomCommand {
  constructor(
    public readonly dto: CreateRoomDto,
    public readonly images?: UploadFile[],
  ) {}
}
