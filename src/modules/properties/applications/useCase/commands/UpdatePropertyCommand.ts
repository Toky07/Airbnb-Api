import type { CreatePropertyDto } from '../../dto/createProperty.dto';
import type { UploadFile } from '../../../../media/contracts';

export class UpdatePropertyCommand {
  constructor(
    public readonly id: number,
    public readonly dto: CreatePropertyDto,
    public readonly image?: UploadFile,
  ) {}
}
