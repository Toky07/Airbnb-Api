import type { CreateAmenityDto } from '../../dto/create-amenity.dto';

export class CreateAmenityCommand {
  constructor(public readonly dto: CreateAmenityDto) {}
}
