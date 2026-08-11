import type { CreatePropertyTypeDto } from '@src/modules/properties/applications/dto/create-property-type.dto';

export class CreatePropertyTypeCommand {
  constructor(public readonly dto: CreatePropertyTypeDto) {}
}
