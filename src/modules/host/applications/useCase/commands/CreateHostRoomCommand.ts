import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { CreateRoomDto } from '../../../../rooms/contracts';
import type { UploadFile } from '../../../../media/contracts';

export class CreateHostRoomCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly dto: Omit<CreateRoomDto, 'property'>,
    public readonly images?: UploadFile[],
  ) {}
}
