import type { CreatePropertyDto } from '../../dto/createProperty.dto';
import type { UploadFile } from '../../../../media/contracts';

export class CreatePropertyCommand {
  constructor(
    public readonly dto: CreatePropertyDto,
    public readonly image?: UploadFile,
  ) {}
}
