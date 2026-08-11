import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { CreateRoomBlockedDateDto } from '@src/modules/rooms/contracts';

export class CreateHostRoomBlockedDateCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: CreateRoomBlockedDateDto,
  ) {}
}
