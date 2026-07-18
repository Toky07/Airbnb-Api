import type { JwtPayload } from '../../../../authentication/domain/types/jwt-payload';
import type { CreatePropertyDto } from '../../../../properties/applications/dto/createProperty.dto';
import type { UploadFile } from '../../../../media/types/upload-file';

export class CreateHostPropertyCommand {
  constructor(
    public readonly authUser: JwtPayload,
    public readonly dto: Omit<CreatePropertyDto, 'ownerId'>,
    public readonly image?: UploadFile,
  ) {}
}
