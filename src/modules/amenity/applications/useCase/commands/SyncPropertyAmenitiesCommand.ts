import type { SyncAmenitiesDto } from '../../dto/create-amenity.dto';

export class SyncPropertyAmenitiesCommand {
  constructor(
    public readonly propertyId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
