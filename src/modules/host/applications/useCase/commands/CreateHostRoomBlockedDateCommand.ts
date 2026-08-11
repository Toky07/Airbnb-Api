import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { CreateRoomBlockedDateDto } from '../../../../rooms/contracts';

export class CreateHostRoomBlockedDateCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: CreateRoomBlockedDateDto,
  ) {}
}
