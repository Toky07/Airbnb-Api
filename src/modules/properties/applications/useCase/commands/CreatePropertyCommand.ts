import type { CreatePropertyDto } from '../../dto/createProperty.dto';
import type { UploadFile } from '../../../../media/types/upload-file';

export class CreatePropertyCommand {
  constructor(
    public readonly dto: CreatePropertyDto,
    public readonly image?: UploadFile,
  ) {}
}
