import type { UpdateAmenityDto } from '@src/modules/amenity/applications/dto/update-amenity.dto';

export class UpdateAmenityCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdateAmenityDto,
  ) {}
}
