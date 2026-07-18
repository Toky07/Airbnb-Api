import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { SyncAmenitiesDto } from '../../../../amenity/applications/dto/create-amenity.dto';

export class SyncHostRoomAmenitiesCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly roomId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
