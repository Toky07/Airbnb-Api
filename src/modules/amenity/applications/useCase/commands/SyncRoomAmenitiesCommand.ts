import type { SyncAmenitiesDto } from '../../dto/create-amenity.dto';

export class SyncRoomAmenitiesCommand {
  constructor(
    public readonly roomId: number,
    public readonly dto: SyncAmenitiesDto,
  ) {}
}
