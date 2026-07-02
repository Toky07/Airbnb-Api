import type { CreatePropertyTypeDto } from '../../dto/create-property-type.dto';

export class CreatePropertyTypeCommand {
  constructor(public readonly dto: CreatePropertyTypeDto) {}
}
