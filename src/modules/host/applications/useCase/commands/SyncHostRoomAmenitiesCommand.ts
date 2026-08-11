import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { SyncAmenitiesDto } from '@src/modules/amenity/contracts';

export class SyncHostRoomAmenitiesCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
