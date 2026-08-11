import type { SyncAmenitiesDto } from '@src/modules/amenity/applications/dto/create-amenity.dto';

export class SyncPropertyAmenitiesCommand {
  constructor(
    public readonly propertyId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
