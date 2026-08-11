import type { UpdatePropertyTypeDto } from '@src/modules/properties/applications/dto/create-property-type.dto';

export class UpdatePropertyTypeCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdatePropertyTypeDto,
  ) {}
}
