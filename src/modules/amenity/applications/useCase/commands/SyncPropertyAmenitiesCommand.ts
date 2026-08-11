import type { SyncAmenitiesDto } from '@src/modules/amenity/applications/dto/sync-amenities.dto';

export class SyncPropertyAmenitiesCommand {
  constructor(
    public readonly propertyId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
