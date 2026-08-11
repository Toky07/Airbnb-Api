import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { CreateRoomRateOverrideDto } from '@src/modules/rooms/contracts';

export class CreateHostRoomRateOverrideCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: CreateRoomRateOverrideDto,
  ) {}
}
