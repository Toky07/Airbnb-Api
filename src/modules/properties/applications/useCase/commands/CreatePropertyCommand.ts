import type { CreatePropertyDto } from '@src/modules/properties/applications/dto/createProperty.dto';
import type { UploadFile } from '@src/modules/media/contracts';

export class CreatePropertyCommand {
  constructor(
    public readonly dto: CreatePropertyDto,
    public readonly image?: UploadFile,
  ) {}
}
