import type { UpdateAmenityDto } from '@src/modules/amenity/applications/dto/create-amenity.dto';

export class UpdateAmenityCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdateAmenityDto,
  ) {}
}
