import type { JwtPayload } from '../../../../authentication/contracts';
import type { CreateRoomRateOverrideDto } from '../../../../rooms/contracts';

export class CreateHostRoomRateOverrideCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: CreateRoomRateOverrideDto,
  ) {}
}
