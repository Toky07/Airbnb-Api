import type { JwtPayload } from '@src/modules/authentication/contracts';
import type { SyncAmenitiesDto } from '@src/modules/amenity/contracts';

export class SyncHostPropertyAmenitiesCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly propertyId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
