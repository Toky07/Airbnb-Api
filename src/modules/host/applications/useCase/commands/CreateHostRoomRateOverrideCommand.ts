import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { CreateRoomRateOverrideDto } from '../../../../rooms/applications/dto/create-room-rate-override.dto';

export class CreateHostRoomRateOverrideCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: CreateRoomRateOverrideDto,
  ) {}
}
