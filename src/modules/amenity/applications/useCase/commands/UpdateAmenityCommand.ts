import type { UpdateAmenityDto } from '../../dto/create-amenity.dto';

export class UpdateAmenityCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdateAmenityDto,
  ) {}
}
