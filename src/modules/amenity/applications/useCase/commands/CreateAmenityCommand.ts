import type { CreateAmenityDto } from '@src/modules/amenity/applications/dto/create-amenity.dto';

export class CreateAmenityCommand {
  constructor(public readonly dto: CreateAmenityDto) {}
}
