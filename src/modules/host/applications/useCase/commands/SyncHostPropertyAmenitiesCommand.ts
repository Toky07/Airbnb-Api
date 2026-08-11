import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { SyncAmenitiesDto } from '../../../../amenity/contracts';

export class SyncHostPropertyAmenitiesCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
