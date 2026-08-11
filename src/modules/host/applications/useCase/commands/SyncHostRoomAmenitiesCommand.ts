import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { SyncAmenitiesDto } from '../../../../amenity/contracts';

export class SyncHostRoomAmenitiesCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
