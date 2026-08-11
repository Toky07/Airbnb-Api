import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { CreateRoomDto } from '../../../../rooms/applications/dto/createRoom.dto';
import type { UploadFile } from '../../../../media/contracts';

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
