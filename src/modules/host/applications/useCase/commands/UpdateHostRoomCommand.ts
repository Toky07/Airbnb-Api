import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { CreateRoomDto } from '@src/modules/rooms/contracts';
import type { UploadFile } from '@src/modules/media/contracts';

export class UpdateHostRoomCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: Omit<CreateRoomDto, 'property'>,
    public readonly images?: UploadFile[],
    public readonly keptImages?: string[],
  ) {}
}
