import type { SyncAmenitiesDto } from '@src/modules/amenity/applications/dto/sync-amenities.dto';

export class SyncRoomAmenitiesCommand {
  constructor(
    public readonly roomId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
